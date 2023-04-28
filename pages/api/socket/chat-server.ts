import { Server } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";

let onlineUsers: any = [];

const SocketHandler = async (req: NextApiRequest, res: any) => {
  const io = new Server(res.socket.server);
  res.socket.server.io = io;
  console.log('Server is running');
  

  io.on("connection", (socket) => {
    // user connected
    // onlineAmmount += 1
    console.log(
      `user connected:  + ${socket.id} \n users online: ${onlineUsers.length}`
    );

    socket.on("join_room", (data) => {
      socket.join(data); // joins a room
      console.log(`User with ID: ${socket.id} joined the room: ${data}`);
    });

    // sends messages
    socket.on("send_message", (data) => {
      // gets the message that was sent
      console.log(data);
      socket.to(data.room).emit("receive_message", data); // sends the message to the socket room
    });

    // add new user
    socket.on("new-user-add", (newUserId) => {
      if (!onlineUsers.some((user: any) => user.userId === newUserId)) {
        // if user is not added before
        onlineUsers.push({ userId: newUserId, socketId: socket.id });
        console.log("new user is here!", onlineUsers);
      }
      // send all active users to new user
      socket.emit("get-users", onlineUsers);
    });

    socket.on("disconnect", () => {
      // onlineAmmount += 1
      onlineUsers = onlineUsers.filter(
        (user: any) => user.socketId !== socket.id
      );
      console.log(
        `user disconnected: ${onlineUsers} \n users online: ${onlineUsers.length}`
      );
      // send all online users to all users
      socket.emit("get-users", onlineUsers);
    });
  });
  res.end();
};

export default SocketHandler;
