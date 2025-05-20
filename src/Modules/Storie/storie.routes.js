import { Router } from "express";

import * as controller from "../Storie/storie.controller.js";
import * as validation from "../Storie/storie.schema.js";

import { errorHandler ,auth ,authorizationMiddleware ,validationMiddleware} from "../../Middlewares/index.js";
import { systemRoles } from "../../Utils/index.js";

const storieRouter = Router();

storieRouter.post("/addStorie",
    errorHandler(auth()),
    errorHandler(authorizationMiddleware([systemRoles.PATIENT])),
    errorHandler(validationMiddleware(validation.addStorieSchema)),
    errorHandler( controller.addStorie)
);

storieRouter.get("/getStories",
    errorHandler(auth()),
    errorHandler(authorizationMiddleware([systemRoles.PATIENT, systemRoles.DOCTOR])),
    errorHandler(controller.getStories)
);

storieRouter.get("/getStorie/:id",
    errorHandler(auth()),
    errorHandler(validationMiddleware(validation.getStorieSchema)),
    errorHandler(controller.getStorie)
);

storieRouter.get("/getPatientStories/:id",
    errorHandler(auth()),
    errorHandler(validationMiddleware(validation.getPatientStoriesSchema)),
    errorHandler(authorizationMiddleware([systemRoles.DOCTOR, systemRoles.PATIENT])),
    errorHandler(controller.getPatientStories)
);

storieRouter.get("/getPendingStories",
    errorHandler(auth()),
    errorHandler(authorizationMiddleware([systemRoles.ADMIN])),
    errorHandler(controller.getPendingStories)
);

storieRouter.put("/acceptOrRejectStorie/:id",
    errorHandler(auth()),
    errorHandler(validationMiddleware(validation.acceptOrRejectStorieSchema)),
    errorHandler(authorizationMiddleware([systemRoles.ADMIN])),
    errorHandler(controller.acceptOrRejectStorie)
);

storieRouter.delete("/deleteStorie/:id",
    errorHandler(auth()),
    errorHandler(authorizationMiddleware([systemRoles.PATIENT])),
    errorHandler(controller.deleteStorie)
);

storieRouter.put("/editStorie/:id",
    errorHandler(auth()),
    errorHandler(authorizationMiddleware([systemRoles.PATIENT])),
    errorHandler(validationMiddleware(validation.editStorieSchema)),
    errorHandler(controller.editStorie)
);

export { storieRouter };