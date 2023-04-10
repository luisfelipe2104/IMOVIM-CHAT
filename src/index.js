import express from "express"
import http from "http"
import cors from "cors"
import { Server } from "socket.io"

const app = express()
const PORT = process.env.PORT || 5555

let onlineUsers = [];
let onlineAmmount = 0

app.use(cors())  // prevent errors

const server = http.createServer(app) // creates a http server

const io = new Server(server, { // creates a socket io server
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
}) // estabilishes a connection

//detects if someone connected to the server
io.on("connection", (socket) => {  // user connected
    // onlineAmmount += 1
    console.log(`user connected:  + ${socket.id} \n users online: ${onlineUsers.length}`)

    socket.on("join_room", (data) => {
        socket.join(data)  // joins a room
        console.log(`User with ID: ${socket.id} joined the room: ${data}`)
    })

    // sends messages
    socket.on("send_message", (data) => {   // gets the message that was sent
        console.log(data)
        socket.to(data.room).emit("receive_message", data) // sends the message to the socket room
    })
    
    // add new user
  socket.on("new-user-add", (newUserId) => {
    if (!onlineUsers.some((user) => user.userId === newUserId)) {  // if user is not added before
      onlineUsers.push({ userId: newUserId, socketId: socket.id });
      console.log("new user is here!", onlineUsers);
    }
    // send all active users to new user
    socket.emit("get-users", onlineUsers);
  });

  socket.on("disconnect", () => {
    // onlineAmmount += 1
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    console.log(`user disconnected: ${onlineUsers} \n users online: ${onlineUsers.length}`);
    // send all online users to all users
    socket.emit("get-users", onlineUsers);
  });

//   socket.on("offline", () => {
//     // onlineAmmount += 1
//     // remove user from active users
//     onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
//     console.log("user is offline", onlineUsers);
//     // send all online users to all users
//     socket.emit("get-users", onlineUsers);
//   });
}) 

server.listen(PORT, () => {
    console.log("listening on port: " + PORT)
})