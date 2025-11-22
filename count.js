const { Tickers, SwapCoin } = require('@nusantaracode/okx-ws-node');
const { convertTime } = require('@nusantaracode/exchange-time-converter');
const config = require("./config");
const Redis = require('ioredis');
const BaseConfig ={host: config.redis_primary.ip, port: config.redis_primary.port}

// Mengatur koneksi Redis
const client = new Redis({
    host: BaseConfig.host,
    port:BaseConfig.port,
});

const FreqCounter = client;

function Exit(err){
  console.log('Redis Client Error on count.js',err)
  process.exit()
}
// Fungsi untuk menghubungkan ke Redis
async function RedistListClient() {
    await client.on('error', (err) => Exit(err) );
}

function Reverse(d) {
    const last = parseFloat(d.last) || 0;
    const open = parseFloat(d.sodUtc0) || parseFloat(d.open24h) || last; // Fallback to last if open is 0
    const change = open !== 0 ? ((last - open) / open * 100).toFixed(2) : 0;
    const previous = open; // Previous is the opening price
    return {
        coin: d.instId,
        timestamp: parseInt(d.ts),
        last: last,
        low: parseFloat(d.low24h) || 0,
        high: parseFloat(d.high24h) || 0,
        previous: parseFloat(previous) || 0,
        change: parseFloat(change) || 0,
        vol_24fiat: parseFloat(d.volCcy24h) || 0,
        vol_24coin: parseFloat(d.vol24h) || 0
    };
}

// Fungsi untuk menghapus data yang tidak terpakai
async function RemoveUnusedData(time_1, time_2, MemberName, DbName, intervals) {
    const toRemove = intervals.filter(x => !new Set([parseInt(time_1), parseInt(time_2)]).has(x));
    await Promise.all(toRemove.map(async d => {
        return client.zrem(DbName, MemberName + d).catch(err => console.error(err)); // Menggunakan zrem
    }));
}

async function processFunction(message) {
  if (message.data !== undefined) {

      const x = message.data[0];
      const r = Reverse(x);
      const time = convertTime(r.timestamp);
      const CoinName = 'OKX:SUMMARY:' + time.date + ':' + r.coin.toUpperCase();
        
      // Debug: log raw data if values are 0
      if (r.last === 0 && r.high === 0 && r.low === 0 && r.previous === 0) {
          console.log('Raw data from OKX:', x);
      }

      // Use pipeline for batch Redis operations to improve efficiency
      const pipeline = client.pipeline();
      const openPrice = Number((r.last / (1 + r.change / 100)).toFixed(3));

      pipeline.zadd('OKX:COIN:LIST', r.change, r.coin.toUpperCase());
      pipeline.expire(CoinName, 1000);
      pipeline.zadd(CoinName,
          openPrice, 'open',
          r.timestamp, 'update_time',
          r.previous,'previous',
          r.last, 'last',
          r.low, 'low',
          r.high, 'high',
          r.change, 'percent_change',
          r.vol_24coin, 'total_vol',
          r.vol_24fiat, 'total_vol_fiat',
        //   r.change, `percent_change_10Second_${time.Get10Detik}`,
        //   r.change, `percent_change_1Min_${parseInt(time.Get1Minute)}`,
        //   r.change, `percent_change_5Min_${parseInt(time.Get5Minutes)}`,
        //   r.change, `percent_change_10Min_${time.Get10Minute}`,
        //   r.change, `percent_change_15Min_${time.Get15Minute}`,
        //   r.change, `percent_change_20Min_${time.Get20Minute}`,
        //   r.change, `percent_change_30Min_${time.Get30Minute}`,
        //   r.change, `percent_change_1jam_${parseInt(time.GetJam)}`,
        //   r.change, `percent_change_2jam_${parseInt(time.Get2Jam)}`
      );

      // Execute pipeline
      await pipeline.exec().catch(err => console.log('Pipeline error in count.js:', err));

    }
}

// Fungsi untuk menghapus data yang tidak terpakai setiap 60 detik (untuk efisiensi HFT)
function scheduleRemoveUnusedData() {
  setInterval(async () => {
      const coinNames = await client.keys('OKX:SUMMARY:*'); // Ambil semua nama koin
      for (const coinName of coinNames) {
          const timeData = convertTime(Date.now()); // Atur waktu sesuai kebutuhan Anda
          
          await RemoveUnusedData(parseInt(timeData.Get10Detik), parseInt(timeData.Prev10Detik), 'percent_change_10Second_', coinName, Array.from({ length: 10 }, (_, index) => index));
          await RemoveUnusedData(parseInt(timeData.Get1Minute), parseInt(timeData.Prev1Minute), 'percent_change_1Min_', coinName, Array.from({ length: 10 }, (_, index) => index));
          await RemoveUnusedData(parseInt(timeData.Get5Minutes), parseInt(timeData.Prev5Minutes), 'percent_change_5Min_', coinName, [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
          await RemoveUnusedData(parseInt(timeData.Get10Minute), parseInt(timeData.Prev10Minute), 'percent_change_10Min_', coinName, Array.from({ length: 6 }, (_, index) => index));
          await RemoveUnusedData(parseInt(timeData.Get15Minute), parseInt(timeData.Prev15Minute), 'percent_change_15Min_', coinName, Array.from({ length: 6 }, (_, index) => index));
          await RemoveUnusedData(parseInt(timeData.Get20Minute), parseInt(timeData.Prev20Minute), 'percent_change_20Min_', coinName, Array.from({ length: 6 }, (_, index) => index));
          await RemoveUnusedData(parseInt(timeData.GetJam), parseInt(timeData.PreJam), 'percent_change_1jam_', coinName, Array.from({ length: 24 }, (_, index) => index));
          await RemoveUnusedData(parseInt(timeData.Get2Jam), parseInt(timeData.PreGet2Jam), 'percent_change_2jam_', coinName, Array.from({ length: 24 }, (_, index) => index));
      }
  }, 60000); // Eksekusi setiap 60 detik untuk mengurangi overhead pada HFT
}

async function name(params) {
    const coinList = await SwapCoin('asd');

    if (coinList.status === 200) {
        const FilterList = coinList.data.map(d => d.instId)//.filter(d => d.includes("PEPE-USDT"));
        Tickers(FilterList, processFunction);
    } else {
        console.log(coinList);
    }
}

async function Count() {
    console.log({BaseConfig})
    await RedistListClient();
    await name('sad');
    // scheduleRemoveUnusedData(); // Menjadwalkan penghapusan data
}

module.exports = { Count };

// If executed directly, start the count service.
if (require.main === module) {
    Count().catch(err => {
        console.error('Count error:', err);
        process.exit(1);
    });
}