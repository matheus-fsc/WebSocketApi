const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();

// Servir arquivos estáticos da pasta 'public'
app.use(express.static('public'));

// Criar o servidor HTTP
const server = http.createServer(app);

// Configurar o WebSocket Server para usar o mesmo servidor HTTP
const wss = new WebSocket.Server({ server });

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

// Iniciar o servidor HTTP e WebSocket
const PORT = 15621;
server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
