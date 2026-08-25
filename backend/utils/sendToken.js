export const sendToken = (user,statusCode,res,msg) => {
    const token = user.getJWTToken();

    res.status(statusCode).json({sucess:true,message:`${msg}`,data:user,token})
}