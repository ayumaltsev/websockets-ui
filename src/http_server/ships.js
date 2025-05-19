function addShips(data, rooms, ws) {
    const {gameId, ships, indexPlayer} = data.data;
    const room = rooms.find(r => r.roomId === gameId);

    if (!room) {
        ws.send(JSON.stringify({
            type: "add_ships",
            data: {status: "error", message: "Room not found"},
            id: 0
        }));
        console.log(`Error: room ${gameId} not found.`);
        return;
    }

    if (!room.ships) {
        room.ships = {};
    }

    room.ships[indexPlayer] = ships;
    ws.send(JSON.stringify({
        type: "add_ships",
        data: {status: "success", message: "Ships placed successfully"},
        id: 0
    }));
    console.log(`Player ${indexPlayer} placed ships in room ${gameId}`);

    if (Object.keys(room.ships).length === 2) {
        room.players.forEach(p => p.ws.send(JSON.stringify({
            type: "start_game",
            data: {ships: room.ships[p.name], currentPlayerIndex: p.name},
            id: 0
        })));

        room.currentTurn = room.players[0].name; // First player starts game

        console.log(`Game is started in room ${gameId}`);
    }
}

export default {addShips}