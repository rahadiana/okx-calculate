const { Tickers, SpotCoin } = require('@nusantaracode/okx-ws-node');
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
    const change = ((parseFloat(d.last) - parseFloat(d.sodUtc0)) / parseFloat(d.sodUtc0) * 100).toFixed(2);
    const previous = d.last / (1 + (change / 100));
    return {
        coin: d.instId,
        timestamp: parseInt(d.ts),
        last: isNaN(parseFloat(d.last)) ? 0 : parseFloat(d.last),
        low:  isNaN(parseFloat(d.low24h)) ? 0 : parseFloat(d.low24h),
        high: isNaN(parseFloat(d.high24h)) ? 0 : parseFloat(d.high24h),
        previous: isNaN(parseFloat(previous)) ? 0 : parseFloat(previous),
        change: isNaN(parseFloat(change)) ? 0 : parseFloat(change),
        vol_24fiat: isNaN(parseFloat(d.volCcy24h)) ? 0 : parseFloat(d.volCcy24h),
        vol_24coin: isNaN(parseFloat(d.vol24h)) ? 0 : parseFloat(d.vol24h)
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
      const CoinName = 'OKX:SUMMARY:' + r.coin.toUpperCase();
        
    //   console.log(r)

      // Menambahkan data ke Redis menggunakan zadd tanpa await
      client.zadd('OKX:COIN:LIST', r.change, r.coin.toUpperCase()).catch(err => console.log(err));
      client.expire(CoinName, 1000).catch(err => console.log(err));

      client.zadd(CoinName, 
          r.timestamp, 'update_time',
          r.previous,'previous',
          r.last, 'last',
          r.low, 'low',
          r.high, 'high',
          r.change, 'percent_change',
          r.vol_24coin, 'total_vol',
          r.vol_24fiat, 'total_vol_fiat',
          r.change, `percent_change_10Second_${time.Get10Detik}`,
          r.change, `percent_change_1Min_${parseInt(time.Get1Minute)}`,
          r.change, `percent_change_5Min_${parseInt(time.Get5Minutes)}`,
          r.change, `percent_change_10Min_${time.Get10Minute}`,
          r.change, `percent_change_15Min_${time.Get15Minute}`,
          r.change, `percent_change_20Min_${time.Get20Minute}`,
          r.change, `percent_change_30Min_${time.Get30Minute}`,
          r.change, `percent_change_1jam_${parseInt(time.GetJam)}`,
          r.change, `percent_change_2jam_${parseInt(time.Get2Jam)}`
      ).catch(err => console.log(err));

    }
}

// Fungsi untuk menghapus data yang tidak terpakai setiap 9 detik
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
          await RemoveUnusedData(parseInt(timeData.Get20Minute), parseInt(timeData.Pre20Minute), 'percent_change_20Min_', coinName, Array.from({ length: 6 }, (_, index) => index));
          await RemoveUnusedData(parseInt(timeData.GetJam), parseInt(timeData.PreJam), 'percent_change_1jam_', coinName, Array.from({ length: 24 }, (_, index) => index));
          await RemoveUnusedData(parseInt(timeData.Get2Jam), parseInt(timeData.PreGet2Jam), 'percent_change_2jam_', coinName, Array.from({ length: 24 }, (_, index) => index));
      }
  }, 2000); // Eksekusi setiap 6 detik
}

async function name(params) {
    const coinList = await SpotCoin('asd');

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
    scheduleRemoveUnusedData(); // Menjadwalkan penghapusan data
}

module.exports = { Count };