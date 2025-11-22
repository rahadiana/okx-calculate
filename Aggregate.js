const { Aggregate,   SwapCoin } = require('@nusantaracode/okx-ws-node');
const { convertTime } = require('@nusantaracode/exchange-time-converter');
const Redis = require('ioredis');
const config = require("./config");
const BaseConfig ={host: config.redis_primary.ip, port: config.redis_primary.port, CountTime:config.CountTime}
const PublishChannel = config.PublishPrivateChannel

// Separate Redis connections: one for counting/pipelines, one for publishing.
const clientCounter = new Redis({
  host: BaseConfig.host,
  port: BaseConfig.port,
});

const publisher = new Redis({
  host: BaseConfig.host,
  port: BaseConfig.port,
});

const ActivityCounter = clientCounter;

function Exit(err){
  console.log('Redis Client Error Aggregate.js', err)
  try { clientCounter.disconnect(); } catch(e){}
  try { publisher.disconnect(); } catch(e){}
  process.exit(1)
}
// Fungsi untuk menghubungkan ke Redis
async function RedistListClient() {
  clientCounter.on('error', (err) => Exit(err));
  publisher.on('error', (err) => Exit(err));
  try {
    // Load the Lua script into the pipeline client so evalsha will work there
    zincrbyResetSha = await clientCounter.script('load', zincrbyResetLua);
    console.log('Loaded Lua script sha:', zincrbyResetSha);
  } catch (err) {
    console.error('Error loading Lua script:', err);
  }
}

const expireTime = BaseConfig.CountTime;
const PROCESS_CHUNK_SIZE = 5; // adjust based on machine capacity

// Lua script: conditionally reset or increment the volume member in the sorted-set.
// If update marker score (stored as slot id) differs from current_slot, reset member to vol.
// Otherwise ZINCRBY the member. Always set update marker score to current_slot.
const zincrbyResetLua = `
  local key = KEYS[1]
  local volMember = ARGV[1]
  local updateMember = ARGV[2]
  local vol = tonumber(ARGV[3])
  local current_slot = ARGV[4]

  local existing_slot = redis.call('ZSCORE', key, updateMember)
  if not existing_slot or tostring(existing_slot) ~= tostring(current_slot) then
    redis.call('ZADD', key, vol, volMember)
    redis.call('ZADD', key, current_slot, updateMember)
  else
    redis.call('ZINCRBY', key, vol, volMember)
    redis.call('ZADD', key, current_slot, updateMember)
  end
  return 1
`;

let zincrbyResetSha = null;

async function publishMessage(channel, message) {
  try {
    const payload = typeof message === 'string' ? message : JSON.stringify(message);
    await publisher.publish(channel, payload);
  } catch (err) {
    console.error("Publish Private Channel error:", err);
  }
}

// Simple per-channel+coin publish rate-limiter to avoid publishing every single incoming
// message. Keep a small in-memory map of last publish timestamps.
const lastPublish = new Map();
const MIN_PUBLISH_INTERVAL_MS = 200; // throttle window

async function publishMessageThrottled(channel, coin) {
  const key = `${channel}:${coin}`;
  const now = Date.now();
  const last = lastPublish.get(key) || 0;
  if (now - last < MIN_PUBLISH_INTERVAL_MS) return; // skip
  lastPublish.set(key, now);
  await publishMessage(channel, coin);
}

