function checkGameOver(room, winners, wss) {
    const opponent = room.players.find(p => p.name !== room.currentTurn);
    const allShipsDestroyed = room.ships[opponent.name].every(ship => ship.damage && ship.damage.length === ship.length);
    if (allShipsDestroyed) {
        room.players.forEach(p => p.ws.send(JSON.stringify({
            type: "finish",
            data: {winPlayer: room.currentTurn},
            id: 0
        })));

        let winner = winners.find(w => w.name === room.currentTurn);
        if (winner) {
            winner.wins++;
        } else {
            winners.push({name: room.currentTurn, wins: 1});
        }

        winners.sort((a, b) => b.wins - a.wins);

        wss.clients.forEach(client => {
            client.send(JSON.stringify({
                type: "update_winners",
                data: winners,
                id: 0
            }));
        });

        console.log(`Player ${room.currentTurn} has won in room ${room.roomId}`);
        console.log(`Updated winners table sent to everyone`);

        room.players = [];
        room.ships = null;
        room.currentTurn = null;

        return true;
    }
    return false;
}

export default {checkGameOver}