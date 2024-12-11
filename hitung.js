const {nanoid} = require('nanoid');
const {MergeJson} = require('@rahadiana/simple_merge_json')
const fs = require('fs')
const path = require('path');
const config = require("./config");
const myArgs = process.argv.slice(2);

const client = require('redis').createClient(
    {url: `redis://${config.redis_primary.ip}:${config.redis_primary.port}`}
);

const insertData = require('redis').createClient(
    {url: `redis://${config.redis_primary.ip}:${config.redis_primary.port}`}
);



async function name(params) {
    
    if(!params){
        process.exit()
    }

    
    await client.connect();
    await insertData.connect();
    
    try{

        const data = await client.ZRANGEBYSCORE_WITHSCORES(
            params,
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
        
        const x = params.split(':')


        const keySUM = `TMP:SUM:${x[1]}:${x[2]}:${x[6]}`;  // Key untuk Redis Sorted Set
        const keyCOUNT = `TMP:COUNT:${x[1]}:${x[2]}:${x[6]}`;  // Key untuk Redis Sorted Set

        const expireTimeInSeconds = 1000;  // Waktu kadaluarsa dalam detik (misalnya 1 jam)

      
        // Untuk setiap item, gunakan ZINCRBY untuk meningkatkan skor
        for (const item of data) {
            client.zIncrBy(keySUM, item.score,item.value).catch(err => { });//ok
            client.zIncrBy(keyCOUNT, 1,item.value).catch(err => { });//ok

        }
      

             // Set waktu kadaluarsa untuk key
             await client.expire(keySUM, expireTimeInSeconds);
             await client.expire(keyCOUNT, expireTimeInSeconds);
 
             await client.quit();
             await insertData.quit();
             
    }catch{
        await client.quit();
        await insertData.quit();
        console.log('errr')

    }
}
name(myArgs[3])