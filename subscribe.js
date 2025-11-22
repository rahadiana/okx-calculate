const Redis = require('ioredis');
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8089 });
const config = require("./config");
const BaseConfig ={host: config.redis_primary.ip, port: config.redis_primary.port,PublishChannel:config.PublishChannel}

const subscriber = new Redis({host: BaseConfig.host, port: BaseConfig.port});

// Track which channels we've already subscribed to (idempotent)
const subscribedChannels = new Set();

// Single message handler for broadcasts (avoid duplicate handlers)
subscriber.on('message', (channel, message) => {
    // Broadcast to all connected WebSocket clients efficiently
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
});

function subscribeToChannel(channel) {
    if (!channel) return;
    if (subscribedChannels.has(channel)) {
        console.log(`Already subscribed to ${channel}, skipping.`);
        return;
    }

    subscriber.subscribe(channel, (err, count) => {
        if (err) {
            console.error("Subscribe error:", err);
        } else {
            subscribedChannels.add(channel);
            console.log(`Subscribed to ${channel}. Total subscriptions: ${count}`);
        }
    });
}

wss.on("connection", ws => {
    // console.log("Klien WebSocket terhubung");
    // ws.send("Anda telah terhubung ke WebSocket server!");
});

async function SubscribeData(channel){
    const Channel = await subscriber.smembers('PublishChannel')

    console.log({BaseConfig:{host: BaseConfig.host, port: BaseConfig.port,PublishChannel:Channel}})

    subscribeToChannel(channel||Channel[0]);
}

 
module.exports = { SubscribeData };