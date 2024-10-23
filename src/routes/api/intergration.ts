import { Router } from "express";
import { IntegrationController } from "@/handlers/controllers";

const router = Router();


router.get("/", IntegrationController.default.findAll)
 




export default router