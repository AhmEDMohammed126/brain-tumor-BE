import { Admin } from "../../DB/Models/index.js"
import { systemRoles } from "./system-roles.utils.js";

//difen user type
export const defineUserType = async (user) => {
    let isUserExists;
    if(user?.userType==systemRoles.ADMIN){
        isUserExists=await Admin.findOne({$or:[{email:user?.email,isMarkedAsDeleted:false},{_id:user?.userId,isMarkedAsDeleted:false}]})
    }
    else if(user.userType==systemRoles.DOCTOR){
         //isUserExists=await Doctor.findOne({email,isEmailVerified:true,isMarkedAsDeleted:false})
    }
    else if(user.userType==systemRoles.PATIENT){
         // isUserExists=await Patient.findOne({email,isEmailVerified:true,isMarkedAsDeleted:false})
    }
    return isUserExists;
}