async function InsertData(JsonArray, extPipeline = null) {

  const iniNamaKoin = JsonArray.instId;
  const VOLCOIN = Number(JsonArray.sz) || 0;
  const time = convertTime(JsonArray.ts);
  const KeyName = `OKX:SUMMARY:${time.date}:${iniNamaKoin}`;
  const Slide = JsonArray.side;

  // Define intervals for efficiency
  const intervals = [
    { key: '1MENIT', time: time.GetJam + time.GetMenit },
    { key: '5MENIT', time: time.GetJam + time.Get5Minutes },
    { key: '10MENIT', time: time.GetJam + time.Get10Minute },
    { key: '15MENIT', time: time.GetJam + time.Get15Minute },
    { key: '20MENIT', time: time.GetJam + time.Get20Minute },
    { key: '30MENIT', time: time.GetJam + time.Get30Minute },
    { key: '1JAM', time: time.GetJam },
    { key: '2JAM', time: time.Get2Jam },
    { key: '24JAM', time: time.date }
  ];

  // Use provided pipeline if available to batch multiple trades together
  const pipeline = extPipeline || ActivityCounter.pipeline();

  // HITUNG VOL COIN
  intervals.forEach(interval => {
    const volKey = `COUNT:VOLCOIN:${Slide}:${time.year}:${time.month}:${time.date}:${interval.key}:${interval.time}`;
    pipeline.zincrby(volKey, VOLCOIN, `${iniNamaKoin}`);
    pipeline.expire(volKey, expireTime);

    const KeyNameVolume = 'vol_' + Slide + '_' + interval.key;
    const UpdateMember = `update_time_${KeyNameVolume}`;
    // Use pre-loaded Lua (evalsha) when available for performance. Pass
    // numKeys=1 then key1 (KeyName). The remaining params are ARGV in order
    // volMember, updateMember, vol, current_slot.
    if (zincrbyResetSha) {
      pipeline.evalsha(zincrbyResetSha, 1, KeyName, KeyNameVolume, UpdateMember, String(VOLCOIN), String(interval.time));
    } else {
      pipeline.eval(zincrbyResetLua, 1, KeyName, KeyNameVolume, UpdateMember, String(VOLCOIN), String(interval.time));
    }
  });

  // Ensure SUMMARY key expires (single call)
  pipeline.expire(KeyName, 7200);

  // If extPipeline wasn't provided, execute here. Otherwise caller will exec.
  if (!extPipeline) {
    await pipeline.exec().catch(err => console.log('Pipeline error:', err));
  }

  return '';
}
 
async function processFunction(message) {
  if (message.data !== undefined && message.arg.channel==='aggregated-trades') {
    
    const CoinInfo = message.arg.instId
    // Process in controlled chunks to avoid unbounded concurrency and to batch Redis ops
    for (let i = 0; i < message.data.length; i += PROCESS_CHUNK_SIZE) {
      const chunk = message.data.slice(i, i + PROCESS_CHUNK_SIZE);
      const pipeline = ActivityCounter.pipeline();
      for (let d of chunk) {
        const uuu = { instId: CoinInfo, fId: d.fId, lId: d.lId, px: d.px, sz: d.sz, side: d.side, ts: d.ts };
          // Ensure InsertData has completed enqueuing commands before exec
          await InsertData(uuu, pipeline);
      }
      await pipeline.exec().catch(err => console.log('Pipeline error (chunk):', err));
    }


         
      // Throttled publish to avoid overloading subscribers
      await publishMessageThrottled(PublishChannel, CoinInfo);


    }
    // else{
      // console.log('Ignored message:', message);
    // }
}

async function name(params) {
    const coinList = await SwapCoin('asd');

    if (coinList.status === 200) {
        const FilterList = coinList.data.map(d => d.instId)//.filter(d => d.includes("PEPE-USDT"));
        Aggregate(
          FilterList
          // ["BTC-USDT"]
          , processFunction);
    } else {
        console.log(coinList);
    }
}

async function CountAggregate() {
  console.log({BaseConfig})
  await publisher.del('PublishPrivateChannel')
  await publisher.sadd('PublishPrivateChannel', PublishChannel)
  await RedistListClient();
  await name('sad');
}

module.exports = { CountAggregate };

// If this file is executed directly (`node Aggregate.js ...`), start the
// aggregator. This makes the script CLI-friendly while still allowing it to
// be required as a module in tests or other scripts.
if (require.main === module) {
  CountAggregate().catch(err => {
    console.error('CountAggregate error:', err);
    process.exit(1);
  });
}