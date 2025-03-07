import { Router } from "express";

import * as controller from "./appointment.controller.js";
import * as validation from "./appointment.schema.js";

import { errorHandler ,auth ,authorizationMiddleware ,validationMiddleware} from "../../Middlewares/index.js";
import { systemRoles } from "../../Utils/index.js";

const appointmentRouter = Router();

appointmentRouter.post("/bookAppointment",
    errorHandler(auth()),
    errorHandler(authorizationMiddleware([systemRoles.PATIENT])),
    errorHandler(validationMiddleware(validation.bookAppointmentSchema)),
    errorHandler( controller.bookAppointment)
)

appointmentRouter.get("/getAppointmentById/:appointmentId",
    errorHandler(auth()),
    errorHandler(authorizationMiddleware([systemRoles.PATIENT, systemRoles.DOCTOR])),
    errorHandler(validationMiddleware(validation.getAppointmentByIdSchema)),
    errorHandler(controller.getAppointmentById)
);

appointmentRouter.get("/getAppointments",
    errorHandler(auth()),
    errorHandler(authorizationMiddleware([systemRoles.PATIENT, systemRoles.DOCTOR])),
    errorHandler(validationMiddleware(validation.getAppointmentsSchema)),
    errorHandler(controller.getAppointments)
);

appointmentRouter.put("/updateAppointmentStatus/:appointmentId",
    errorHandler(auth()),
    errorHandler(authorizationMiddleware([systemRoles.DOCTOR])),
    errorHandler(validationMiddleware(validation.updateAppointmentStatusSchema)),
    errorHandler(controller.updateAppointmentStatus)
);

appointmentRouter.delete("/cancelAppointment/:appointmentId",
    errorHandler(auth()),
    errorHandler(authorizationMiddleware([systemRoles.PATIENT])),
    errorHandler(validationMiddleware(validation.cancelAppointmentSchema)),
    errorHandler(controller.cancelAppointment)
);

export{ appointmentRouter }