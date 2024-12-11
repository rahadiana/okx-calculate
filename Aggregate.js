const { Aggregate,   SpotCoin } = require('@nusantaracode/okx-ws-node');
const { convertTime } = require('@nusantaracode/exchange-time-converter');
const Redis = require('ioredis');
const config = require("./config");
const BaseConfig ={host: config.redis_primary.ip, port: config.redis_primary.port, CountTime:config.CountTime}

const client = new Redis({
  host: BaseConfig.host,
  port: BaseConfig.port,
});

const FreqCounter =  client;

function GetStatusBuyOrSell(buy, sell) {
  const TotalFreq = buy + sell;
  const res = Math.ceil((buy / TotalFreq) * 100);
  return isNaN(parseInt(res)) ? 0 : parseInt(res);
}

function Exit(err){
  console.log('Redis Client Error Aggregate.js',err)
  process.exit()
}
// Fungsi untuk menghubungkan ke Redis
async function RedistListClient() {
    await client.on('error Aggregate.js', (err) => Exit(err) );
}

const expireTime = BaseConfig.CountTime;

async function InsertData(JsonArray) {

  // console.log(JsonArray)
  const iniNamaKoin = JsonArray.instId
  const VOLCOIN =JsonArray.sz
  const time = convertTime(JsonArray.ts)
  const KeyName = `OKX:SUMMARY:${iniNamaKoin}` 
  const Slide = JsonArray.side

    //HITUNG frekwensi COIN
  FreqCounter.zincrby(`COUNT:FREQ:${Slide}:${time.year}:${time.month}:${time.date}:1MENIT:${time.GetJam+time.GetMenit}`, 1, `${iniNamaKoin}`).catch(err => { });//ok
  FreqCounter.zincrby(`COUNT:FREQ:${Slide}:${time.year}:${time.month}:${time.date}:5MENIT:${time.GetJam+time.Get5Minutes}`, 1, `${iniNamaKoin}`).catch(err => { });//ok
  FreqCounter.zincrby(`COUNT:FREQ:${Slide}:${time.year}:${time.month}:${time.date}:10MENIT:${time.GetJam+time.Get10Minute}`, 1, `${iniNamaKoin}`).catch(err => { });//ok
  FreqCounter.zincrby(`COUNT:FREQ:${Slide}:${time.year}:${time.month}:${time.date}:15MENIT:${time.GetJam+time.Get15Minute}`, 1, `${iniNamaKoin}`).catch(err => { });//ok
  FreqCounter.zincrby(`COUNT:FREQ:${Slide}:${time.year}:${time.month}:${time.date}:20MENIT:${time.GetJam+time.Get20Minute}`, 1, `${iniNamaKoin}`).catch(err => { });//ok
  FreqCounter.zincrby(`COUNT:FREQ:${Slide}:${time.year}:${time.month}:${time.date}:30MENIT:${time.GetJam+time.Get30Minute}`, 1, `${iniNamaKoin}`).catch(err => { });//ok
  FreqCounter.zincrby(`COUNT:FREQ:${Slide}:${time.year}:${time.month}:${time.date}:1JAM:${time.GetJam}`, 1, `${iniNamaKoin}`).catch(err => { });//ok
  FreqCounter.zincrby(`COUNT:FREQ:${Slide}:${time.year}:${time.month}:${time.date}:2JAM:${time.Get2Jam}`, 1, `${iniNamaKoin}`).catch(err => { });//ok
  
  FreqCounter.expire(`COUNT:FREQ:${Slide}:${time.year}:${time.month}:${time.date}:1MENIT:${time.GetJam+time.GetMenit}`, expireTime).catch(err => { console.log(err) })
  FreqCounter.expire(`COUNT:FREQ:${Slide}:${time.year}:${time.month}:${time.date}:5MENIT:${time.GetJam+time.Get5Minutes}`, expireTime).catch(err => { console.log(err) })
  FreqCounter.expire(`COUNT:FREQ:${Slide}:${time.year}:${time.month}:${time.date}:10MENIT:${time.GetJam+time.Get10Minute}`, expireTime).catch(err => { console.log(err) })
  FreqCounter.expire(`COUNT:FREQ:${Slide}:${time.year}:${time.month}:${time.date}:15MENIT:${time.GetJam+time.Get15Minute}`, expireTime).catch(err => { console.log(err) })
  FreqCounter.expire(`COUNT:FREQ:${Slide}:${time.year}:${time.month}:${time.date}:20MENIT:${time.GetJam+time.Get20Minute}`, expireTime).catch(err => { console.log(err) })
  FreqCounter.expire(`COUNT:FREQ:${Slide}:${time.year}:${time.month}:${time.date}:30MENIT:${time.GetJam+time.Get30Minute}`, expireTime).catch(err => { console.log(err) })
  FreqCounter.expire(`COUNT:FREQ:${Slide}:${time.year}:${time.month}:${time.date}:1JAM:${time.GetJam}`, expireTime).catch(err => { console.log(err) })
  FreqCounter.expire(`COUNT:FREQ:${Slide}:${time.year}:${time.month}:${time.date}:2JAM:${time.Get2Jam}`, expireTime).catch(err => { console.log(err) })

  //HITUNG VOL COIN
  FreqCounter.zincrby(`COUNT:VOLCOIN:${Slide}:${time.year}:${time.month}:${time.date}:1MENIT:${time.GetJam+time.GetMenit}`, VOLCOIN, `${iniNamaKoin}`).catch(err => { });//ok
  FreqCounter.zincrby(`COUNT:VOLCOIN:${Slide}:${time.year}:${time.month}:${time.date}:5MENIT:${time.GetJam+time.Get5Minutes}`, VOLCOIN, `${iniNamaKoin}`).catch(err => { });//ok
  FreqCounter.zincrby(`COUNT:VOLCOIN:${Slide}:${time.year}:${time.month}:${time.date}:10MENIT:${time.GetJam+time.Get10Minute}`, VOLCOIN, `${iniNamaKoin}`).catch(err => { });//ok
  FreqCounter.zincrby(`COUNT:VOLCOIN:${Slide}:${time.year}:${time.month}:${time.date}:15MENIT:${time.GetJam+time.Get15Minute}`, VOLCOIN, `${iniNamaKoin}`).catch(err => { });//ok
  FreqCounter.zincrby(`COUNT:VOLCOIN:${Slide}:${time.year}:${time.month}:${time.date}:20MENIT:${time.GetJam+time.Get20Minute}`, VOLCOIN, `${iniNamaKoin}`).catch(err => { });//ok
  FreqCounter.zincrby(`COUNT:VOLCOIN:${Slide}:${time.year}:${time.month}:${time.date}:30MENIT:${time.GetJam+time.Get30Minute}`, VOLCOIN, `${iniNamaKoin}`).catch(err => { });//ok
  FreqCounter.zincrby(`COUNT:VOLCOIN:${Slide}:${time.year}:${time.month}:${time.date}:1JAM:${time.GetJam}`, VOLCOIN, `${iniNamaKoin}`).catch(err => { });//ok
  FreqCounter.zincrby(`COUNT:VOLCOIN:${Slide}:${time.year}:${time.month}:${time.date}:2JAM:${time.Get2Jam}`, VOLCOIN, `${iniNamaKoin}`).catch(err => { });//ok
  
  FreqCounter.expire(`COUNT:VOLCOIN:${Slide}:${time.year}:${time.month}:${time.date}:1MENIT:${time.GetJam+time.GetMenit}`, expireTime).catch(err => { console.log(err) })
  FreqCounter.expire(`COUNT:VOLCOIN:${Slide}:${time.year}:${time.month}:${time.date}:5MENIT:${time.GetJam+time.Get5Minutes}`, expireTime).catch(err => { console.log(err) })
  FreqCounter.expire(`COUNT:VOLCOIN:${Slide}:${time.year}:${time.month}:${time.date}:10MENIT:${time.GetJam+time.Get10Minute}`, expireTime).catch(err => { console.log(err) })
  FreqCounter.expire(`COUNT:VOLCOIN:${Slide}:${time.year}:${time.month}:${time.date}:15MENIT:${time.GetJam+time.Get15Minute}`, expireTime).catch(err => { console.log(err) })
  FreqCounter.expire(`COUNT:VOLCOIN:${Slide}:${time.year}:${time.month}:${time.date}:20MENIT:${time.GetJam+time.Get20Minute}`, expireTime).catch(err => { console.log(err) })
  FreqCounter.expire(`COUNT:VOLCOIN:${Slide}:${time.year}:${time.month}:${time.date}:30MENIT:${time.GetJam+time.Get30Minute}`, expireTime).catch(err => { console.log(err) })
  FreqCounter.expire(`COUNT:VOLCOIN:${Slide}:${time.year}:${time.month}:${time.date}:1JAM:${time.GetJam}`, expireTime).catch(err => { console.log(err) })
  FreqCounter.expire(`COUNT:VOLCOIN:${Slide}:${time.year}:${time.month}:${time.date}:2JAM:${time.Get2Jam}`, expireTime).catch(err => { console.log(err) })

  client.zadd(KeyName, JsonArray.ts, 'update_time').catch(err => console.log(err));

  await GeneRateSummary(JsonArray)
  await GeneRateSummaryVOLCOIN(JsonArray)

   return '';
 }

 async function GeneRateSummary(JsonArray) {
  const iniNamaKoin = JsonArray.instId;
  const time = convertTime(JsonArray.ts);

  // Menggunakan Promise.all untuk menjalankan semua zscore Redis sekaligus
  const [Minute_1_buy,
    Minute_5_buy, Minute_10_buy, Minute_15_buy, Minute_20_buy, Minute_30_buy, Minute_60_buy, Minute_120_buy,      
    Minute_1_sell, Minute_5_sell, Minute_10_sell, Minute_15_sell, Minute_20_sell, Minute_30_sell, Minute_60_sell, Minute_120_sell
  ] = await Promise.all([
    FreqCounter.zscore(`COUNT:FREQ:buy:${time.year}:${time.month}:${time.date}:1MENIT:${time.GetJam+time.GetMenit}`, iniNamaKoin),
    FreqCounter.zscore(`COUNT:FREQ:buy:${time.year}:${time.month}:${time.date}:5MENIT:${time.GetJam+time.Get5Minutes}`, iniNamaKoin),
    FreqCounter.zscore(`COUNT:FREQ:buy:${time.year}:${time.month}:${time.date}:10MENIT:${time.GetJam+time.Get10Minute}`, iniNamaKoin),
    FreqCounter.zscore(`COUNT:FREQ:buy:${time.year}:${time.month}:${time.date}:15MENIT:${time.GetJam+time.Get15Minute}`, iniNamaKoin),
    FreqCounter.zscore(`COUNT:FREQ:buy:${time.year}:${time.month}:${time.date}:20MENIT:${time.GetJam+time.Get20Minute}`, iniNamaKoin),
    FreqCounter.zscore(`COUNT:FREQ:buy:${time.year}:${time.month}:${time.date}:30MENIT:${time.GetJam+time.Get30Minute}`, iniNamaKoin),
    FreqCounter.zscore(`COUNT:FREQ:buy:${time.year}:${time.month}:${time.date}:1JAM:${time.GetJam}`, iniNamaKoin),
    FreqCounter.zscore(`COUNT:FREQ:buy:${time.year}:${time.month}:${time.date}:2JAM:${time.Get2Jam}`, iniNamaKoin),
    
    FreqCounter.zscore(`COUNT:FREQ:sell:${time.year}:${time.month}:${time.date}:1MENIT:${time.GetJam+time.GetMenit}`, iniNamaKoin),
    FreqCounter.zscore(`COUNT:FREQ:sell:${time.year}:${time.month}:${time.date}:5MENIT:${time.GetJam+time.Get5Minutes}`, iniNamaKoin),
    FreqCounter.zscore(`COUNT:FREQ:sell:${time.year}:${time.month}:${time.date}:10MENIT:${time.GetJam+time.Get10Minute}`, iniNamaKoin),
    FreqCounter.zscore(`COUNT:FREQ:sell:${time.year}:${time.month}:${time.date}:15MENIT:${time.GetJam+time.Get15Minute}`, iniNamaKoin),
    FreqCounter.zscore(`COUNT:FREQ:sell:${time.year}:${time.month}:${time.date}:20MENIT:${time.GetJam+time.Get20Minute}`, iniNamaKoin),
    FreqCounter.zscore(`COUNT:FREQ:sell:${time.year}:${time.month}:${time.date}:30MENIT:${time.GetJam+time.Get30Minute}`, iniNamaKoin),
    FreqCounter.zscore(`COUNT:FREQ:sell:${time.year}:${time.month}:${time.date}:1JAM:${time.GetJam}`, iniNamaKoin),
    FreqCounter.zscore(`COUNT:FREQ:sell:${time.year}:${time.month}:${time.date}:2JAM:${time.Get2Jam}`, iniNamaKoin)
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
    )
  };

  // console.log(f)
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
    f.overall_buy, 'sum_overall_buy',
    //count data
    d.Minute1_buy, 'count_FREQ_minute1_buy',
    d.Minute_5_buy, 'count_FREQ_minute_5_buy',
    d.Minute_10_buy, 'count_FREQ_minute_10_buy',
    d.Minute_15_buy, 'count_FREQ_minute_15_buy',
    d.Minute_20_buy, 'count_FREQ_minute_20_buy',
    d.Minute_30_buy, 'count_FREQ_minute_30_buy',
    d.Minute_60_buy, 'count_FREQ_minute_60_buy',
    d.Minute_120_buy, 'count_FREQ_minute_120_buy',
    d.Minute1_sell, 'count_FREQ_minute1_sell',
    d.Minute_5_sell, 'count_FREQ_minute_5_sell',
    d.Minute_10_sell, 'count_FREQ_minute_10_sell',
    d.Minute_15_sell, 'count_FREQ_minute_15_sell',
    d.Minute_20_sell, 'count_FREQ_minute_20_sell',
    d.Minute_30_sell, 'count_FREQ_minute_30_sell',
    d.Minute_60_sell, 'count_FREQ_minute_60_sell',
    d.Minute_120_sell, 'count_FREQ_minute_120_sell',

    Date.now()- JsonArray.ts,'delay_ms_aggrade'
).catch(err => console.log(err));

   return '';
}

