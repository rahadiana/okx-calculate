const Redis = require('ioredis');
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8089 });

const subscriber = new Redis({host: '95.217.4.201', port: 6379});

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
    ws.send("Anda telah terhubung ke WebSocket server!");
});

console.log("WebSocket server berjalan pada ws://localhost:8089");
// Contoh penggunaan
subscribeToChannel('AoVxVT1qr');

 
