const { Tickers, SpotCoin } = require('@nusantaracode/okx-ws-node');
const { convertTime } = require('@nusantaracode/exchange-time-converter');
const Redis = require('ioredis');

// Mengatur koneksi Redis
const client = new Redis({
    host: '95.217.4.201',  // Mengatur host dan port untuk koneksi Redis
    port: 6379,
});

/**
 * Fungsi Exit digunakan untuk menangani error pada koneksi Redis.
 * Jika terjadi error, aplikasi akan menampilkan pesan error dan menghentikan proses.
 */
async function Exit(err) {
  console.log('Redis Client Error', err);
  process.exit();
}

/**
 * Fungsi RedistListClient berfungsi untuk memulai koneksi ke Redis.
 * Fungsi ini juga menetapkan penanganan error jika terjadi kesalahan pada koneksi Redis.
 */
async function RedistListClient() {
    client.on('error', Exit); // Memanggil Exit jika terjadi error pada Redis
}

/**
 * Fungsi Reverse digunakan untuk menghitung beberapa data seperti perubahan harga, harga terakhir,
 * dan volume berdasarkan data yang diterima dari server. Data ini kemudian diubah menjadi bentuk yang dapat disimpan di Redis.
 * 
 * @param {Object} d - Data dari server yang akan diproses
 * @returns {Object} Data yang sudah diubah menjadi bentuk siap simpan ke Redis
 */
function Reverse(d) {
    const change = ((parseFloat(d.last) - parseFloat(d.sodUtc0)) / parseFloat(d.sodUtc0) * 100).toFixed(2);  // Menghitung perubahan harga dalam persentase
    const previous = d.last / (1 + (change / 100));  // Menghitung harga sebelumnya berdasarkan perubahan harga
    return {
        coin: d.instId,  // ID koin
        timestamp: parseInt(d.ts),  // Waktu dalam bentuk timestamp
        last: isNaN(parseFloat(d.last)) ? 0 : parseFloat(d.last),  // Harga terakhir
        low: isNaN(parseFloat(d.low24h)) ? 0 : parseFloat(d.low24h),  // Harga terendah dalam 24 jam
        high: isNaN(parseFloat(d.high24h)) ? 0 : parseFloat(d.high24h),  // Harga tertinggi dalam 24 jam
        previous: isNaN(parseFloat(previous)) ? 0 : parseFloat(previous),  // Harga sebelumnya
        change: isNaN(parseFloat(change)) ? 0 : parseFloat(change),  // Perubahan harga dalam persen
        vol_24fiat: isNaN(parseFloat(d.volCcy24h)) ? 0 : parseFloat(d.volCcy24h),  // Volume dalam mata uang fiat selama 24 jam
        vol_24coin: isNaN(parseFloat(d.vol24h)) ? 0 : parseFloat(d.vol24h)  // Volume koin selama 24 jam
    };
}

/**
 * Fungsi RemoveUnusedData digunakan untuk menghapus data yang tidak lagi dibutuhkan dari Redis.
 * Data ini dihapus berdasarkan interval waktu yang tidak sesuai dengan waktu yang diberikan.
 * 
 * @param {number} time_1 - Waktu pertama yang harus dipertahankan
 * @param {number} time_2 - Waktu kedua yang harus dipertahankan
 * @param {string} MemberName - Prefix nama member yang akan dihapus
 * @param {string} DbName - Nama database Redis tempat data disimpan
 * @param {Array} intervals - Daftar interval waktu yang harus diperiksa
 */
async function RemoveUnusedData(time_1, time_2, MemberName, DbName, intervals) {
    const toRemove = intervals.filter(x => !new Set([parseInt(time_1), parseInt(time_2)]).has(x));  // Filter interval yang tidak diperlukan
    const pipeline = client.pipeline();  // Menggunakan pipeline untuk batch perintah Redis
    toRemove.forEach(d => {
        pipeline.zrem(DbName, MemberName + d);  // Menghapus data yang tidak diperlukan dari Redis
    });
    await pipeline.exec();  // Menjalankan semua perintah dalam pipeline
}

/**
 * Fungsi processFunction digunakan untuk memproses setiap pesan yang diterima dari websocket.
 * Data dari pesan akan diolah menggunakan fungsi Reverse dan kemudian disimpan di Redis.
 * 
 * @param {Object} message - Pesan yang diterima dari websocket
 */
