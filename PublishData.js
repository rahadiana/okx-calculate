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
const crypto = require('crypto');
const client = new Redis({host: '95.217.4.201', port: 6379});
const publisher = client

function generateNanoId(length = 9) {
    // Generate random bytes
    const bytes = crypto.randomBytes(length);

    // Encode to Base64 and make URL-friendly
    return bytes
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '') // Remove padding
        .substring(0, length); // Truncate to desired length
}

const PublishChannel = "AoVxVT1qr" //generateNanoId();

console.log(`Publish Channel: "${PublishChannel}"`);

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

        const GetAjaibXDataUSDT = await client.zrangebyscore(
            `OKX:SUMMARY:${params}`,
            '-inf',
            '+inf',
            'WITHSCORES',
            'LIMIT',
            0,
            9999 // count
        );

        const rawData = GetAjaibXDataUSDT

        const keyValuePairs = {};
        for (let i = 0; i < rawData.length; i += 2) {
            keyValuePairs[rawData[i]] = rawData[i + 1];
        }

        const coin = {
            coin: params
        }
        const combinedData = {
            ...coin,
            ...keyValuePairs
        };

        return resolve(combinedData)

    })

}

// Fungsi untuk memproses setiap pesan yang diterima dari WebSocket
async function processFunction(message) {
    // OKX:SUMMARY:BTC-USDT

    if (message.arg !== undefined && message.arg.channel == "aggregated-trades" && message.event == undefined) {

        const Datanya = await HITUNG(message.data[0].instId)

        publishMessage(PublishChannel, JSON.stringify(Datanya));
    }
}

async function name(params) {
    await RedistListClient();

    const coinList = await SpotCoin('')

    if (coinList.status == 200) {
        await OKXWsAggregate(coinList.data.map(d => d.instId), processFunction);

    } else {
        console.log(coinList)
    }

}

name('')
