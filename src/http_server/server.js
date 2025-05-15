import WebSocket, { WebSocketServer } from 'ws';

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });

console.log(`WebSocket server started on port ${PORT}`);

wss.on('connection', (ws) => {
    console.log('New player connected');

    ws.on('message', (message) => {
        console.log(`Accepted message: ${message}`);
        ws.send(`Response from server: ${message}`);
    });

    ws.on('close', () => {
        console.log('Player switched off');
    });
});