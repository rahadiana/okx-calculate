const { convertTime } = require('@nusantaracode/exchange-time-converter');
const Redis = require('ioredis');
const config = require("./config");
const BaseConfig = { host: config.redis_primary.ip, port: config.redis_primary.port, PublishChannel: config.PublishChannel }
const client = new Redis({ host: BaseConfig.host, port: BaseConfig.port });
const publisher = client
const PublishChannel = config.PublishChannel
// Redis client used to read sets / metadata (separate from pub/sub connections)
const dataClient = new Redis({ host: BaseConfig.host, port: BaseConfig.port });

function Exit(err) {
    console.log('Redis Client Error', err)
    process.exit()
}
// Fungsi untuk menghubungkan ke Redis
async function RedistListClient() {
    await client.on('error', (err) => Exit(err));

}

function publishMessage(channel, message) {
    publisher.publish(channel, message, (err, reply) => {
        if (err) {
            console.error("Publish error:", err);
        } else {
            // console.log(`Message published to ${channel}: ${message}`);
        }
    });
}

async function HITUNG(params) {
    try {
        const time = convertTime(Date.now());

        const GetAjaibXDataUSDT = await client.zrangebyscore(
            `OKX:SUMMARY:${time.date}:${params}`,
            '-inf',
            '+inf',
            'WITHSCORES',
            'LIMIT',
            0,
            -1 // count
        );

        const rawData = GetAjaibXDataUSDT;
        // console.log(rawData)
        const keyValuePairs = {};
        for (let i = 0; i < rawData.length; i += 2) {
            const rawScore = parseFloat(rawData[i + 1]);
            keyValuePairs[rawData[i]] = Number(rawScore.toFixed(10)); // Pastikan hasil dalam bentuk desimal
        }

        const coin = {
            coin: params
        };
        // console.log(keyValuePairs)
        const combinedData = {
            ...coin,
            ...keyValuePairs
        };

        return combinedData;
    } catch (error) {
        console.error('Error in HITUNG:', error);
        throw error;
    }
}

function CheckInfinity(value, avg) {
    const persentase = avg !== 0
        ? Math.round((value / avg) * 100)
        : 0; // Atur ke 0 jika rata-rata adalah 0
    return persentase;
}

