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
    return userSocketMap[userId]
}

const userSocketMap = {};

io.on("connection",(socket)=> {
    console.log("user connected: ", socket.id)

    const userId = socket.handshake.query.userId;
    
    if(userId){
        userSocketMap[userId] = socket.id
    }

    //io.emit() --> helps in broadcasting
    io.emit("getOnlineUsers", Object.keys(userSocketMap))

    socket.on("disconnect", ()=> {
        if(userId){
            delete userSocketMap[userId]
            io.emit("getOnlineUsers", Object.keys(userSocketMap))
        }
    })
})

export {app, server , io, getReceiverSocketId}