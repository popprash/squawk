import express from 'express'
import dotenv from 'dotenv'
import connectDB from './lib/db.js'
import {clerkMiddleware} from '@clerk/express'
import cors from 'cors' 
import fs from 'fs'
import path from 'path'
import clerkWebhook from './webhooks/clerk.webhook.js'
import job from './lib/cron.js'
import authRoutes from './routes/auth.route.js'
import messageRoutes from './routes/message.route.js'

dotenv.config()

const app = express()

const PORT = process.env.PORT 
const allowedOrigins = [process.env.FRONTEND_URL]

const publidDir = path.join(process.cwd(),"public")

app.use('/api/webhooks/clerk',express.raw({type:"application/json"}),clerkWebhook)

app.use(express.json())
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}))

app.use(clerkMiddleware())

app.get('/health',(req, res)=>{
    res.json({message: 'OK'})
})

app.use('/api/auth',authRoutes)
app.use('/api/messages',messageRoutes)


if(fs.existsSync(publidDir)){
    app.use(express.static(publidDir))
    app.get('/{*any}',(req, res, next)=>{
        res.sendFile(path.join(publidDir, "index.html"),(err)=> next(err))
    })
}

app.listen(PORT, () => {
    connectDB()
    console.log(`Server is running on port ${PORT}`)

    if(process.env.NODE_ENV === "production"){
        job.start()
    }
})