// Fungsi untuk memproses setiap pesan yang diterima dari WebSocket
async function processFunction(COinName) {
    // console.log(COinName)

    const Datanya = await HITUNG(COinName)
    // const now = Date.now();
    // const EXPIRE = 60000; // 60 detik


    // const countVolMinute1Sell = (now - Datanya.update_time_vol_sell_1MENIT) <= EXPIRE ? Datanya.vol_sell_1MENIT : 0;
    // const countVolMinute5Sell = (now - Datanya.update_time_vol_sell_5MENIT) <= EXPIRE*5 ? Datanya.vol_sell_5MENIT : 0;
    // const countVolMinute10Sell = (now - Datanya.update_time_vol_sell_10MENIT) <= EXPIRE*10 ? Datanya.vol_sell_10MENIT : 0;
    // const countVolMinute15Sell = (now - Datanya.update_time_vol_sell_15MENIT) <= EXPIRE*15 ? Datanya.vol_sell_15MENIT : 0;
    // const countVolMinute20Sell = (now - Datanya.update_time_vol_sell_20MENIT) <= EXPIRE*20 ? Datanya.vol_sell_20MENIT : 0;
    // const countVolMinute30Sell = (now - Datanya.update_time_vol_sell_30MENIT) <= EXPIRE*30 ? Datanya.vol_sell_30MENIT : 0;
    // const countVolMinute60Sell = (now - Datanya.update_time_vol_sell_1JAM) <= EXPIRE*60 ? Datanya.vol_sell_1JAM : 0;
    // const countVolMinute120Sell = (now - Datanya.update_time_vol_sell_2JAM) <= EXPIRE*120 ? Datanya.vol_sell_2JAM : 0;
    // const countVolMinute1440Sell = (now - Datanya.update_time_vol_sell_24JAM) <= EXPIRE*1440 ? Datanya.vol_sell_24JAM : 0;

    // const countVolMinute1Buy = (now - Datanya.update_time_vol_buy_1MENIT) <= EXPIRE ? Datanya.vol_buy_1MENIT : 0;
    // const countVolMinute5Buy = (now - Datanya.update_time_vol_buy_5MENIT) <= EXPIRE*5 ? Datanya.vol_buy_5MENIT : 0;
    // const countVolMinute10Buy = (now - Datanya.update_time_vol_buy_10MENIT) <= EXPIRE*10 ? Datanya.vol_buy_10MENIT : 0;
    // const countVolMinute15Buy = (now - Datanya.update_time_vol_buy_15MENIT) <= EXPIRE*15 ? Datanya.vol_buy_15MENIT : 0;
    // const countVolMinute20Buy = (now - Datanya.update_time_vol_buy_20MENIT) <= EXPIRE*20 ? Datanya.vol_buy_20MENIT : 0;
    // const countVolMinute30Buy = (now - Datanya.update_time_vol_buy_30MENIT) <= EXPIRE*30 ? Datanya.vol_buy_30MENIT : 0;
    // const countVolMinute60Buy = (now - Datanya.update_time_vol_buy_1JAM) <= EXPIRE*60 ? Datanya.vol_buy_1JAM : 0;
    // const countVolMinute120Buy = (now - Datanya.update_time_vol_buy_2JAM) <= EXPIRE*120 ? Datanya.vol_buy_2JAM : 0;
    // const countVolMinute1440Buy = (now - Datanya.update_time_vol_buy_24JAM) <= EXPIRE*1440 ? Datanya.vol_buy_24JAM : 0;

    // const avgVolCoinSell1Menit = Datanya.avg_VOLCOIN_sell_1MENIT || 0;
    // const avgVolCoinSell5Menit = Datanya.avg_VOLCOIN_sell_5MENIT || 0;
    // const avgVolCoinSell10Menit = Datanya.avg_VOLCOIN_sell_10MENIT || 0;
    // const avgVolCoinSell15Menit = Datanya.avg_VOLCOIN_sell_15MENIT || 0;
    // const avgVolCoinSell20Menit = Datanya.avg_VOLCOIN_sell_20MENIT || 0;
    // const avgVolCoinSell30Menit = Datanya.avg_VOLCOIN_sell_30MENIT || 0;
    // const avgVolCoinSell60Menit = Datanya.avg_VOLCOIN_sell_1JAM || 0;
    // const avgVolCoinSell120Menit = Datanya.avg_VOLCOIN_sell_2JAM || 0;
    // const avgVolCoinSell1440Menit = Datanya.avg_VOLCOIN_sell_24JAM || 0;

    // const avgVolCoinBuy1Menit = Datanya.avg_VOLCOIN_buy_1MENIT || 0;
    // const avgVolCoinBuy5Menit = Datanya.avg_VOLCOIN_buy_5MENIT || 0;
    // const avgVolCoinBuy10Menit = Datanya.avg_VOLCOIN_buy_10MENIT || 0;
    // const avgVolCoinBuy15Menit = Datanya.avg_VOLCOIN_buy_15MENIT || 0;
    // const avgVolCoinBuy20Menit = Datanya.avg_VOLCOIN_buy_20MENIT || 0;
    // const avgVolCoinBuy30Menit = Datanya.avg_VOLCOIN_buy_30MENIT || 0;
    // const avgVolCoinBuy60Menit = Datanya.avg_VOLCOIN_buy_1JAM || 0;
    // const avgVolCoinBuy120Menit = Datanya.avg_VOLCOIN_buy_2JAM || 0;
    // const avgVolCoinBuy1440Menit = Datanya.avg_VOLCOIN_buy_24JAM || 0;

    // // 1minute, 5minute, 10minute, 15minute, 20minute, 30minute, 60minute, 120minute


    // Datanya.percent_vol_sell_1min = CheckInfinity(countVolMinute1Sell, avgVolCoinSell1Menit)
    // Datanya.percent_vol_sell_5min = CheckInfinity(countVolMinute5Sell, avgVolCoinSell5Menit)
    // Datanya.percent_vol_sell_10min = CheckInfinity(countVolMinute10Sell, avgVolCoinSell10Menit)
    // Datanya.percent_vol_sell_15min = CheckInfinity(countVolMinute15Sell, avgVolCoinSell15Menit)
    // Datanya.percent_vol_sell_20min = CheckInfinity(countVolMinute20Sell, avgVolCoinSell20Menit)
    // Datanya.percent_vol_sell_30min = CheckInfinity(countVolMinute30Sell, avgVolCoinSell30Menit)
    // Datanya.percent_vol_sell_60min = CheckInfinity(countVolMinute60Sell, avgVolCoinSell60Menit)
    // Datanya.percent_vol_sell_120min = CheckInfinity(countVolMinute120Sell, avgVolCoinSell120Menit)
    // Datanya.percent_vol_sell_1440min = CheckInfinity(countVolMinute1440Sell, avgVolCoinSell1440Menit)

    // Datanya.percent_vol_buy_1min = CheckInfinity(countVolMinute1Buy, avgVolCoinBuy1Menit)
    // Datanya.percent_vol_buy_5min = CheckInfinity(countVolMinute5Buy, avgVolCoinBuy5Menit)
    // Datanya.percent_vol_buy_10min = CheckInfinity(countVolMinute10Buy, avgVolCoinBuy10Menit)
    // Datanya.percent_vol_buy_15min = CheckInfinity(countVolMinute15Buy, avgVolCoinBuy15Menit)
    // Datanya.percent_vol_buy_20min = CheckInfinity(countVolMinute20Buy, avgVolCoinBuy20Menit)
    // Datanya.percent_vol_buy_30min = CheckInfinity(countVolMinute30Buy, avgVolCoinBuy30Menit)
    // Datanya.percent_vol_buy_60min = CheckInfinity(countVolMinute60Buy, avgVolCoinBuy60Menit)
    // Datanya.percent_vol_buy_120min = CheckInfinity(countVolMinute120Buy, avgVolCoinBuy120Menit)
    // Datanya.percent_vol_buy_1440min = CheckInfinity(countVolMinute1440Buy, avgVolCoinBuy1440Menit)
    // Hapus properti `update_time_vol_buy_*` dan `update_time_vol_sell_*`
    // agar field timestamp tidak dikirim ke channel publik
    // Object.keys(Datanya).forEach((key) => {
    //     if (/^update_time_vol_(?:buy|sell)_/.test(key)) {
    //         delete Datanya[key];
    //     }
    // });

    publishMessage(PublishChannel, JSON.stringify(Datanya));
}

