import 'dotenv/config'
import express from 'express'
import http from 'node:http'
import {Server} from 'socket.io'

const app = express()
const server = http.createServer(app)

const allowedOrigins = [process.env.FRONTEND_URL]

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true
    }
})

function getReceiverSocketId(userId){
    // Return the userId (room name) if the user is online, otherwise null
    return userSocketMap[userId] ? userId : null;
}

const userSocketMap = {}; // Maps userId -> Set of socket.ids

io.on("connection",(socket)=> {
    console.log("user connected: ", socket.id)

    const userId = socket.handshake.query.userId;
    
    if(userId){
        // Join the room named after the userId to support multi-tab/multi-device messaging
        socket.join(userId);

        if (!userSocketMap[userId]) {
            userSocketMap[userId] = new Set();
        }
        userSocketMap[userId].add(socket.id);
    }

    //io.emit() --> helps in broadcasting
    io.emit("getOnlineUsers", Object.keys(userSocketMap))

    socket.on("disconnect", ()=> {
        console.log("user disconnected: ", socket.id)
        if(userId && userSocketMap[userId]){
            userSocketMap[userId].delete(socket.id);
            if (userSocketMap[userId].size === 0) {
                delete userSocketMap[userId];
            }
        }
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })
})

export {app, server , io, getReceiverSocketId}