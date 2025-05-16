import WebSocket, {WebSocketServer} from 'ws';

const PORT = 8080;
const wss = new WebSocketServer({port: PORT});

console.log(`WebSocket server started on port ${PORT}`);

const players = [];
const rooms = [];

wss.on('connection', (ws) => {
    console.log('New player connected');

    ws.on('message', (message) => {

        const data = JSON.parse(message);
        console.log(`Received command: ${data.type}`);

        // REGISTRATION !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
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
                console.log(`Player ${name} registered`);
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

        // ROOMS !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        if (data.type === "create_room") {
            const indexRoom = rooms.length + 1;
            const newRoom = {roomId: indexRoom, players: []};
            rooms.push(newRoom);

            ws.send(JSON.stringify({
                type: "update_room",
                data: rooms.filter(r => r.players.length === 1),
                id: 0
            }));

            console.log(`Room is created with ID: ${indexRoom}`);
        }

        if (data.type === "add_user_to_room") {
            const {indexRoom} = data.data;
            const room = rooms.find(r => r.roomId === indexRoom);

            if (!room) {
                ws.send(JSON.stringify({
                    type: "add_user_to_room",
                    data: {indexRoom, status: "error", message: "Room does not exist"},
                    id: 0
                }));
                console.log(`Error: Room ${indexRoom} does not exist.`);
            } else if (room.players.length >= 2) {
                ws.send(JSON.stringify({
                    type: "add_user_to_room",
                    data: {indexRoom, status: "error", message: "Room is full"},
                    id: 0
                }));
                console.log(`Error: Room ${indexRoom} is full`);
            } else {
                // room.players.push({ws});
                room.players.push({ name: data.name, ws });

                ws.send(JSON.stringify({
                    type: "add_user_to_room",
                    data: {indexRoom, status: "success", message: "You joined the room"},
                    id: 0
                }));
                console.log(`Player joined the room ${indexRoom}`);

                if (room.players.length === 2) {
                    room.players.forEach(p => p.ws.send(JSON.stringify({
                        type: "create_game",
                        data: {idGame: indexRoom},
                        id: 0
                    })));
                    console.log(`Game is started in room ${indexRoom}`);
                }
            }
        }


    });

    ws.on('close', () => {
        console.log('Player switched off');
    });
});