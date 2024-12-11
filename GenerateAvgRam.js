const {nanoid} = require('nanoid');
const {MergeJson} = require('@rahadiana/simple_merge_json')
const fs = require('fs')
const path = require('path');
const config = require("./config");

const client = require('redis').createClient(
    {url: `redis://${config.redis_primary.ip}:${config.redis_primary.port}`}
);

const insertData = require('redis').createClient(
    {url: `redis://${config.redis_primary.ip}:${config.redis_primary.port}`}
);

function CreateDir(DURATION, BUYORSELL, SUMMARYTYPE) {
    var dir = `./summary/${SUMMARYTYPE}/${DURATION}/${BUYORSELL}`;
    fs.mkdirSync(dir, {recursive: true});
    fs.mkdirSync(dir + '/tmp', {recursive: true});
    return '';
}

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
                        count: 9999,
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


            // fs.writeFileSync(
            //     __dirname + `/summary/${SUMMARYTYPE}/${GetDuration}/${BuyOrSell}/tmp/${data.replaceAll(':', '-')}.json`,
            //     JSON.stringify(GetAjaibXDataUSDT)
            // )
            
            return resolve('')
        } catch  {
            return resolve({message: 'error', data: data})
        }
    })
}

async function main(SUMMARYTYPE) {

    const DbnameBuy = `COUNT:${SUMMARYTYPE}:buy:*:*:*:*:*`;
    const FindBuyArray = await client.keys(DbnameBuy);
    const FindDurationBuy = FindBuyArray.map(d => d.split(':')[6]);
    const uniqueDataBuy = [...new Set(FindDurationBuy)];

    const DbnameSell = `COUNT:${SUMMARYTYPE}:sell:*:*:*:*:*`;
    const FindSellArray = await client.keys(DbnameSell);
    const FindDurationSell = FindSellArray.map(d => d.split(':')[6]);
    const uniqueDataSell = [...new Set(FindDurationSell)];

    uniqueDataBuy.map(d => CreateDir(d, 'buy', SUMMARYTYPE))
    uniqueDataSell.map(d => CreateDir(d, 'sell', SUMMARYTYPE))

    FindSellArray.map(d => SplitDb(d, SUMMARYTYPE))
    FindBuyArray.map(d => SplitDb(d, SUMMARYTYPE))
    return '';

    // console.log(FindBuyArray) await client.quit();
}

async function BuildAVG(SUMMARYTYPE, DURATION, BUYORSELL) {

    const key = `TMP:SUMMARY:${SUMMARYTYPE}:${BUYORSELL}:${DURATION}`;  // Key untuk Redis Sorted Set
    const keyCOUNT = `TMP:COUNT:${SUMMARYTYPE}:${BUYORSELL}:${DURATION}`;  // Key untuk Redis Sorted Set
    const expireTimeInSeconds = 1000;  // Waktu kadaluarsa dalam detik (misalnya 1 jam)
         
    // Set waktu kadaluarsa untuk key
    await client.expire(key, expireTimeInSeconds);
    await client.expire(keyCOUNT, expireTimeInSeconds);

    console.log({keyCOUNT,key})
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

    await uniqueDataSell.map(async d => await BuildAVG(SUMMARYTYPE, d, "sell"))[0]
    await uniqueDataBuy.map(async d => await BuildAVG(SUMMARYTYPE, d, "buy"))[0]
    return '';
}

function DeleteFolder() {
    const folderPath = path.join(__dirname, 'summary');

    fs.rm(folderPath, { recursive: true, force: true }, (err) => {
        if (err) {
            console.error('Error deleting folder:', err);
        } else {
            console.log('Generate Averege Successfully');
        }
        client.quit();
        insertData.quit();
        process.exit(0); // Paksa keluar setelah semua operasi selesai
    });
}


async function START() {
    await client.connect();
    await insertData.connect();
    await main("FREQ");
    await main("VOLCOIN");
    await names("FREQ")
    await names("VOLCOIN");    
    DeleteFolder();
    return '';
}

async function GenerateAvg() {
    await START()
    return '';
}


GenerateAvg()