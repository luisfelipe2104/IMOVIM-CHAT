import express from "express"
import http from "http"
import cors from "cors"
import { Server } from "socket.io"

const app = express()
const PORT = process.env.PORT || 5555

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
    console.log("user connected: " + socket.id)

    socket.on("join_room", (data) => {
        socket.join(data)  // joins a room
        console.log(`User with ID: ${socket.id} joined the room: ${data}`)
    })

    // sends messages
    socket.on("send_message", (data) => {   // gets the message that was sent
        socket.to(data.room).emit("receive_message", data) // sends the message to the socket room
    })
    
    socket.on("disconnect", () => {     // users disconnects
        console.log("user disconnected", socket.id)
    })
}) 

server.listen(PORT, () => {
    console.log("listening on port: " + PORT)
})