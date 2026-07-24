import { getAuth } from "@clerk/express";
import User from '../models/user.model.js'

export async function ProtectedRoute(req,res,next){
    const {userId} = getAuth(req)
    try{
        if(userId){
            const user = await User.findOne({clerkId:userId})
            req.user = user
            next()
        }else{
            return res.status(401).json({error:"Unauthorized"})
        }
    }catch(error){
        console.log("error in protectedRoute middleare", error.message)
        return res.status(500).json({error:"Internal server error"})
    }
}