async function processFunction(message) {
    if (message.data !== undefined) {
        const x = message.data[0];  // Mengambil data pertama dari pesan
        const r = Reverse(x);  // Memproses data menjadi bentuk yang bisa disimpan di Redis
        const time = convertTime(r.timestamp);  // Mengonversi timestamp ke bentuk waktu yang lebih terstruktur
        const CoinName = 'OKX:SUMMARY:' + r.coin.toUpperCase();  // Membentuk nama key untuk Redis berdasarkan nama koin

        const pipeline = client.pipeline();  // Menggunakan pipeline untuk batch perintah Redis
        pipeline.zadd('OKX:COIN:LIST', r.change, r.coin.toUpperCase());  // Menambahkan data ke Redis (list koin)
        pipeline.expire(CoinName, 1000);  // Mengatur waktu kedaluwarsa key di Redis (1 detik)
        pipeline.zadd(CoinName,  // Menyimpan data terkait koin (perubahan harga, volume, dll.)
            r.timestamp, 'update_time',
            r.last, 'last',
            r.low, 'low',
            r.high, 'high',
            r.change, 'change',
            r.vol_24coin, 'total_vol',
            r.vol_24fiat, 'total_vol_fiat',
            r.change, `percent_change_10Second_${time.Get10Detik}`,
            r.change, `percent_change_1Min_${parseInt(time.Get1Minute)}`,
            r.change, `percent_change_5Min_${parseInt(time.Get5Minutes)}`,
            r.change, `percent_change_10Min_${time.Get10Minute}`,
            r.change, `percent_change_15Min_${time.Get15Minute}`,
            r.change, `percent_change_20Min_${time.Get20Minute}`,
            r.change, `percent_change_30Min_${time.Get30Minute}`,
            r.change, `change_1jam_${parseInt(time.GetJam)}`,
            r.change, `change_2jam_${parseInt(time.Get2Jam)}`
        );
        await pipeline.exec();  // Menjalankan semua perintah dalam pipeline
    }
}

/**
 * Fungsi scheduleRemoveUnusedData digunakan untuk menghapus data yang tidak terpakai setiap 1 detik.
 * Fungsi ini mengambil semua key koin dari Redis dan memanggil fungsi RemoveUnusedData untuk setiap key.
 */
function scheduleRemoveUnusedData() {
    setInterval(async () => {
        const coinNames = await client.keys('OKX:SUMMARY:*');  // Mengambil semua key terkait koin
        const timeData = convertTime(Date.now());  // Mengonversi waktu sekarang menjadi struktur waktu yang lebih mudah digunakan

        const promises = coinNames.map(async (coinName) => {
            await Promise.all([
                RemoveUnusedData(timeData.Get10Detik, timeData.Prev10Detik, 'percent_change_10Second_', coinName, Array.from({ length: 10 }, (_, index) => index)),
                RemoveUnusedData(timeData.Get1Minute, timeData.Prev1Minute, 'percent_change_1Min_', coinName, Array.from({ length: 10 }, (_, index) => index)),
                RemoveUnusedData(timeData.Get5Minutes, timeData.Prev5Minutes, 'percent_change_5Min_', coinName, [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]),
                RemoveUnusedData(timeData.Get10Minute, timeData.Prev10Minute, 'percent_change_10Min_', coinName, Array.from({ length: 6 }, (_, index) => index)),
                RemoveUnusedData(timeData.Get15Minute, timeData.Prev15Minute, 'percent_change_15Min_', coinName, Array.from({ length: 6 }, (_, index) => index)),
                RemoveUnusedData(timeData.Get20Minute, timeData.Pre20Minute, 'percent_change_20Min_', coinName, Array.from({ length: 6 }, (_, index) => index)),
                RemoveUnusedData(timeData.GetJam, timeData.PreJam, 'change_1jam_', coinName, Array.from({ length: 24 }, (_, index) => index)),
                RemoveUnusedData(timeData.Get2Jam, timeData.PreGet2Jam, 'change_2jam_', coinName, Array.from({ length: 24 }, (_, index) => index))
            ]);
        });

        await Promise.all(promises);  // Menjalankan semua penghapusan data secara paralel
    }, 5000);  // Menjalankan fungsi setiap 5 detik
}

/**
 * Fungsi name digunakan untuk mengambil daftar koin dari server dan memulai proses pengolahan ticker
 * untuk setiap koin dalam daftar tersebut.
 */
async function name() {
    const coinList = await SpotCoin('asd');  // Mengambil daftar koin dari server

    if (coinList.status === 200) {
        const FilterList = coinList.data.map(d => d.instId);  // Membentuk daftar koin yang akan diproses

        Tickers(FilterList, processFunction);  // Memulai pengolahan ticker untuk setiap koin
    } else {
        console.log(coinList);  // Menampilkan error jika pengambilan daftar koin gagal
    }
}

/**
 * Fungsi Count adalah fungsi utama yang menginisialisasi koneksi Redis, memulai pengambilan data koin,
 * dan menjadwalkan penghapusan data yang tidak terpakai.
 */
async function Count() {
    await RedistListClient();  // Menghubungkan ke Redis
    await name();  // Memulai proses pengambilan data koin
    scheduleRemoveUnusedData();  // Menjadwalkan penghapusan data yang tidak terpakai
}

module.exports = { Count };  // Mengekspor fungsi Count untuk digunakan di luar modul
