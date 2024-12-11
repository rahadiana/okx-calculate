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

            console.log({db:BuyOrSell,duration:GetDuration,SUMMARYTYPE})

            
            // const key = 'mySortedSet';  // Key untuk Redis Sorted Set
            // const expireTimeInSeconds = 3600;  // Waktu kadaluarsa dalam detik (misalnya 1 jam)
          
            // // Untuk setiap item, gunakan ZINCRBY untuk meningkatkan skor
            // for (const item of data) {
            //   await client.zIncrBy(key, item.score, item.value);
            // }
          
            // // Set waktu kadaluarsa untuk key
            // await client.expire(key, expireTimeInSeconds);


            fs.writeFileSync(
                __dirname + `/summary/${SUMMARYTYPE}/${GetDuration}/${BuyOrSell}/tmp/${data.replaceAll(':', '-')}.json`,
                JSON.stringify(GetAjaibXDataUSDT)
            )
            
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

    
    const MergeJsonData = await MergeJson(
        __dirname + `/summary/${SUMMARYTYPE}/${DURATION}/${BUYORSELL}/tmp/`
    )


    fs.writeFileSync(
        `summary/${SUMMARYTYPE}/${DURATION}/${BUYORSELL}-merge.json`,
        MergeJsonData
    );

    console.log(`summary/${SUMMARYTYPE}/${DURATION}/${BUYORSELL}-merge.json`)

    // Calling the readFileSync() method to read 'input.txt' file
    const data = fs.readFileSync(
        `summary/${SUMMARYTYPE}/${DURATION}/${BUYORSELL}-merge.json`,
        {
            encoding: 'utf8',
            flag: 'r'
        }
    );

    const yyy = JSON.parse(data)
    const uniqueDataSell = [...new Set(yyy.map(d => d.value))];

    function GenerateSummary(COIN_NAME) {
        const totals = yyy
            .filter(d => d.value === COIN_NAME)
            .map(d => d.score)

        const total = totals.reduce((acc, curr) => acc + curr, 0)||0;

        // Menghitung rata-rata dengan membagi total dengan jumlah elemen
        const average = total / totals.length;

        // console.log(`SUM:COIN:${SUMMARYTYPE}:${COIN_NAME}`,`avg_${SUMMARYTYPE}_${BUYORSELL}_${DURATION}`,average)
        
            //add to DB SUM:COIN
            client
            .zAdd(`SUM:COIN:${SUMMARYTYPE}:${COIN_NAME}`, [
                {
                    score: Math.round(average),
                    value: `avg_${SUMMARYTYPE}_${BUYORSELL}_${DURATION}`
                }
            ])
            .catch(err => {
                console.log(err)
            });

        client
            .zAdd(`SUM:COIN:${SUMMARYTYPE}:${COIN_NAME}`, [
                {
                    score: Math.floor(Date.now() / 1000),
                    value: `update_time_${SUMMARYTYPE}`
                }
            ])
            .catch(err => {
                console.log(err)
            });

        client
            .expire(`SUM:COIN:${SUMMARYTYPE}:${COIN_NAME}`, 86400)
            .catch(err => {
                console.log(err)
            })

            //end add to DB SUM:COIN


            //add to DB OKX:SUMMARY
            client
            .zAdd(`OKX:SUMMARY:${COIN_NAME}`, [
                {
                    score: Math.floor(Date.now() / 1000),
                    value: `update_time_${SUMMARYTYPE}`
                }
            ])
            .catch(err => {
                console.log(err)
            });

        client
            .zAdd(`OKX:SUMMARY:${COIN_NAME}`, [
                {
                    score: Math.round(average),
                    value: `avg_${SUMMARYTYPE}_${BUYORSELL}_${DURATION}`
                }
            ])
            .catch(err => {
                console.log(err)
            });

        //end add to DB OKX:SUMMARY
        return '';
    }

    uniqueDataSell.map(d => GenerateSummary(d))
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

module.exports = { GenerateAvg };