const WebSocket = require('ws');

// Substitua pelo endereço do seu túnel
const ws = new WebSocket('ws://buy-galleries.gl.at.ply.gg:21231');

ws.on('open', () => {
    console.log('Connected to the server');
    // Envie uma mensagem de teste ao servidor
    ws.send(JSON.stringify({ type: 'updatePosition', id: 1, x: 100, y: 200, color: 'red', animation: 'walk' }));
});

ws.on('message', (data) => {
    console.log('Message from server:', data);
});

ws.on('close', () => {
    console.log('Disconnected from the server');
});

ws.on('error', (error) => {
    console.error('WebSocket error:', error);
});