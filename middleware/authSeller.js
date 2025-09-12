const { NextResponse } = require("next/server")

const authSeller = async(userid)=>{
    try{
        const user=await prisma.user.findUnique({
            where:{id:userid},
            include:{store:true},
        })
        if(user.store){
            if(user.store.status==="approved" ){
                return user.store.id
            }
            else{
                return false
            }
        }
    }catch(error){
        console.log(error)
        return false
    }
}