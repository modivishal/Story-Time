const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);

var userIds = [];
let userTurn = 0;
let userTime;
let operations = [];
const maxUser = 5;

// emits user-turn event
const scheduleUserTurn = () => {
    io.emit("user-turn", userIds[userTurn]);
};

// increament user turn index and schedule the new user turn
const nextUserTurn = () => {
    userTurn = (userTurn + 1) % userIds.length;
    scheduleUserTurn();
};

// starts interval timer of 10 secs, after each 10 secs calls nextUserTurn function
const startTimer = () => {
    if (!userTime) {
        userTime = setInterval(nextUserTurn, 10000);
    }
};

const getUserIndex = (user) => {
    for (let index = 0; index < userIds.length; index++) {
        if (userIds[index] === user) {
            return index;
        }
    }
};

const resetState = () => {
    operations = [];
    clearInterval(userTime);
    userTime = false;
    userTurn = 0;
};

io.on("connection", (socket) => {
    if (userIds.length >= maxUser) {
        socket.emit("err", "Maximum user limit reached");
        socket.disconnect();
        return;
    }

    userIds.push(socket.id);

    if (userIds.length === 1) {
        scheduleUserTurn();
        startTimer();
    }

    if (operations.length > 0) {
        io.emit("initial-operations", {
            userId: socket.id,
            ops: JSON.stringify(operations),
        });
    }

    socket.on("disconnect", () => {
        let index = getUserIndex(socket.id);
        if (!index) {
            return;
        }

        userIds.splice(index, 1);
        if (userIds.length === 0) {
            resetState();
        }
    });

    socket.on("new-ops", (data) => {
        io.emit("new-remote-ops", data);
        operations = operations.concat(JSON.parse(data.ops));
    });
});

http.listen(4000, function () {
    console.log("listening on *:4000");
});
