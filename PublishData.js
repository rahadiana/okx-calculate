const {
    OKXWsAggregate,
    SpotCoin,
    Aggregate,
    IndexTickers,
    Tickers,
    MarkPrice,
    OptimizedBooks
} = require('@nusantaracode/okx-ws-node');
const Redis = require('ioredis');
const config = require("./config");
const BaseConfig = { host: config.redis_primary.ip, port: config.redis_primary.port, PublishChannel: config.PublishChannel }
const client = new Redis({ host: BaseConfig.host, port: BaseConfig.port });
const publisher = client
const PublishChannel = config.PublishChannel

function Exit(err) {
    console.log('Redis Client Error', err)
    process.exit()
}
// Fungsi untuk menghubungkan ke Redis
async function RedistListClient() {
    await client.on('error', (err) => Exit(err));

}

function CheckInfinity(value, avg) {
    const persentase = avg !== 0
        ? Math.round((value / avg) * 100)
        : 0; // Atur ke 0 jika rata-rata adalah 0
    return persentase;
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
    return new Promise(async (resolve, reject) => {
        try {
            const GetAjaibXDataUSDT = await client.zrangebyscore(
                `OKX:SUMMARY:${params}`,
                '-inf',
                '+inf',
                'WITHSCORES',
                'LIMIT',
                0,
                9999 // count
            );

            const rawData = GetAjaibXDataUSDT;

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

            return resolve(combinedData);
        } catch (error) {
            console.error('Error in HITUNG:', error);
            return reject(error);
        }
    });
}


