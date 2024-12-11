const { Server } = require('ws');
const http = require('http');

let players = {};

const server = http.createServer((req, res) => {
    res.end();
});

const wss = new Server({ server });

wss.on('connection', (ws, req) => {
    console.log(`New connection from ${req.socket.remoteAddress}`);

    console.log("New player connected");

    const playerId = Date.now(); // Generate unique ID
    ws.send(JSON.stringify({ type: 'setId', playerId }));

    console.log(`Player ${playerId} connected`);

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'updatePosition') {
            players[data.id] = { x: data.x, y: data.y, color: data.color, animation: data.animation };
            console.log(data.x, data.y, data.color, data.animation);
        }
    });

    ws.on('close', () => {
        console.log(`Player ${playerId} disconnected`);
    });

    ws.on('error', (error) => {
        console.error(`Error for player ${playerId}:`, error);
    });
});

server.listen(15621, () => {
    console.log('Server is listening on port 15621');
});