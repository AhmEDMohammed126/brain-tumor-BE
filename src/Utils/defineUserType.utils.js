import { Admin,Doctor,Patient } from "../../DB/Models/index.js"
import { systemRoles } from "./system-roles.utils.js";

//difen user type
export const defineUserType = async (user) => {
    let isUserExists;
    if(user?.userType==systemRoles.ADMIN){
        isUserExists=await Admin.findOne({$or:[{email:user?.email},{_id:user?.userId}]})
    }
    else if(user.userType==systemRoles.DOCTOR){
        isUserExists=await Doctor.findOne({email:user?.email,isEmailVerified:true})
    }
    else if(user.userType==systemRoles.PATIENT){
        isUserExists=await Patient.findOne({email:user?.email,isEmailVerified:true})
    }
    return isUserExists;
}