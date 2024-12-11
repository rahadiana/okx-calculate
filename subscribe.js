const Redis = require('ioredis');
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8089 });
const config = require("./config");
const BaseConfig ={host: config.redis_primary.ip, port: config.redis_primary.port,PublishChannel:config.PublishChannel}

const subscriber = new Redis({host: BaseConfig.host, port: BaseConfig.port});

function subscribeToChannel(channel) {
    
    subscriber.subscribe(channel, (err, count) => {
        if (err) {
            console.error("Subscribe error:", err);
        } else {
            console.log(`Subscribed to ${channel}. Total subscriptions: ${count}`);
        }
    });

    subscriber.on('message', (channel, message) => {
        // console.log(`Received message from ${channel}: ${message}`);
        // console.log(message)
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
}

wss.on("connection", ws => {
    console.log("Klien WebSocket terhubung");
    // ws.send("Anda telah terhubung ke WebSocket server!");
});

async function SubscribeData(channel){
    const Channel = await subscriber.smembers('PublishChannel')

    console.log({BaseConfig:{host: BaseConfig.host, port: BaseConfig.port,PublishChannel:Channel[0]}})

    subscribeToChannel(channel||Channel[0]);
}

 
module.exports = { SubscribeData };