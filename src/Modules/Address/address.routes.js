import { Router } from "express";
import * as controller from "./address.controller.js";
import * as middlewares from "../../Middlewares/index.js";
import * as addressValidation from "./address.schema.js";

const { errorHandler,auth,validationMiddleware} = middlewares;

const addressRouter = Router();

addressRouter.post('/addAddress',
    errorHandler(auth()),
    errorHandler(validationMiddleware(addressValidation.addAddressSchema)),
    errorHandler(controller.addAddress)
);

addressRouter.get('/getAddresses',
    errorHandler(auth()),
    errorHandler(validationMiddleware(addressValidation.getAllAddressesSchema)),
    errorHandler(controller.getAllAddresses)
);

addressRouter.get('/getAddress/:id',
    errorHandler(auth()),
    errorHandler(validationMiddleware(addressValidation.getAddressByIdSchema)),
    errorHandler(controller.getAddressById)
);

addressRouter.delete('/deleteAddress/:id',
    errorHandler(auth()),
    errorHandler(validationMiddleware(addressValidation.deleteAddressSchema)),
    errorHandler(controller.deleteAddress)
);

addressRouter.patch('/softDeleteAddress/:id',
    errorHandler(auth()),
    errorHandler(validationMiddleware(addressValidation.softDeleteAddressSchema)),
    errorHandler(controller.softDeleteAddress)
);

addressRouter.put('/edit/:id',
    errorHandler(auth()),
    errorHandler(validationMiddleware(addressValidation.editAddressScheme)),
    errorHandler(controller.editAddress)
);

export{addressRouter};