async function GeneRateSummaryVOLCOIN(JsonArray) {
  const iniNamaKoin = JsonArray.instId;
  const time = convertTime(JsonArray.ts);

  const [VOL_Minute_1_buy, VOL_Minute_5_buy, VOL_Minute_10_buy, VOL_Minute_15_buy, VOL_Minute_20_buy, VOL_Minute_30_buy, VOL_Minute_60_buy, VOL_Minute_120_buy,      
    VOL_Minute_1_sell, VOL_Minute_5_sell, VOL_Minute_10_sell, VOL_Minute_15_sell, VOL_Minute_20_sell, VOL_Minute_30_sell, VOL_Minute_60_sell, VOL_Minute_120_sell] = await Promise.all([
    FreqCounter.zscore(`COUNT:VOLCOIN:buy:${time.year}:${time.month}:${time.date}:1MENIT:${time.GetJam+time.GetMenit}`, iniNamaKoin),
    FreqCounter.zscore(`COUNT:VOLCOIN:buy:${time.year}:${time.month}:${time.date}:5MENIT:${time.GetJam+time.Get5Minutes}`, iniNamaKoin),
    FreqCounter.zscore(`COUNT:VOLCOIN:buy:${time.year}:${time.month}:${time.date}:10MENIT:${time.GetJam+time.Get10Minute}`, iniNamaKoin),
    FreqCounter.zscore(`COUNT:VOLCOIN:buy:${time.year}:${time.month}:${time.date}:15MENIT:${time.GetJam+time.Get15Minute}`, iniNamaKoin),
    FreqCounter.zscore(`COUNT:VOLCOIN:buy:${time.year}:${time.month}:${time.date}:20MENIT:${time.GetJam+time.Get20Minute}`, iniNamaKoin),
    FreqCounter.zscore(`COUNT:VOLCOIN:buy:${time.year}:${time.month}:${time.date}:30MENIT:${time.GetJam+time.Get30Minute}`, iniNamaKoin),
    FreqCounter.zscore(`COUNT:VOLCOIN:buy:${time.year}:${time.month}:${time.date}:1JAM:${time.GetJam}`, iniNamaKoin),
    FreqCounter.zscore(`COUNT:VOLCOIN:buy:${time.year}:${time.month}:${time.date}:2JAM:${time.Get2Jam}`, iniNamaKoin),
    FreqCounter.zscore(`COUNT:VOLCOIN:sell:${time.year}:${time.month}:${time.date}:1MENIT:${time.GetJam+time.GetMenit}`, iniNamaKoin),
    FreqCounter.zscore(`COUNT:VOLCOIN:sell:${time.year}:${time.month}:${time.date}:5MENIT:${time.GetJam+time.Get5Minutes}`, iniNamaKoin),
    FreqCounter.zscore(`COUNT:VOLCOIN:sell:${time.year}:${time.month}:${time.date}:10MENIT:${time.GetJam+time.Get10Minute}`, iniNamaKoin),
    FreqCounter.zscore(`COUNT:VOLCOIN:sell:${time.year}:${time.month}:${time.date}:15MENIT:${time.GetJam+time.Get15Minute}`, iniNamaKoin),
    FreqCounter.zscore(`COUNT:VOLCOIN:sell:${time.year}:${time.month}:${time.date}:20MENIT:${time.GetJam+time.Get20Minute}`, iniNamaKoin),
    FreqCounter.zscore(`COUNT:VOLCOIN:sell:${time.year}:${time.month}:${time.date}:30MENIT:${time.GetJam+time.Get30Minute}`, iniNamaKoin),
    FreqCounter.zscore(`COUNT:VOLCOIN:sell:${time.year}:${time.month}:${time.date}:1JAM:${time.GetJam}`, iniNamaKoin),
    FreqCounter.zscore(`COUNT:VOLCOIN:sell:${time.year}:${time.month}:${time.date}:2JAM:${time.Get2Jam}`, iniNamaKoin)
  ]);
 
  const x = {
    VOL_Minute1_buy: VOL_Minute_1_buy == null ? 0 : parseInt(VOL_Minute_1_buy),
    VOL_Minute_5_buy: VOL_Minute_5_buy == null ? 0 : parseInt(VOL_Minute_5_buy),
    VOL_Minute_10_buy: VOL_Minute_10_buy == null ? 0 : parseInt(VOL_Minute_10_buy),
    VOL_Minute_15_buy: VOL_Minute_15_buy == null ? 0 : parseInt(VOL_Minute_15_buy),
    VOL_Minute_20_buy: VOL_Minute_20_buy == null ? 0 : parseInt(VOL_Minute_20_buy),
    VOL_Minute_30_buy: VOL_Minute_30_buy == null ? 0 : parseInt(VOL_Minute_30_buy),
    VOL_Minute_60_buy: VOL_Minute_60_buy == null ? 0 : parseInt(VOL_Minute_60_buy),
    VOL_Minute_120_buy: VOL_Minute_120_buy == null ? 0 : parseInt(VOL_Minute_120_buy),
    VOL_Minute1_sell: VOL_Minute_1_sell == null ? 0 : parseInt(VOL_Minute_1_sell),
    VOL_Minute_5_sell: VOL_Minute_5_sell == null ? 0 : parseInt(VOL_Minute_5_sell),
    VOL_Minute_10_sell: VOL_Minute_10_sell == null ? 0 : parseInt(VOL_Minute_10_sell),
    VOL_Minute_15_sell: VOL_Minute_15_sell == null ? 0 : parseInt(VOL_Minute_15_sell),
    VOL_Minute_20_sell: VOL_Minute_20_sell == null ? 0 : parseInt(VOL_Minute_20_sell),
    VOL_Minute_30_sell: VOL_Minute_30_sell == null ? 0 : parseInt(VOL_Minute_30_sell),
    VOL_Minute_60_sell: VOL_Minute_60_sell == null ? 0 : parseInt(VOL_Minute_60_sell),
    VOL_Minute_120_sell: VOL_Minute_120_sell == null ? 0 : parseInt(VOL_Minute_120_sell),
  };

  // Generate the final summary object
  const f = {
    asset_id: iniNamaKoin,
    update_time_VOL: JsonArray.ts,
    VOL_minute1_buy: GetStatusBuyOrSell(x.VOL_Minute1_buy, x.VOL_Minute1_sell),
    VOL_minute_5_buy: GetStatusBuyOrSell(x.VOL_Minute_5_buy, x.VOL_Minute_5_sell),
    VOL_minute_10_buy: GetStatusBuyOrSell(x.VOL_Minute_10_buy, x.VOL_Minute_10_sell),
    VOL_minute_15_buy: GetStatusBuyOrSell(x.VOL_Minute_15_buy, x.VOL_Minute_15_sell),
    VOL_minute_20_buy: GetStatusBuyOrSell(x.VOL_Minute_20_buy, x.VOL_Minute_20_sell),
    VOL_minute_30_buy: GetStatusBuyOrSell(x.VOL_Minute_30_buy, x.VOL_Minute_30_sell),
    VOL_minute_60_buy: GetStatusBuyOrSell(x.VOL_Minute_60_buy, x.VOL_Minute_60_sell),
    VOL_minute_120_buy: GetStatusBuyOrSell(x.VOL_Minute_120_buy, x.VOL_Minute_120_sell),
    VOL_overall_buy: GetStatusBuyOrSell(
      x.VOL_Minute1_buy + x.VOL_Minute_5_buy + x.VOL_Minute_10_buy + x.VOL_Minute_15_buy + x.VOL_Minute_20_buy + x.VOL_Minute_30_buy + x.VOL_Minute_60_buy + x.VOL_Minute_120_buy,
      x.VOL_Minute1_sell + x.VOL_Minute_5_sell + x.VOL_Minute_10_sell + x.VOL_Minute_15_sell + x.VOL_Minute_20_sell + x.VOL_Minute_30_sell + x.VOL_Minute_60_sell + x.VOL_Minute_120_sell
    ),

    delay_ms_VOL: Date.now() - JsonArray.ts,
  };

  // console.log(f)
  const KeyNames = `OKX:SUMMARY:${iniNamaKoin}`

  client.zadd(KeyNames,
    f.VOL_minute1_buy, 'percent_sum_VOL_minute1_buy',
    f.VOL_minute_5_buy, 'percent_sum_VOL_minute_5_buy',
    f.VOL_minute_10_buy, 'percent_sum_VOL_minute_10_buy',
    f.VOL_minute_15_buy, 'percent_sum_VOL_minute_15_buy',
    f.VOL_minute_20_buy, 'percent_sum_VOL_minute_20_buy',
    f.VOL_minute_30_buy, 'percent_sum_VOL_minute_30_buy',
    f.VOL_minute_60_buy, 'percent_sum_VOL_minute_60_buy',
    f.VOL_minute_120_buy, 'percent_sum_VOL_minute_120_buy',
    f.VOL_overall_buy, 'percent_sum_VOL_overall_buy',
    //count data
    x.VOL_Minute1_buy, 'count_VOL_minute1_buy',
    x.VOL_Minute_5_buy, 'count_VOL_minute_5_buy',
    x.VOL_Minute_10_buy, 'count_VOL_minute_10_buy',
    x.VOL_Minute_15_buy, 'count_VOL_minute_15_buy',
    x.VOL_Minute_20_buy, 'count_VOL_minute_20_buy',
    x.VOL_Minute_30_buy, 'count_VOL_minute_30_buy',
    x.VOL_Minute_60_buy, 'count_VOL_minute_60_buy',
    x.VOL_Minute_120_buy, 'count_VOL_minute_120_buy',
    x.VOL_Minute1_sell, 'count_VOL_minute1_sell',
    x.VOL_Minute_5_sell, 'count_VOL_minute_5_sell',
    x.VOL_Minute_10_sell, 'count_VOL_minute_10_sell',
    x.VOL_Minute_15_sell, 'count_VOL_minute_15_sell',
    x.VOL_Minute_20_sell, 'count_VOL_minute_20_sell',
    x.VOL_Minute_30_sell, 'count_VOL_minute_30_sell',
    x.VOL_Minute_60_sell, 'count_VOL_minute_60_sell',
    x.VOL_Minute_120_sell, 'count_VOL_minute_120_sell',
    
    Date.now()- JsonArray.ts,'delay_ms_aggrade_vol'
).catch(err => console.log(err));

   return '';
}

async function processFunction(message) {
  if (message.data !== undefined && message.arg.channel==='aggregated-trades') {
    
    const CoinInfo = message.arg.instId

    // console.log(message)
    message.data.map(d=>{
      const uuu = { instId: CoinInfo, fId: d.fId, lId: d.lId, px: d.px, sz: d.sz, side: d.side, ts: d.ts }
      InsertData(uuu)
    })

    }
}

async function name(params) {
    const coinList = await SpotCoin('asd');

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
  await RedistListClient();
  await name('sad');
}

module.exports = { CountAggregate };