async function PublishData(params) {
    console.log({ BaseConfig })
    await RedistListClient();
    await publisher.del('PublishChannel')
    await publisher.sadd('PublishChannel', PublishChannel)
    // Subscribe to any private channels listed in the Redis set 'PublishPrivateChannel'
    try {
        const channels = await dataClient.smembers('PublishPrivateChannel');
        if (channels && channels.length) {
            // create a dedicated subscriber connection for pub/sub
            const subscriber = new Redis({ host: BaseConfig.host, port: BaseConfig.port });
            subscriber.on('error', (err) => Exit(err));
            // subscribe to all channels returned by the set
            await subscriber.subscribe(...channels);
            console.log('Subscribed to private channels:', channels);
            subscriber.on('message', (channel, message) => {
                // console.log('Message from', channel, message);
                // If messages are JSON and match the same shape as incoming websocket messages,
                // forward them to `processFunction`. Otherwise handle as needed here.
                try {
                     // processFunction returns a promise; don't block pub/sub event loop
                    processFunction(message).catch(err => console.error('processFunction error', err));
                } catch (e) {
                    // not JSON — ignore or handle custom formats
                }
            });
        } else {
            console.log('No private channels found in set PublishPrivateChannel');
        }
    } catch (err) {
        console.error('Error subscribing to private channels:', err);
    }
}

module.exports = { PublishData };

// If executed directly, start the publisher (CLI-friendly).
if (require.main === module) {
    PublishData().catch(err => {
        console.error('PublishData error:', err);
        process.exit(1);
    });
}