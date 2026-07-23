import express from 'express'
import dotenv from 'dotenv'
import connectDB from './lib/db.js'
import {clerkMiddleware} from '@clerk/express'
import cors from 'cors' 


dotenv.config()

const app = express()

const PORT = process.env.PORT 
const allowedOrigins = [process.env.FRONTEND_URL]

app.use(express.json())
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}))
app.use(clerkMiddleware())
app.get('/health',(req, res)=>{
    res.json({message: 'OK'})
})
app.listen(PORT, () => {
    connectDB()
    console.log(`Server is running on port ${PORT}`)
})