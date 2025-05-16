import WebSocket, {WebSocketServer} from 'ws';

const PORT = 8080;
const wss = new WebSocketServer({port: PORT});

console.log(`WebSocket server started on port ${PORT}`);

const players = [];

wss.on('connection', (ws) => {
    console.log('New player connected');

    ws.on('message', (message) => {
        // console.log(`Accepted message: ${message}`);
        // ws.send(`Response from server: ${message}`);

        const data = JSON.parse(message);
        console.log(`Received command: ${data.type}`);

        if (data.type === "reg") {
            const {name, password} = data.data;
            let player = players.find(p => p.name === name);

            if (!player) {
                // create new player
                player = {name, password, index: players.length + 1};
                players.push(player);
                ws.send(JSON.stringify({
                    type: "reg",
                    data: {name, index: player.index, error: false, errorText: ""},
                    id: 0
                }));
                console.log(`Игрок ${name} зарегистрирован`);
            } else if (player.password === password) {
                // succeed
                ws.send(JSON.stringify({
                    type: "reg",
                    data: {name, index: player.index, error: false, errorText: ""},
                    id: 0
                }));
                console.log(`Player ${name} is authorized succeed`);
            } else {
                // wrong password
                ws.send(JSON.stringify({
                    type: "reg",
                    data: {name, index: "", error: true, errorText: "Invalid password"},
                    id: 0
                }));
                console.log(`Auth error: invalid password for ${name}`);
            }
        }

    });

    ws.on('close', () => {
        console.log('Player switched off');
    });
});