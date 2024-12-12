const https = require('https');
const fs = require('fs');
const express = require('express');
const WebSocket = require('ws');

const app = express();

// Carregar os certificados SSL
const server = https.createServer({
  cert: fs.readFileSync('./cert.pem'),
  key: fs.readFileSync('./key.pem')
}, app);

// Configurar o WebSocket Server para usar o servidor HTTPS
const wss = new WebSocket.Server({ server });

app.use(express.static('public'));

// Armazenar os jogadores conectados
let players = {};

// Quando um jogador se conecta
wss.on('connection', (ws, req) => {
    console.log(`Novo jogador conectado de ${req.socket.remoteAddress}`);

    // Gerar ID único para o jogador
    const playerId = Date.now();
    ws.send(JSON.stringify({ type: 'setId', playerId }));

    console.log(`Jogador ${playerId} conectado`);

    // Gerenciar mensagens recebidas
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === 'updatePosition') {
                // Atualizar posição do jogador
                players[playerId] = { x: data.x, y: data.y, color: data.color, animation: data.animation };
                console.log(`Jogador ${playerId}:`, data);
            }

            // Enviar os dados de todos os jogadores para todos os clientes conectados
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'players', players }));
                }
            });
        } catch (error) {
            console.error(`Erro ao processar mensagem do jogador ${playerId}:`, error);
        }
    });

    // Quando o jogador se desconecta
    ws.on('close', () => {
        console.log(`Jogador ${playerId} desconectado`);
        delete players[playerId];

        // Atualizar todos os clientes sobre a desconexão
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'players', players }));
            }
        });
    });

    // Gerenciar erros
    ws.on('error', (error) => {
        console.error(`Erro no jogador ${playerId}:`, error);
    });
});

// Iniciar o servidor HTTPS e WebSocket Secure
const PORT = 15621;
server.listen(PORT, () => {
    console.log(`Servidor seguro rodando em https://localhost:${PORT}`);
});


const wsUrl = new URL('wss://yourserver.com');
const ws = new WebSocket(wsUrl);

// Resto do código do cliente...
ws.onopen = () => {
    console.log('Conectado ao servidor WebSocket seguro');
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    // Lógica para lidar com as mensagens recebidas
};

ws.onclose = () => {
    console.log('Desconectado do servidor WebSocket');
};

ws.onerror = (error) => {
    console.error('Erro no WebSocket:', error);
};
