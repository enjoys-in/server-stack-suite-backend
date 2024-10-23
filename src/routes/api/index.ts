import { Router} from "express";
import {UserAuthController} from "@/handlers/controllers/user";
import { ReqValidator } from "@/utils/validators/Request.validator";

const router = Router();

router.post("/auth/login",ReqValidator.Login,UserAuthController.default.Login)
router.post("/auth/register",ReqValidator.Register,UserAuthController.default.Register)
router.post("/auth/update-password",ReqValidator.UpdatePassword,UserAuthController.default.UpdatePassword)





export default  router