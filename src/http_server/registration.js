function registerUser(data, players, ws) {
    const {name, password} = data.data;
    let player = players.find(p => p.name === name);

    if (!player) {
        player = {name, password, index: players.length + 1};
        players.push(player);
        ws.send(JSON.stringify({
            type: "reg",
            data: {name, index: player.index, error: false, errorText: ""},
            id: 0
        }));
        console.log(`Player ${name} registered`);
    } else if (player.password === password) {
        ws.send(JSON.stringify({
            type: "reg",
            data: {name, index: player.index, error: false, errorText: ""},
            id: 0
        }));
        console.log(`Player ${name} is authorized succeed`);
    } else {
        ws.send(JSON.stringify({
            type: "reg",
            data: {name, index: "", error: true, errorText: "Invalid password"},
            id: 0
        }));
        console.log(`Auth error: invalid password for ${name}`);
    }
}

export default {registerUser}