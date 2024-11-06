const {nanoid} = require('nanoid');
const {MergeJson} = require('@rahadiana/simple_merge_json')
const fs = require('fs')
const path = require('path');

const client = require('redis').createClient(
    {url: `redis://95.217.4.201:6379`}
);

const insertData = require('redis').createClient(
    {url: `redis://95.217.4.201:6379`}
);

function CreateDir(DURATION, BUYORSELL, SUMMARYTYPE) {
    var dir = `./summary/${SUMMARYTYPE}/${DURATION}/${BUYORSELL}`;
    fs.mkdirSync(dir, {recursive: true});
    fs.mkdirSync(dir + '/tmp', {recursive: true});
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
            // console.log({db:BuyOrSell,duration:GetDuration,data:GetAjaibXDataUSDT})
            fs.writeFileSync(
                __dirname + `/summary/${SUMMARYTYPE}/${GetDuration}/${BuyOrSell}/tmp/${data.replaceAll(':', '-')}.json`,
                JSON.stringify(GetAjaibXDataUSDT)
            )

            const MergeJsonData = await MergeJson(
                __dirname + `/summary/${SUMMARYTYPE}/${GetDuration}/${BuyOrSell}/tmp/`
            )

            fs.writeFileSync(
                `summary/${SUMMARYTYPE}/${GetDuration}/${BuyOrSell}-merge.json`,
                MergeJsonData
            );

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

    // console.log(FindBuyArray) await client.quit();
}

async function BuildAVG(SUMMARYTYPE, DURATION, BUYORSELL) {

    // Calling the readFileSync() method to read 'input.txt' file
    const data = fs.readFileSync(
        `summary/${SUMMARYTYPE}/${DURATION}/buy-merge.json`,
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

        const total = totals.reduce((acc, curr) => acc + curr, 0);

        // Menghitung rata-rata dengan membagi total dengan jumlah elemen
        const average = total / totals.length;
        
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

    }

    uniqueDataSell.map(d => GenerateSummary(d))
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
}

function DeleteFolder() {

    // Replace with the path of the folder you want to delete
    const folderPath = path.join(__dirname, 'summary');

    // Delete the folder and its contents
    fs.rm(folderPath, {
        recursive: true,
        force: true
    }, async (err) => {
        if (err) {
            console.error('Error deleting folder:', err);
            await client.quit(); 
            await insertData.quit();
            process.exit(true);
        } else {
            console.log('Folder deleted successfully');
            await client.quit(); 
            await insertData.quit();
            process.exit(true);
        }
    });
}

async function GenerateAvg() {
    await client.connect();
    await insertData.connect();
    await main("FREQ");
    await main("VOLCOIN");
    await names("FREQ")
    await names("VOLCOIN");    
    DeleteFolder()
}

module.exports = { GenerateAvg };