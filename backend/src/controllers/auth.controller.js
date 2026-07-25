export async function checkAuth(req,res,next){
    try{
        if(req.user){
            return res.status(200).json({user: req.user})
        }
    }catch(error){
        next(error)
    }
}