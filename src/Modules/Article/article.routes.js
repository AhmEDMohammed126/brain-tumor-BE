import { Router } from "express";

import { auth, authorizationMiddleware, errorHandler, multerHost, validationMiddleware } from "../../Middlewares/index.js";
import { extensions, systemRoles } from "../../Utils/index.js";
import * as validation from "./article.schema.js";
import * as controller from "./article.controllers.js"

const articleRouter = Router();

articleRouter.post(
    '/addArticle',
    errorHandler(auth()),
    errorHandler(multerHost({ allowedExtensions :extensions.Images }).array("image",5)),
    errorHandler(authorizationMiddleware([systemRoles.DOCTOR])),
    errorHandler(validationMiddleware(validation.addArticleSchema)),
    errorHandler(controller.addArticle)
);

articleRouter.get(
    '/getArticles',
    errorHandler(auth()),
    errorHandler(authorizationMiddleware([systemRoles.DOCTOR, systemRoles.PATIENT])),
    errorHandler(controller.getArticles)
);

articleRouter.get(
    '/getArticle/:id',
    errorHandler(auth()),
    errorHandler(authorizationMiddleware([systemRoles.DOCTOR, systemRoles.PATIENT])),
    errorHandler(validationMiddleware(validation.getArticleSchema)),
    errorHandler(controller.getArticle)
);

articleRouter.put(
    '/updateArticle/:id',
    errorHandler(auth()),
    errorHandler(multerHost({ allowedExtensions :extensions.Images }).array("image",5)),
    errorHandler(authorizationMiddleware([systemRoles.DOCTOR])),
    errorHandler(validationMiddleware(validation.updateArticleSchema)),
    errorHandler(controller.updateArticle)
);

articleRouter.delete(
    '/deleteArticle/:id',
    errorHandler(auth()),
    errorHandler(authorizationMiddleware([systemRoles.DOCTOR])),
    errorHandler(validationMiddleware(validation.deleteArticleSchema)),
    errorHandler(controller.deleteArticle)
);

export { articleRouter};