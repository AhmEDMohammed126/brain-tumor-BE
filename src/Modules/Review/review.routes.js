import { Router } from "express";

import * as controller from "./review.controller.js";
import * as validation from "./review.schema.js";

import * as middlewares from "../../Middlewares/index.js";
import { systemRoles } from "../../Utils/index.js";

const{errorHandler,auth,authorizationMiddleware ,validationMiddleware}=middlewares;

const reviewRouter = Router();

reviewRouter.post("/addReview",
    errorHandler(auth()),
    errorHandler(validationMiddleware(validation.addReviewSchema)),
    errorHandler(authorizationMiddleware(systemRoles.PATIENT)),
    errorHandler(controller.addReview)
);
reviewRouter.get("/listPendingReviews",
    auth(),
    errorHandler(authorizationMiddleware(systemRoles.ADMIN)),
    errorHandler(controller.listPendingReviews)
);

reviewRouter.get("/getDoctorReviews/:doctorId",
    errorHandler(auth()),
    errorHandler(validationMiddleware(validation.getReviewsSchema)),
    errorHandler(controller.getDoctorReviews)
);

reviewRouter.patch("/approveOrRejectReview/:reviewId",
    auth(),
    errorHandler(validationMiddleware(validation.approveOrRejectReviewSchema)),
    errorHandler(authorizationMiddleware(systemRoles.ADMIN)),
    errorHandler(controller.approveOrRejectReview)
);
export { reviewRouter };