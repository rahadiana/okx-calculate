const config = require("./config");

const client = require('redis').createClient(
    { url: `redis://${config.redis_primary.ip}:${config.redis_primary.port}` }
);

const insertData = require('redis').createClient(
    { url: `redis://${config.redis_primary.ip}:${config.redis_primary.port}` }
);


async function GetValueData(data) {
    return await client.ZRANGEBYSCORE_WITHSCORES(
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

}
async function main(SUMMARYTYPE) {
    // TMP:COUNT:VOLCOIN:sell:2JAM
    const DbnameBuy = `TMP:*:*:*:*`;
    const FindBuyArray = await client.keys(DbnameBuy);

    // const DbnameSell = `TMP:COUNT:${SUMMARYTYPE}:*:*`;
    // const FindSellArray = await client.keys(DbnameSell);

    const asal = FindBuyArray.map(d => d.split(':'))

    const GetSUMMARYTYPE = [...new Set(asal.map(d => d[1]))]
    const GetCountType = [...new Set(asal.map(d => d[2]))]
    const GetBuyOrSell = [...new Set(asal.map(d => d[3]))]
    const GetTimeFrame = [...new Set(asal.map(d => d[4]))]

    const SellFreqCOUNT1M = await GetValueData(`TMP:COUNT:FREQ:sell:1MENIT`) || [];
    const SellFreqCOUNT5M = await GetValueData(`TMP:COUNT:FREQ:sell:5MENIT`) || [];
    const SellFreqCOUNT10M = await GetValueData(`TMP:COUNT:FREQ:sell:10MENIT`) || [];
    const SellFreqCOUNT15M = await GetValueData(`TMP:COUNT:FREQ:sell:15MENIT`) || [];
    const SellFreqCOUNT20M = await GetValueData(`TMP:COUNT:FREQ:sell:20MENIT`) || [];
    const SellFreqCOUNT30M = await GetValueData(`TMP:COUNT:FREQ:sell:30MENIT`) || [];
    const SellFreqCOUNT1J = await GetValueData(`TMP:COUNT:FREQ:sell:1JAM`) || [];
    const SellFreqCOUNT2J = await GetValueData(`TMP:COUNT:FREQ:sell:2JAM`) || [];

    const SellFreqSUMMARY1M = await GetValueData(`TMP:SUMMARY:FREQ:sell:1MENIT`) || [];
    const SellFreqSUMMARY5M = await GetValueData(`TMP:SUMMARY:FREQ:sell:5MENIT`) || [];
    const SellFreqSUMMARY10M = await GetValueData(`TMP:SUMMARY:FREQ:sell:10MENIT`) || [];
    const SellFreqSUMMARY15M = await GetValueData(`TMP:SUMMARY:FREQ:sell:15MENIT`) || [];
    const SellFreqSUMMARY20M = await GetValueData(`TMP:SUMMARY:FREQ:sell:20MENIT`) || [];
    const SellFreqSUMMARY30M = await GetValueData(`TMP:SUMMARY:FREQ:sell:30MENIT`) || [];
    const SellFreqSUMMARY1J = await GetValueData(`TMP:SUMMARY:FREQ:sell:1JAM`) || [];
    const SellFreqSUMMARY2J = await GetValueData(`TMP:SUMMARY:FREQ:sell:2JAM`) || [];


    const BuyFreqCOUNT1M = await GetValueData(`TMP:COUNT:FREQ:buy:1MENIT`) || [];
    const BuyFreqCOUNT5M = await GetValueData(`TMP:COUNT:FREQ:buy:5MENIT`) || [];
    const BuyFreqCOUNT10M = await GetValueData(`TMP:COUNT:FREQ:buy:10MENIT`) || [];
    const BuyFreqCOUNT15M = await GetValueData(`TMP:COUNT:FREQ:buy:15MENIT`) || [];
    const BuyFreqCOUNT20M = await GetValueData(`TMP:COUNT:FREQ:buy:20MENIT`) || [];
    const BuyFreqCOUNT30M = await GetValueData(`TMP:COUNT:FREQ:buy:30MENIT`) || [];
    const BuyFreqCOUNT1J = await GetValueData(`TMP:COUNT:FREQ:buy:1JAM`) || [];
    const BuyFreqCOUNT2J = await GetValueData(`TMP:COUNT:FREQ:buy:2JAM`) || [];

    const BuyFreqSUMMARY1M = await GetValueData(`TMP:SUMMARY:FREQ:buy:1MENIT`) || [];
    const BuyFreqSUMMARY5M = await GetValueData(`TMP:SUMMARY:FREQ:buy:5MENIT`) || [];
    const BuyFreqSUMMARY10M = await GetValueData(`TMP:SUMMARY:FREQ:buy:10MENIT`) || [];
    const BuyFreqSUMMARY15M = await GetValueData(`TMP:SUMMARY:FREQ:buy:15MENIT`) || [];
    const BuyFreqSUMMARY20M = await GetValueData(`TMP:SUMMARY:FREQ:buy:20MENIT`) || [];
    const BuyFreqSUMMARY30M = await GetValueData(`TMP:SUMMARY:FREQ:buy:30MENIT`) || [];
    const BuyFreqSUMMARY1J = await GetValueData(`TMP:SUMMARY:FREQ:buy:1JAM`) || [];
    const BuyFreqSUMMARY2J = await GetValueData(`TMP:SUMMARY:FREQ:buy:2JAM`) || [];



    const SellVOLCOINCOUNT1M = await GetValueData(`TMP:COUNT:VOLCOIN:sell:1MENIT`) || [];
    const SellVOLCOINCOUNT5M = await GetValueData(`TMP:COUNT:VOLCOIN:sell:5MENIT`) || [];
    const SellVOLCOINCOUNT10M = await GetValueData(`TMP:COUNT:VOLCOIN:sell:10MENIT`) || [];
    const SellVOLCOINCOUNT15M = await GetValueData(`TMP:COUNT:VOLCOIN:sell:15MENIT`) || [];
    const SellVOLCOINCOUNT20M = await GetValueData(`TMP:COUNT:VOLCOIN:sell:20MENIT`) || [];
    const SellVOLCOINCOUNT30M = await GetValueData(`TMP:COUNT:VOLCOIN:sell:30MENIT`) || [];
    const SellVOLCOINCOUNT1J = await GetValueData(`TMP:COUNT:VOLCOIN:sell:1JAM`) || [];
    const SellVOLCOINCOUNT2J = await GetValueData(`TMP:COUNT:VOLCOIN:sell:2JAM`) || [];

    const SellVOLCOINSUMMARY1M = await GetValueData(`TMP:SUMMARY:VOLCOIN:sell:1MENIT`) || [];
    const SellVOLCOINSUMMARY5M = await GetValueData(`TMP:SUMMARY:VOLCOIN:sell:5MENIT`) || [];
    const SellVOLCOINSUMMARY10M = await GetValueData(`TMP:SUMMARY:VOLCOIN:sell:10MENIT`) || [];
    const SellVOLCOINSUMMARY15M = await GetValueData(`TMP:SUMMARY:VOLCOIN:sell:15MENIT`) || [];
    const SellVOLCOINSUMMARY20M = await GetValueData(`TMP:SUMMARY:VOLCOIN:sell:20MENIT`) || [];
    const SellVOLCOINSUMMARY30M = await GetValueData(`TMP:SUMMARY:VOLCOIN:sell:30MENIT`) || [];
    const SellVOLCOINSUMMARY1J = await GetValueData(`TMP:SUMMARY:VOLCOIN:sell:1JAM`) || [];
    const SellVOLCOINSUMMARY2J = await GetValueData(`TMP:SUMMARY:VOLCOIN:sell:2JAM`) || [];


    const BuyVOLCOINCOUNT1M = await GetValueData(`TMP:COUNT:VOLCOIN:buy:1MENIT`) || [];
    const BuyVOLCOINCOUNT5M = await GetValueData(`TMP:COUNT:VOLCOIN:buy:5MENIT`) || [];
    const BuyVOLCOINCOUNT10M = await GetValueData(`TMP:COUNT:VOLCOIN:buy:10MENIT`) || [];
    const BuyVOLCOINCOUNT15M = await GetValueData(`TMP:COUNT:VOLCOIN:buy:15MENIT`) || [];
    const BuyVOLCOINCOUNT20M = await GetValueData(`TMP:COUNT:VOLCOIN:buy:20MENIT`) || [];
    const BuyVOLCOINCOUNT30M = await GetValueData(`TMP:COUNT:VOLCOIN:buy:30MENIT`) || [];
    const BuyVOLCOINCOUNT1J = await GetValueData(`TMP:COUNT:VOLCOIN:buy:1JAM`) || [];
    const BuyVOLCOINCOUNT2J = await GetValueData(`TMP:COUNT:VOLCOIN:buy:2JAM`) || [];

    const BuyVOLCOINSUMMARY1M = await GetValueData(`TMP:SUMMARY:VOLCOIN:buy:1MENIT`) || [];
    const BuyVOLCOINSUMMARY5M = await GetValueData(`TMP:SUMMARY:VOLCOIN:buy:5MENIT`) || [];
    const BuyVOLCOINSUMMARY10M = await GetValueData(`TMP:SUMMARY:VOLCOIN:buy:10MENIT`) || [];
    const BuyVOLCOINSUMMARY15M = await GetValueData(`TMP:SUMMARY:VOLCOIN:buy:15MENIT`) || [];
    const BuyVOLCOINSUMMARY20M = await GetValueData(`TMP:SUMMARY:VOLCOIN:buy:20MENIT`) || [];
    const BuyVOLCOINSUMMARY30M = await GetValueData(`TMP:SUMMARY:VOLCOIN:buy:30MENIT`) || [];
    const BuyVOLCOINSUMMARY1J = await GetValueData(`TMP:SUMMARY:VOLCOIN:buy:1JAM`) || [];
    const BuyVOLCOINSUMMARY2J = await GetValueData(`TMP:SUMMARY:VOLCOIN:buy:2JAM`) || [];

    // 

    

    function AddData(){


    }

    // SUM:COIN:VOLCOIN:BORA-USDC avg_VOLCOIN_buy_15MENIT 4026.031210989013

    console.log(

        JSON.stringify(
            BuyVOLCOINSUMMARY15M.map(d =>{
                const total= BuyVOLCOINCOUNT15M.filter(x=>x.value == d.value)[0]==undefined?0:BuyVOLCOINCOUNT15M.filter(x=>x.value == d.value)[0].score||0;
                const length =d.score||0
                const avg = total / length
                return{
                coin:d.value,
                avg: avg,
                length:length,
                total:total,
                type:'VOL'
            }})

        )
    )

    // await client.quit();
    // await insertData.quit();

    return '';

    // console.log(FindBuyArray) await client.quit();
}

async function START() {
    await client.connect();
    await insertData.connect();
    await main("FREQ");
    // await main("VOLCOIN");
    return '';
}

async function GenerateAvgRam() {
    await START()
    return '';
}


GenerateAvgRam()