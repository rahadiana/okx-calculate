const { Aggregate,   SpotCoin } = require('@nusantaracode/okx-ws-node');
const { convertTime } = require('@nusantaracode/exchange-time-converter');
const Redis = require('ioredis');

// Mengatur koneksi Redis
class RedisClient {
  constructor(host) {
      this.host = host;
      this.port = 6379; // port default
      this.client = new Redis({
          host: this.host,
          port: this.port,
      });

      // Fungsi untuk menangani error dari Redis
      this.client.on('error', (err) => this.Exit(err));
  }

  Exit(err) {
      console.log('Redis Client Error', err);
      process.exit();
  }

  // Anda dapat menambahkan metode lain jika diperlukan
}

const redisConnection = new RedisClient('95.217.4.201'); // Atau host dinamis sesuai kebutuhan

const FreqCounter = redisConnection.client;
const client = redisConnection.client;
 
function Exit(err){
  console.log('Redis Client Error',err)
  process.exit()
}
// Fungsi untuk menghubungkan ke Redis
async function RedistListClient() {
    await client.on('error', (err) => Exit(err) );
}

const expireTime = 604800

async function InsertData(JsonArray) {

  const iniNamaKoin = JsonArray.instId
  const time = convertTime(JsonArray.ts)
  const KeyName = `OKX:SUMMARY:${iniNamaKoin}` 
  const Slide = JsonArray.side

  client.zincrby(`FREQ:${Slide}:${time.year}:${time.month}:${time.date}:1MENIT:${time.GetJam+time.GetMenit}`, 1, `${iniNamaKoin}`).catch(err => { });//ok
  FreqCounter.zincrby(`FREQ:${Slide}:${time.year}:${time.month}:${time.date}:5MENIT:${time.GetJam+time.Get5Minutes}`, 1, `${iniNamaKoin}`).catch(err => { });//ok
  FreqCounter.zincrby(`FREQ:${Slide}:${time.year}:${time.month}:${time.date}:10MENIT:${time.GetJam+time.Get10Minute}`, 1, `${iniNamaKoin}`).catch(err => { });//ok
  FreqCounter.zincrby(`FREQ:${Slide}:${time.year}:${time.month}:${time.date}:15MENIT:${time.GetJam+time.Get15Minute}`, 1, `${iniNamaKoin}`).catch(err => { });//ok
  FreqCounter.zincrby(`FREQ:${Slide}:${time.year}:${time.month}:${time.date}:20MENIT:${time.GetJam+time.Get20Minute}`, 1, `${iniNamaKoin}`).catch(err => { });//ok
  FreqCounter.zincrby(`FREQ:${Slide}:${time.year}:${time.month}:${time.date}:30MENIT:${time.GetJam+time.Get30Minute}`, 1, `${iniNamaKoin}`).catch(err => { });//ok
  FreqCounter.zincrby(`FREQ:${Slide}:${time.year}:${time.month}:${time.date}:1JAM:${time.GetJam}`, 1, `${iniNamaKoin}`).catch(err => { });//ok
  FreqCounter.zincrby(`FREQ:${Slide}:${time.year}:${time.month}:${time.date}:2JAM:${time.Get2Jam}`, 1, `${iniNamaKoin}`).catch(err => { });//ok
  
  FreqCounter.expire(`FREQ:${Slide}:${time.year}:${time.month}:${time.date}:1MENIT:${time.GetJam+time.GetMenit}`, expireTime).catch(err => { console.log(err) })
  FreqCounter.expire(`FREQ:${Slide}:${time.year}:${time.month}:${time.date}:5MENIT:${time.GetJam+time.Get5Minutes}`, expireTime).catch(err => { console.log(err) })
  FreqCounter.expire(`FREQ:${Slide}:${time.year}:${time.month}:${time.date}:10MENIT:${time.GetJam+time.Get10Minute}`, expireTime).catch(err => { console.log(err) })
  FreqCounter.expire(`FREQ:${Slide}:${time.year}:${time.month}:${time.date}:15MENIT:${time.GetJam+time.Get15Minute}`, expireTime).catch(err => { console.log(err) })
  FreqCounter.expire(`FREQ:${Slide}:${time.year}:${time.month}:${time.date}:20MENIT:${time.GetJam+time.Get20Minute}`, expireTime).catch(err => { console.log(err) })
  FreqCounter.expire(`FREQ:${Slide}:${time.year}:${time.month}:${time.date}:30MENIT:${time.GetJam+time.Get30Minute}`, expireTime).catch(err => { console.log(err) })
  FreqCounter.expire(`FREQ:${Slide}:${time.year}:${time.month}:${time.date}:1JAM:${time.GetJam}`, expireTime).catch(err => { console.log(err) })
  FreqCounter.expire(`FREQ:${Slide}:${time.year}:${time.month}:${time.date}:2JAM:${time.Get2Jam}`, expireTime).catch(err => { console.log(err) })

  client.zadd(KeyName, JsonArray.ts, 'update_time').catch(err => console.log(err));

   return '';
 }

 async function GeneRateSummary(JsonArray) {
  const iniNamaKoin = JsonArray.instId;
  const time = convertTime(JsonArray.ts);

  // Menggunakan Promise.all untuk menjalankan semua zscore Redis sekaligus
  const [Minute_1_buy, Minute_5_buy, Minute_10_buy, Minute_15_buy, Minute_20_buy, Minute_30_buy, Minute_60_buy, Minute_120_buy, 
         Minute_1_sell, Minute_5_sell, Minute_10_sell, Minute_15_sell, Minute_20_sell, Minute_30_sell, Minute_60_sell, Minute_120_sell] = await Promise.all([
    FreqCounter.zscore(`FREQ:buy:${time.year}:${time.month}:${time.date}:1MENIT:${time.GetJam+time.GetMenit}`, iniNamaKoin),
    FreqCounter.zscore(`FREQ:buy:${time.year}:${time.month}:${time.date}:5MENIT:${time.GetJam+time.Get5Minutes}`, iniNamaKoin),
    FreqCounter.zscore(`FREQ:buy:${time.year}:${time.month}:${time.date}:10MENIT:${time.GetJam+time.Get10Minute}`, iniNamaKoin),
    FreqCounter.zscore(`FREQ:buy:${time.year}:${time.month}:${time.date}:15MENIT:${time.GetJam+time.Get15Minute}`, iniNamaKoin),
    FreqCounter.zscore(`FREQ:buy:${time.year}:${time.month}:${time.date}:20MENIT:${time.GetJam+time.Get20Minute}`, iniNamaKoin),
    FreqCounter.zscore(`FREQ:buy:${time.year}:${time.month}:${time.date}:30MENIT:${time.GetJam+time.Get30Minute}`, iniNamaKoin),
    FreqCounter.zscore(`FREQ:buy:${time.year}:${time.month}:${time.date}:1JAM:${time.GetJam}`, iniNamaKoin),
    FreqCounter.zscore(`FREQ:buy:${time.year}:${time.month}:${time.date}:2JAM:${time.Get2Jam}`, iniNamaKoin),
    FreqCounter.zscore(`FREQ:sell:${time.year}:${time.month}:${time.date}:1MENIT:${time.GetJam+time.GetMenit}`, iniNamaKoin),
    FreqCounter.zscore(`FREQ:sell:${time.year}:${time.month}:${time.date}:5MENIT:${time.GetJam+time.Get5Minutes}`, iniNamaKoin),
    FreqCounter.zscore(`FREQ:sell:${time.year}:${time.month}:${time.date}:10MENIT:${time.GetJam+time.Get10Minute}`, iniNamaKoin),
    FreqCounter.zscore(`FREQ:sell:${time.year}:${time.month}:${time.date}:15MENIT:${time.GetJam+time.Get15Minute}`, iniNamaKoin),
    FreqCounter.zscore(`FREQ:sell:${time.year}:${time.month}:${time.date}:20MENIT:${time.GetJam+time.Get20Minute}`, iniNamaKoin),
    FreqCounter.zscore(`FREQ:sell:${time.year}:${time.month}:${time.date}:30MENIT:${time.GetJam+time.Get30Minute}`, iniNamaKoin),
    FreqCounter.zscore(`FREQ:sell:${time.year}:${time.month}:${time.date}:1JAM:${time.GetJam}`, iniNamaKoin),
    FreqCounter.zscore(`FREQ:sell:${time.year}:${time.month}:${time.date}:2JAM:${time.Get2Jam}`, iniNamaKoin)
  ]);

  const d = {
    Minute1_buy: Minute_1_buy == null ? 0 : parseInt(Minute_1_buy),
    Minute_5_buy: Minute_5_buy == null ? 0 : parseInt(Minute_5_buy),
    Minute_10_buy: Minute_10_buy == null ? 0 : parseInt(Minute_10_buy),
    Minute_15_buy: Minute_15_buy == null ? 0 : parseInt(Minute_15_buy),
    Minute_20_buy: Minute_20_buy == null ? 0 : parseInt(Minute_20_buy),
    Minute_30_buy: Minute_30_buy == null ? 0 : parseInt(Minute_30_buy),
    Minute_60_buy: Minute_60_buy == null ? 0 : parseInt(Minute_60_buy),
    Minute_120_buy: Minute_120_buy == null ? 0 : parseInt(Minute_120_buy),
    Minute1_sell: Minute_1_sell == null ? 0 : parseInt(Minute_1_sell),
    Minute_5_sell: Minute_5_sell == null ? 0 : parseInt(Minute_5_sell),
    Minute_10_sell: Minute_10_sell == null ? 0 : parseInt(Minute_10_sell),
    Minute_15_sell: Minute_15_sell == null ? 0 : parseInt(Minute_15_sell),
    Minute_20_sell: Minute_20_sell == null ? 0 : parseInt(Minute_20_sell),
    Minute_30_sell: Minute_30_sell == null ? 0 : parseInt(Minute_30_sell),
    Minute_60_sell: Minute_60_sell == null ? 0 : parseInt(Minute_60_sell),
    Minute_120_sell: Minute_120_sell == null ? 0 : parseInt(Minute_120_sell),
  };

  function GetStatusBuyOrSell(buy, sell) {
    const TotalFreq = buy + sell;
    const res = Math.ceil((buy / TotalFreq) * 100);
    return isNaN(parseInt(res)) ? 0 : parseInt(res);
  }

  // Generate the final summary object
  const f = {
    asset_id: iniNamaKoin,
    update_time: JsonArray.ts,
    delay_ms: Date.now() - JsonArray.ts,
    minute1_buy: GetStatusBuyOrSell(d.Minute1_buy, d.Minute1_sell),
    minute_5_buy: GetStatusBuyOrSell(d.Minute_5_buy, d.Minute_5_sell),
    minute_10_buy: GetStatusBuyOrSell(d.Minute_10_buy, d.Minute_10_sell),
    minute_15_buy: GetStatusBuyOrSell(d.Minute_15_buy, d.Minute_15_sell),
    minute_20_buy: GetStatusBuyOrSell(d.Minute_20_buy, d.Minute_20_sell),
    minute_30_buy: GetStatusBuyOrSell(d.Minute_30_buy, d.Minute_30_sell),
    minute_60_buy: GetStatusBuyOrSell(d.Minute_60_buy, d.Minute_60_sell),
    minute_120_buy: GetStatusBuyOrSell(d.Minute_120_buy, d.Minute_120_sell),
    overall_buy: GetStatusBuyOrSell(
      d.Minute1_buy + d.Minute_5_buy + d.Minute_10_buy + d.Minute_15_buy + d.Minute_20_buy + d.Minute_30_buy + d.Minute_60_buy + d.Minute_120_buy,
      d.Minute1_sell + d.Minute_5_sell + d.Minute_10_sell + d.Minute_15_sell + d.Minute_20_sell + d.Minute_30_sell + d.Minute_60_sell + d.Minute_120_sell
    ),
  };

  const KeyNames = `OKX:SUMMARY:${iniNamaKoin}`

  client.zadd(KeyNames, 
    f.update_time, 'sum_update_time',
    f.minute1_buy, 'sum_minute1_buy',
    f.minute_5_buy, 'sum_minute_5_buy',
    f.minute_10_buy, 'sum_minute_10_buy',
    f.minute_15_buy, 'sum_minute_15_buy',
    f.minute_20_buy, 'sum_minute_20_buy',
    f.minute_30_buy, 'sum_minute_30_buy',
    f.minute_60_buy, 'sum_minute_60_buy',
    f.minute_120_buy, 'sum_minute_120_buy',
    f.overall_buy, 'sum_overall_buy'
).catch(err => console.log(err));

   return '';
}

async function processFunction(message) {
  if (message.data !== undefined && message.arg.channel==='aggregated-trades') {
    
    const CoinInfo = message.arg.instId

    message.data.map(d=>{
      const uuu = { instId: CoinInfo, fId: d.fId, lId: d.lId, px: d.px, sz: d.sz, side: d.side, ts: d.ts }
      InsertData(uuu)
      GeneRateSummary(uuu)
    })

    }
}

async function name(params) {
    const coinList = await SpotCoin('asd');

    if (coinList.status === 200) {
        const FilterList = coinList.data.map(d => d.instId)//.filter(d => d.includes("-USDT"));

        Aggregate(
          FilterList
          // ["BTC-USDT"]
          , processFunction);
    } else {
        console.log(coinList);
    }
}

async function CountAggregate() {
  await RedistListClient();
  await name('sad');
}

module.exports = { CountAggregate };