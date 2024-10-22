import jwt from "jsonwebtoken";
import { defineUserType, ErrorClass, systemRoles } from "../Utils/index.js";
import { Admin } from "../../DB/Models/index.js";


/**
 * @returns {function} return middleware function
 * @description Check if the user is authenticated or not
 */
export const auth = () => {
    return async (req, res, next) => {
    // destruct token from headers
    const { token } = req.headers;
    // check if token is exists
    if (!token) {
        return next(
        new ErrorClass("Token is required", 404, "Token is required")
        );
    }
    // check if token starts with prefix
    if (!token.startsWith(process.env.PREFIX_SECRET)) {
        return next(new ErrorClass("Invalid token", 400, "Invalid token"));
    }
    // retrieve original token after adding the prefix
    const originalToken = token.split(" ")[1];

    // verify token
    const data = jwt.verify(originalToken, process.env.LOGIN_SECRET);
    // check if token payload has userId
    if (!data?.userId) {
        return next(
        new ErrorClass("Invalid token payload", 400, "Invalid token payload")
    );
    }
    // find user by userId 
    const isUserExists=await defineUserType(data);
    // add the user data in req object
    if (!isUserExists) {
        return next(new ErrorClass("user not found", 400, "you are not logged in"));
    }
    req.authUser = isUserExists;
    next();
};
};