// Fungsi untuk memproses setiap pesan yang diterima dari WebSocket
async function processFunction(message) {
    // OKX:SUMMARY:BTC-USDT

    if (message.arg !== undefined && message.arg.channel == "aggregated-trades" && message.event == undefined) {

        const Datanya = await HITUNG(message.data[0].instId)

        const countFreqMinute1Sell = Datanya.count_FREQ_minute1_sell || 0;
        const countFreqMinute10Sell = Datanya.count_FREQ_minute_10_sell || 0;
        const countFreqMinute120Sell = Datanya.count_FREQ_minute_120_sell || 0;
        const countFreqMinute15Sell = Datanya.count_FREQ_minute_15_sell || 0;
        const countFreqMinute20Sell = Datanya.count_FREQ_minute_20_sell || 0;
        const countFreqMinute30Sell = Datanya.count_FREQ_minute_30_sell || 0;
        const countFreqMinute60Sell = Datanya.count_FREQ_minute_60_sell || 0;
        const countFreqMinute10Buy = Datanya.count_FREQ_minute_10_buy || 0;
        const countFreqMinute120Buy = Datanya.count_FREQ_minute_120_buy || 0;
        const countFreqMinute15Buy = Datanya.count_FREQ_minute_15_buy || 0;
        const countFreqMinute20Buy = Datanya.count_FREQ_minute_20_buy || 0;
        const countFreqMinute30Buy = Datanya.count_FREQ_minute_30_buy || 0;
        const countFreqMinute60Buy = Datanya.count_FREQ_minute_60_buy || 0;
        const countFreqMinute5Buy = Datanya.count_FREQ_minute_5_buy || 0;

        const avgFreqSell1Menit = Datanya.avg_FREQ_sell_1MENIT || 0;
        const countFreqMinute1Buy = Datanya.count_FREQ_minute1_buy || 0;
        const countFreqMinute5Sell = Datanya.count_FREQ_minute_5_sell || 0;
        const avgFreqBuy5Menit = Datanya.avg_FREQ_buy_5MENIT || 0;
        const avgFreqSell5Menit = Datanya.avg_FREQ_sell_5MENIT || 0;
        const avgFreqBuy60Menit = Datanya.avg_FREQ_buy_1JAM || 0;
        const avgFreqBuy10Menit = Datanya.avg_FREQ_buy_10MENIT || 0;
        const avgFreqSell10Menit = Datanya.avg_FREQ_sell_10MENIT || 0;
        const avgFreqBuy15Menit = Datanya.avg_FREQ_buy_15MENIT || 0;
        const avgFreqSell15Menit = Datanya.avg_FREQ_sell_15MENIT || 0;
        const avgFreqBuy20Menit = Datanya.avg_FREQ_buy_20MENIT || 0;
        const avgFreqSell20Menit = Datanya.avg_FREQ_sell_20MENIT || 0;
        const avgFreqBuy30Menit = Datanya.avg_FREQ_buy_30MENIT || 0;
        const avgFreqSell30Menit = Datanya.avg_FREQ_sell_30MENIT || 0;
        const avgFreqBuy2Jam = Datanya.avg_FREQ_buy_2JAM || 0;
        const avgFreqSell2Jam = Datanya.avg_FREQ_sell_2JAM || 0;
        const avgFreqSell60Menit = Datanya.avg_FREQ_sell_1JAM || 0;
        const avgFreqBuy1Menit = Datanya.avg_FREQ_buy_1MENIT || 0;

        const countVolMinute1Sell = Datanya.count_VOL_minute1_sell || 0;
        const countVolMinute5Sell = Datanya.count_VOL_minute_5_sell || 0;
        const countVolMinute10Sell = Datanya.count_VOL_minute_10_sell || 0;
        const countVolMinute15Sell = Datanya.count_VOL_minute_15_sell || 0;
        const countVolMinute20Sell = Datanya.count_VOL_minute_20_sell || 0;
        const countVolMinute30Sell = Datanya.count_VOL_minute_30_sell || 0;
        const countVolMinute60Sell = Datanya.count_VOL_minute_60_sell || 0;
        const countVolMinute120Sell = Datanya.count_VOL_minute_120_sell || 0;

        const countVolMinute1Buy = Datanya.count_VOL_minute1_buy || 0;
        const countVolMinute5Buy = Datanya.count_VOL_minute_5_buy || 0;
        const countVolMinute10Buy = Datanya.count_VOL_minute_10_buy || 0;
        const countVolMinute15Buy = Datanya.count_VOL_minute_15_buy || 0;
        const countVolMinute20Buy = Datanya.count_VOL_minute_20_buy || 0;
        const countVolMinute30Buy = Datanya.count_VOL_minute_30_buy || 0;
        const countVolMinute60Buy = Datanya.count_VOL_minute_60_buy || 0;
        const countVolMinute120Buy = Datanya.count_VOL_minute_120_buy || 0;


        const avgVolCoinSell1Menit = Datanya.avg_VOLCOIN_sell_1MENIT || 0;
        const avgVolCoinSell5Menit = Datanya.avg_VOLCOIN_sell_5MENIT || 0;
        const avgVolCoinSell10Menit = Datanya.avg_VOLCOIN_sell_10MENIT || 0;
        const avgVolCoinSell15Menit = Datanya.avg_VOLCOIN_sell_15MENIT || 0;
        const avgVolCoinSell20Menit = Datanya.avg_VOLCOIN_sell_20MENIT || 0;
        const avgVolCoinSell30Menit = Datanya.avg_VOLCOIN_sell_30MENIT || 0;
        const avgVolCoinSell60Menit = Datanya.avg_VOLCOIN_sell_1JAM || 0;
        const avgVolCoinSell120Menit = Datanya.avg_VOLCOIN_sell_2JAM || 0;

        const avgVolCoinBuy1Menit = Datanya.avg_VOLCOIN_buy_1MENIT || 0;
        const avgVolCoinBuy5Menit = Datanya.avg_VOLCOIN_buy_5MENIT || 0;
        const avgVolCoinBuy10Menit = Datanya.avg_VOLCOIN_buy_10MENIT || 0;
        const avgVolCoinBuy15Menit = Datanya.avg_VOLCOIN_buy_15MENIT || 0;
        const avgVolCoinBuy20Menit = Datanya.avg_VOLCOIN_buy_20MENIT || 0;
        const avgVolCoinBuy30Menit = Datanya.avg_VOLCOIN_buy_30MENIT || 0;
        const avgVolCoinBuy60Menit = Datanya.avg_VOLCOIN_buy_1JAM || 0;
        const avgVolCoinBuy120Menit = Datanya.avg_VOLCOIN_buy_2JAM || 0;


        // 1minute, 5minute, 10minute, 15minute, 20minute, 30minute, 60minute, 120minute


        

        Datanya.percent_freq_sell_1min = CheckInfinity(countFreqMinute1Sell, avgFreqSell1Menit)
        Datanya.percent_freq_sell_5min = CheckInfinity(countFreqMinute5Sell, avgFreqSell5Menit)
        Datanya.percent_freq_sell_10min = CheckInfinity(countFreqMinute10Sell, avgFreqSell10Menit)
        Datanya.percent_freq_sell_15min = CheckInfinity(countFreqMinute15Sell, avgFreqSell15Menit)
        Datanya.percent_freq_sell_20min = CheckInfinity(countFreqMinute20Sell, avgFreqSell20Menit)
        Datanya.percent_freq_sell_30min = CheckInfinity(countFreqMinute30Sell, avgFreqSell30Menit)
        Datanya.percent_freq_sell_60min = CheckInfinity(countFreqMinute60Sell, avgFreqSell60Menit)
        Datanya.percent_freq_sell_120min = CheckInfinity(countFreqMinute120Sell, avgFreqSell2Jam)

        Datanya.percent_freq_buy_1min = CheckInfinity(countFreqMinute1Buy, avgFreqBuy1Menit)
        Datanya.percent_freq_buy_5min = CheckInfinity(countFreqMinute5Buy, avgFreqBuy5Menit)
        Datanya.percent_freq_buy_10min = CheckInfinity(countFreqMinute10Buy, avgFreqBuy10Menit)
        Datanya.percent_freq_buy_15min = CheckInfinity(countFreqMinute15Buy, avgFreqBuy15Menit)
        Datanya.percent_freq_buy_20min = CheckInfinity(countFreqMinute20Buy, avgFreqBuy20Menit)
        Datanya.percent_freq_buy_30min = CheckInfinity(countFreqMinute30Buy, avgFreqBuy30Menit)
        Datanya.percent_freq_buy_60min = CheckInfinity(countFreqMinute60Buy, avgFreqBuy60Menit)
        Datanya.percent_freq_buy_120min = CheckInfinity(countFreqMinute120Buy, avgFreqBuy2Jam)

        Datanya.percent_vol_sell_1min = CheckInfinity(countVolMinute1Sell, avgVolCoinSell1Menit)
        Datanya.percent_vol_sell_5min = CheckInfinity(countVolMinute5Sell, avgVolCoinSell5Menit)
        Datanya.percent_vol_sell_10min = CheckInfinity(countVolMinute10Sell, avgVolCoinSell10Menit)
        Datanya.percent_vol_sell_15min = CheckInfinity(countVolMinute15Sell, avgVolCoinSell15Menit)
        Datanya.percent_vol_sell_20min = CheckInfinity(countVolMinute20Sell, avgVolCoinSell20Menit)
        Datanya.percent_vol_sell_30min = CheckInfinity(countVolMinute30Sell, avgVolCoinSell30Menit)
        Datanya.percent_vol_sell_60min = CheckInfinity(countVolMinute60Sell, avgVolCoinSell60Menit)
        Datanya.percent_vol_sell_120min = CheckInfinity(countVolMinute120Sell, avgVolCoinSell120Menit)

        Datanya.percent_vol_buy_1min = CheckInfinity(countVolMinute1Buy, avgVolCoinBuy1Menit)
        Datanya.percent_vol_buy_5min = CheckInfinity(countVolMinute5Buy, avgVolCoinBuy5Menit)
        Datanya.percent_vol_buy_10min = CheckInfinity(countVolMinute10Buy, avgVolCoinBuy10Menit)
        Datanya.percent_vol_buy_15min = CheckInfinity(countVolMinute15Buy, avgVolCoinBuy15Menit)
        Datanya.percent_vol_buy_20min = CheckInfinity(countVolMinute20Buy, avgVolCoinBuy20Menit)
        Datanya.percent_vol_buy_30min = CheckInfinity(countVolMinute30Buy, avgVolCoinBuy30Menit)
        Datanya.percent_vol_buy_60min = CheckInfinity(countVolMinute60Buy, avgVolCoinBuy60Menit)
        Datanya.percent_vol_buy_120min = CheckInfinity(countVolMinute120Buy, avgVolCoinBuy120Menit)


        console.log(

            CheckInfinity(countFreqMinute120Sell, avgFreqSell2Jam)
        )



        publishMessage(PublishChannel, JSON.stringify(Datanya));
    }
}

async function PublishData(params) {
    console.log({ BaseConfig })
    await RedistListClient();
    await publisher.del('PublishChannel')
    await publisher.sadd('PublishChannel', PublishChannel)
    const coinList = await SpotCoin('')

    if (coinList.status == 200) {
        await OKXWsAggregate(coinList.data.map(d => d.instId), processFunction);

    } else {
        console.log(coinList)
    }
}

module.exports = { PublishData };