const {nanoid} = require('nanoid');
const {MergeJson} = require('@rahadiana/simple_merge_json')
const fs = require('fs').promises;
const path = require('path');
const config = require("./config");
const { convertTime } = require('@nusantaracode/exchange-time-converter');
const time = convertTime(Date.now());

const client = require('redis').createClient(
    {url: `redis://${config.redis_primary.ip}:${config.redis_primary.port}`}
);

const insertData = require('redis').createClient(
    {url: `redis://${config.redis_primary.ip}:${config.redis_primary.port}`}
);

async function CreateDir(DURATION, BUYORSELL, SUMMARYTYPE) {
    var dir =  __dirname + `/summary/${SUMMARYTYPE}/${DURATION}/${BUYORSELL}`;
    await fs.mkdir(dir, {recursive: true});
    await fs.mkdir(dir + '/tmp', {recursive: true});
    return '';
}

async function SplitDb(data, SUMMARYTYPE) {
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

        await fs.writeFile(
            __dirname + `/summary/${SUMMARYTYPE}/${GetDuration}/${BuyOrSell}/tmp/${data.replaceAll(':', '-')}.json`,
            JSON.stringify(GetAjaibXDataUSDT)
        )
        
        return ''
    } catch (err) {
        return { message: 'error', data: data }
    }
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

    await Promise.all(uniqueDataBuy.map(d => CreateDir(d, 'buy', SUMMARYTYPE)));
    await Promise.all(uniqueDataSell.map(d => CreateDir(d, 'sell', SUMMARYTYPE)));

    await Promise.all(FindSellArray.map(d => SplitDb(d, SUMMARYTYPE)));
    await Promise.all(FindBuyArray.map(d => SplitDb(d, SUMMARYTYPE)));
    return '';

    // console.log(FindBuyArray) await client.quit();
}

async function BuildAVG(SUMMARYTYPE, DURATION, BUYORSELL) {

    
    const MergeJsonData = await MergeJson(
        __dirname + `/summary/${SUMMARYTYPE}/${DURATION}/${BUYORSELL}/tmp/`
    )


    await fs.writeFile(
         __dirname + `/summary/${SUMMARYTYPE}/${DURATION}/${BUYORSELL}-merge.json`,
        MergeJsonData
    );

    console.log( __dirname + `/summary/${SUMMARYTYPE}/${DURATION}/${BUYORSELL}-merge.json`)

    // Calling the readFile() method to read file
    const data = await fs.readFile(
         __dirname + `/summary/${SUMMARYTYPE}/${DURATION}/${BUYORSELL}-merge.json`,
        {
            encoding: 'utf8',
            flag: 'r'
        }
    );

    const yyy = JSON.parse(data)
    const uniqueDataSell = [...new Set(yyy.map(d => d.value))];

    function GenerateSummary(COIN_NAME) {
       try{
        const totals = yyy
        .filter(d => d.value === COIN_NAME)
        .map(d => d.score)||[]

    const total = totals.reduce((acc, curr) => acc + curr, 0)||0;

    // Menghitung rata-rata dengan membagi total dengan jumlah elemen
    const average = total / totals.length;

    if(BUYORSELL === 'buy'){
        console.log(`SUM:COIN:${SUMMARYTYPE}:${COIN_NAME}`,`avg_${SUMMARYTYPE}_${BUYORSELL}_${DURATION}`,average)
    
    }
    
        //add to DB SUM:COIN
        insertData
        .zAdd(`SUM:COIN:${SUMMARYTYPE}:${COIN_NAME}`, [
            {
                score: average,
                value: `avg_${SUMMARYTYPE}_${BUYORSELL}_${DURATION}`
            }
        ])
        .catch(err => {
            console.log(err)
        });

        insertData
        .zAdd(`SUM:COIN:${SUMMARYTYPE}:${COIN_NAME}`, [
            {
                score: Math.floor(Date.now() / 1000),
                value: `update_time_${SUMMARYTYPE}`
            }
        ])
        .catch(err => {
            console.log(err)
        });

        insertData
        .expire(`SUM:COIN:${SUMMARYTYPE}:${COIN_NAME}`, 86400)
        .catch(err => {
            console.log(err)
        })

        //end add to DB SUM:COIN


        //add to DB OKX:SUMMARYASD
        insertData
        .zAdd(`OKX:SUMMARY:${time.date}:${COIN_NAME}`, [
            {
                score: Math.floor(Date.now() / 1000),
                value: `update_time_${SUMMARYTYPE}`
            }
        ])
        .catch(err => {
            console.log(err)
        });

        insertData
        .zAdd(`OKX:SUMMARY:${time.date}:${COIN_NAME}`, [
            {
                score: average,
                value: `avg_${SUMMARYTYPE}_${BUYORSELL}_${DURATION}`
            }
        ])
        .catch(err => {
            console.log(err)
        });

        return '';

       }catch{
        return '';

       }
        //end add to DB OKX:SUMMARY
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

async function DeleteFolder() {
    const folderPath = path.join(__dirname, 'summary');

    try {
        // fs is the promises API (require('fs').promises) so use await
        await fs.rm(folderPath, { recursive: true, force: true });
        console.log('Generate Average Successfully - summary folder removed');
    } catch (err) {
        console.error('Error deleting folder:', err);
    } finally {
        try {
            await client.quit();
        } catch (e) {
            // ignore
        }
        try {
            await insertData.quit();
        } catch (e) {
            // ignore
        }
        // Exit after cleanup
        process.exit(0);
    }
}


async function START() {
    await client.connect();
    await insertData.connect();
    // await main("FREQ");
    await main("VOLCOIN");
    // await names("FREQ")
    await names("VOLCOIN");    
    return '';
}

async function GenerateAvg() {
    await START();
    await client.quit();
    console.log('GenerateAvg completed successfully.');
    await DeleteFolder();
    process.exit(0);
}

module.exports = { GenerateAvg };

// If executed directly, run the GenerateAvg job (CLI-friendly).
if (require.main === module) {
    GenerateAvg().catch(err => {
        console.error('GenerateAvg error:', err);
        process.exit(1);
    });
}