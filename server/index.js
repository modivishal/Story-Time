const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);

var userIds = [];
let userTurn = 0;
let userTime;
let operations = [];
const maxUser = 3;

const scheduleUserTurn = () => {
    console.log("scheduling user",userIds[userTurn]);
    io.emit("user-turn", userIds[userTurn]);
}

const nextUserTurn = () => {
    userTurn = (userTurn + 1) % (userIds.length);
    scheduleUserTurn();
}

const startTimer = () => {
    if (!userTime){
        userTime = setInterval(nextUserTurn, 10000);
    }
}

const getUserIndex = (user) => {
    console.log("userIds",userIds);
    for (let index = 0; index < userIds.length; index++) {
       if (userIds[index]===user){
           return index;
       }
    }
}

io.on("connection", (socket) => {

    if (userIds.length >= maxUser){
        socket.emit("err","Maximum user limit reached");
        socket.disconnect();
        console.log("maxUser limit");
        return;
    }

    userIds.push(socket.id);
    if (userIds.length === 1){

        scheduleUserTurn();
        startTimer();
    }
    if (operations.length>0){
        console.log("initial-user-id", socket.id);
        io.emit("initial-operations", {
            userId: socket.id,
            ops: JSON.stringify(operations)
        });
    }
      
    socket.on("disconnect",() => {
        console.log("sesssssssssion",socket.id);
        let index = getUserIndex(socket.id);
        console.log("indexindexindex",index);
        userIds.splice(index,1);
        if(userIds.length === 0){
            operations = [];
            clearInterval(userTime);
            userTime = false;
            userTurn = 0;
        }
    });

    socket.on("new-operations", (data) => {
        io.emit("new-remote-operations", data);
        operations = operations.concat(JSON.parse(data.ops));
    });
  
});

http.listen(4000, function() {
  console.log("listening on *:4000");
});
