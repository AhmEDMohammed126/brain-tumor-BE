import { Router } from "express";
import * as controller from "./clinic.controller.js";
import * as middlewares from "../../Middlewares/index.js";
import * as clinicValidation from "./clinic.schema.js";

const { errorHandler,auth,validationMiddleware} = middlewares;

const clinicRouter = Router();

clinicRouter.post('/addClinic',
    errorHandler(auth()),
    errorHandler(validationMiddleware(clinicValidation.addClinicSchema)),
    errorHandler(controller.addClinic)
);

clinicRouter.get('/getClinics',
    errorHandler(auth()),
    errorHandler(validationMiddleware(clinicValidation.getAllClinicSchema)),
    errorHandler(controller.getAllClinics)
);

clinicRouter.get('/getClinic/:id',
    errorHandler(auth()),
    errorHandler(validationMiddleware(clinicValidation.getClinicByIdSchema)),
    errorHandler(controller.getClinicById)
);

clinicRouter.delete('/deleteClinic/:id',
    errorHandler(auth()),
    errorHandler(validationMiddleware(clinicValidation.deleteClinicSchema)),
    errorHandler(controller.deleteClinic)
);

clinicRouter.patch('/softDeleteClinic/:id',
    errorHandler(auth()),
    errorHandler(validationMiddleware(clinicValidation.softDeleteClinicSchema)),
    errorHandler(controller.softDeleteClinic)
);

clinicRouter.put('/edit/:id',
    errorHandler(auth()),
    errorHandler(validationMiddleware(clinicValidation.editClinicSchema)),
    errorHandler(controller.editClinic)
);

export{clinicRouter};