const config = require("./config");

const client = require('redis').createClient(
    {url: `redis://${config.redis_primary.ip}:${config.redis_primary.port}`}
);

const insertData = require('redis').createClient(
    {url: `redis://${config.redis_primary.ip}:${config.redis_primary.port}`}
);

async function SplitDb(data, SUMMARYTYPE) {
    return new Promise(async (resolve, reject) => {
        try {

            const DbName = data.split(':')
            const GetDuration = DbName[6]
            const BuyOrSell = DbName[2]
            const GetAjaibXDataUSDT = await client.ZRANGEBYSCORE_WITHSCORES(
                data,
                '-inf',
                '+inf',
                {
                    BY: 'SCORE',
                    LIMIT: {
                        count: -1,
                        offset: 0
                    }
                }
            )

            // console.log({db:BuyOrSell,duration:GetDuration,SUMMARYTYPE})
            const key = `TMP:SUMMARY:${SUMMARYTYPE}:${BuyOrSell}:${GetDuration}`;  // Key untuk Redis Sorted Set
            const keyCOUNT = `TMP:COUNT:${SUMMARYTYPE}:${BuyOrSell}:${GetDuration}`;  // Key untuk Redis Sorted Set
             
            // Untuk setiap item, gunakan ZINCRBY untuk meningkatkan skor
            for (const item of GetAjaibXDataUSDT) {
              await client.zIncrBy(key, item.score, item.value);
              await client.zIncrBy(keyCOUNT, 1, item.value);
            }
            
            return resolve('')
        } catch  {
            return resolve({message: 'error', data: data})
        }
    })
}

async function main(SUMMARYTYPE) {

    const DbnameBuy = `COUNT:${SUMMARYTYPE}:buy:*:*:*:*:*`;
    const FindBuyArray = await client.keys(DbnameBuy);

    const DbnameSell = `COUNT:${SUMMARYTYPE}:sell:*:*:*:*:*`;
    const FindSellArray = await client.keys(DbnameSell);

    FindSellArray.map(d => SplitDb(d, SUMMARYTYPE))
    FindBuyArray.map(d => SplitDb(d, SUMMARYTYPE))
    return '';

    // console.log(FindBuyArray) await client.quit();
}

async function BuildExpire(SUMMARYTYPE, DURATION, BUYORSELL) {

    const key = `TMP:SUMMARY:${SUMMARYTYPE}:${BUYORSELL}:${DURATION}`;  // Key untuk Redis Sorted Set
    const keyCOUNT = `TMP:COUNT:${SUMMARYTYPE}:${BUYORSELL}:${DURATION}`;  // Key untuk Redis Sorted Set
    const expireTimeInSeconds = 1000;  // Waktu kadaluarsa dalam detik (misalnya 1 jam)
         
    // Set waktu kadaluarsa untuk key
    await client.expire(key, expireTimeInSeconds);
    await client.expire(keyCOUNT, expireTimeInSeconds);

    // console.log({keyCOUNT,key})
    return '';
}

async function names(SUMMARYTYPE) {
    const DbnameBuy = `COUNT:${SUMMARYTYPE}:buy:*:*:*:*:*`;
    const FindBuyArray = await client.keys(DbnameBuy);
    const FindDurationBuy = FindBuyArray.map(d => d.split(':')[6]);
    const uniqueDataBuy = [...new Set(FindDurationBuy)];

    const DbnameSell = `COUNT:${SUMMARYTYPE}:sell:*:*:*:*:*`;
    const FindSellArray = await client.keys(DbnameSell);
    const FindDurationSell = FindSellArray.map(d => d.split(':')[6]);
    const uniqueDataSell = [...new Set(FindDurationSell)];

    await uniqueDataSell.map(async d => await BuildExpire(SUMMARYTYPE, d, "sell"))[0]
    await uniqueDataBuy.map(async d => await BuildExpire(SUMMARYTYPE, d, "buy"))[0]
    return '';
}

async function START() {
    await client.connect();
    await insertData.connect();
    await main("FREQ");
    await main("VOLCOIN");
    await names("FREQ")
    await names("VOLCOIN");    
    return '';
}

async function GenerateAvgRam() {
    await START()
    return '';
}

module.exports = { GenerateAvgRam };