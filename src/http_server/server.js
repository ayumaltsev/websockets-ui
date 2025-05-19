import {WebSocketServer} from 'ws';
import turnPlayer from './turnPlayer.js';
import reg from './registration.js';
import room from './room.js';
import ships from './ships.js';
import go from './gameOver.js';

const PORT = 8080;
const wss = new WebSocketServer({port: PORT});

const players = [];
const rooms = [];
const winners = [];

wss.on("listening", () => {
    console.log(`WebSocket server started on port ${wss.options.port}`);
    console.log(`Current number of connections: ${wss.clients.size}`);
});

wss.on('connection', (ws) => {
    console.log(`New player connected! Current number of connections: ${wss.clients.size}`);

    ws.on('message', (message) => {

        const data = JSON.parse(message);
        console.log(`Received command: ${data.type}`);

        if (data.type === "reg") {
            reg.registerUser(data, players, ws);
        }

        if (data.type === "create_room") {
            room.createRoom(rooms, ws);
        }

        if (data.type === "add_user_to_room") {
            room.addUserToRoom(data, rooms, ws);
        }

        if (data.type === "add_ships") {
            ships.addShips(data, rooms, ws);
        }

        if (data.type === "attack") {
            const {gameId, x, y, indexPlayer} = data.data;
            const room = rooms.find(r => r.roomId === gameId);

            if (!room || room.currentTurn !== indexPlayer) {
                ws.send(JSON.stringify({
                    type: "attack",
                    data: {status: "error", message: "Not your turn!"},
                    id: 0
                }));

                console.log("Result: " + JSON.stringify({
                    type: "attack",
                    data: {status: "error", message: "Not your turn!"},
                    id: 0
                }));
                return;
            }

            const opponent = room.players.find(p => p.name !== indexPlayer);
            const ships = room.ships[opponent.name];

            let hit = false, killed = false;
            ships.forEach(ship => {
                const {position, direction, length} = ship;

                const shipCells = [];
                for (let i = 0; i < length; i++) {
                    shipCells.push(direction
                        ? {x: position.x + i, y: position.y}  // horizontal ship
                        : {x: position.x, y: position.y + i}  // vertical ship
                    );
                }

                if (shipCells.some(cell => cell.x === x && cell.y === y)) {
                    hit = true;

                    if (!ship.damage) ship.damage = [];
                    if (!ship.damage.some(cell => cell.x === x && cell.y === y)) {
                        ship.damage.push({x, y});
                    }
                    killed = ship.damage.length === length;
                }
            });
            const status = killed ? "killed" : hit ? "shot" : "miss";

            ws.send(JSON.stringify({
                type: "attack",
                data: {position: {x, y}, currentPlayer: indexPlayer, status},
                id: 0
            }));

            console.log("Result: " + JSON.stringify({
                type: "attack",
                data: {position: {x, y}, currentPlayer: indexPlayer, status},
                id: 0
            }));

            let gameOver;
            if (killed) {
                gameOver = go.checkGameOver(room, winners, wss);
            }

            if (!gameOver) {
                if (!hit) {
                    room.currentTurn = opponent.name;
                }
                turnPlayer.sendTurn(room);
            } else {
                return;
            }
        }
    });

    ws.on('close', () => {
        console.log('Player switched off. Current number of connections: ${wss.clients.size}');
    });

    process.on("SIGINT", () => {
        console.log("Shutting down the WebSocket server...");
        wss.clients.forEach(client => client.close());
        wss.close(() => {
            console.log("Server is closed");
            process.exit(0);
        });
    });

});