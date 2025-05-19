function sendTurn(room) {
    room.players.forEach(p => p.ws.send(JSON.stringify({
        type: "turn",
        data: {currentPlayer: room.currentTurn},
        id: 0
    })));
}

export default {sendTurn}