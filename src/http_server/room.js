function createRoom(rooms, ws) {
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

function addUserToRoom(data, rooms, ws) {
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
        room.players.push({name: data.data.name, ws});

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
            console.log(`Both players already are in room ${indexRoom}`);
        }
    }
}

export default {createRoom, addUserToRoom}