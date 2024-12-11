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

async function main(SUMMARYTYPE) {

    DeleteFolder(`${SUMMARYTYPE}.sh`)

    const DbnameBuy = `COUNT:${SUMMARYTYPE}:buy:*:*:*:*:*`;
    const FindBuyArray = await client.keys(DbnameBuy);
    // const FindDurationBuy = FindBuyArray.map(d => d.split(':')[6]);
    // const uniqueDataBuy = [...new Set(FindDurationBuy)];

    const DbnameSell = `COUNT:${SUMMARYTYPE}:sell:*:*:*:*:*`;
    const FindSellArray = await client.keys(DbnameSell);
    // const FindDurationSell = FindSellArray.map(d => d.split(':')[6]);
    // const uniqueDataSell = [...new Set(FindDurationSell)];
    
    const filenyaSell = FindSellArray.map(d=> `node hitung.js '${config.redis_primary.ip}:${config.redis_primary.port}' '${config.redis_secondary.ip}:${config.redis_secondary.port}' ${process.argv.slice(2)[2]} '${d}' &\n`).toString().replaceAll(',','')
    const filenyaBuy = FindBuyArray.map(d=> `node hitung.js '${config.redis_primary.ip}:${config.redis_primary.port}' '${config.redis_secondary.ip}:${config.redis_secondary.port}' ${process.argv.slice(2)[2]} '${d}' &\n`).toString().replaceAll(',','')

    const lines = filenyaSell.concat(filenyaBuy).split('\n'); // Pisahkan teks menjadi array berdasarkan baris

    const n = 25; // Misalnya, kita ingin menambahkan "AND" setiap 4 baris

    let result = [];
    for (let i = 0; i < lines.length; i++) {
        result.push(lines[i]); // Tambahkan baris ke hasil
        if ((i + 1) % n === 0 && i + 1 !== lines.length) {
            result.push('AND'); // Tambahkan 'AND' setiap n baris kecuali setelah baris terakhir
        }
    }
    result.push('wait')
const finalResult = result.join('\n'); // Gabungkan hasil menjadi teks kembali
// console.log(finalResult);

fs.writeFileSync(
    `${SUMMARYTYPE}.sh`,
    finalResult
)


    return '';

    // console.log(FindBuyArray) await client.quit();
}


function DeleteFolder(FilePath) {
  
    const filePath =FilePath; // Ganti dengan path file Anda

    fs.unlink(filePath, (err) => {
      if (err) {
        // console.error(`Gagal menghapus file: ${err.message}`);
      } else {
        // console.log('File berhasil dihapus');
      }
    });

}


async function START() {
    await client.connect();
    await insertData.connect();
    await main("FREQ");
    await main("VOLCOIN");
    process.exit()
}

async function GenerateAvg() {
    await START()
    return '';
}

GenerateAvg()
