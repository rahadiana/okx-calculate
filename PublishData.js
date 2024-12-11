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
const BaseConfig ={host: config.redis_primary.ip, port: config.redis_primary.port,PublishChannel:config.PublishChannel}
const client = new Redis({host: BaseConfig.host, port: BaseConfig.port});
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

        console.log(Datanya)

        publishMessage(PublishChannel, JSON.stringify(Datanya));
    }
}

async function PublishData(params) {
    console.log({BaseConfig})
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