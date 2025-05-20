import {Router} from "express"

import * as controller from "./user.controller.js"
import * as validation from "./user.schema.js"
import * as middlewares from "../../Middlewares/index.js"
import {validationMiddleware} from "../../Middlewares/index.js"
import { extensions, systemRoles } from "../../Utils/index.js";
const userRouter=Router();

const {errorHandler,auth,multerHost,authorizationMiddleware}=middlewares;

userRouter.post(
    "/registerAdmin",
    errorHandler(auth()),
    errorHandler(multerHost({ allowedExtensions:extensions.Images }).single("image")),
    errorHandler(authorizationMiddleware([systemRoles.ADMIN])),
    errorHandler(validationMiddleware(validation.registeradminSchema)),
    errorHandler(controller.registerAdmin)
);

userRouter.get(
    "/confirmation/:confirmationToken",
    errorHandler(validationMiddleware(validation.verifySchema)),
    errorHandler(controller.verifyEmail)
);

userRouter.post(
    "/login",
    errorHandler(validationMiddleware(validation.logInSchema)),
    errorHandler(controller.login)
);

userRouter.patch(
    "/logout",
    errorHandler(auth()),
    errorHandler(controller.logOut)
);

userRouter.post(
    "/forget-password",
    errorHandler(validationMiddleware(validation.forgetPassSchema)),
    errorHandler(controller.forgetPassword)
);

userRouter.post(
    "/verify-forget-password",
    errorHandler(validationMiddleware(validation.verifyForgetPasswordSchema)),
    errorHandler(controller.verifyForgetPassword)
);

userRouter.patch(
    "/reset-password",
    errorHandler(validationMiddleware(validation.resetPasswordSchema)),
    errorHandler(controller.resetPassword)
);

userRouter.patch(
    "/update-password",
    errorHandler(auth()),
    errorHandler(validationMiddleware(validation.updatePasswordSchema)),
    errorHandler(controller.updatePassword)
);

userRouter.put(
    "/soft-delete-user",
    errorHandler(auth()),
    errorHandler(authorizationMiddleware([systemRoles.ADMIN])),
    errorHandler(validationMiddleware(validation.softDeleteUserSchema)),
    errorHandler(controller.softDeleteUser)
);

userRouter.put(
    "/unblockUser",
    errorHandler(auth()),
    errorHandler(authorizationMiddleware([systemRoles.ADMIN])),
    errorHandler(validationMiddleware(validation.unblockUserSchema)),
    errorHandler(controller.unblockUser)
);

userRouter.delete(
    "/deleteUser",
    errorHandler(auth()),
    errorHandler(authorizationMiddleware([systemRoles.ADMIN])),
    errorHandler(validationMiddleware(validation.DeleteUserSchema)),
    errorHandler(controller.DeleteUser)
);

// userRouter.put(
//     "/updateAccount",
//     errorHandler(multerHost({ allowedExtensions:extensions.Images }).single("image")),
//     errorHandler(auth()),
//     errorHandler(controller.updateAccount)
// );

// userRouter.get(
//     "/get-info",
//     errorHandler(auth()),
//     errorHandler(controller.getInfo)
// );

// userRouter.get(
//     "/get-by-id/:_id",
//     errorHandler(auth()),
//     errorHandler(controller.getById)
// );

// userRouter.patch(
//     "/update-password",
//     errorHandler(auth()),
//     errorHandler(controller.updatePassword)
// );




// //======================question : about authentication and about which can delete
// userRouter.delete(
//     "/delete-user",
//     errorHandler(auth()),
//     errorHandler(controller.deleteUser)
// );

// userRouter.post(
//     "/loginWithGoogle",
//     errorHandler(controller.loginWithGoogle)
// );

// userRouter.post(
//     "/registerWithGoogle",
//     errorHandler(controller.registerWithGoogle)
// );

export {userRouter};