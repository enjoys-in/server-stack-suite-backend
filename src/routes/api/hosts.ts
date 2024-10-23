import { Router } from "express";
import { HostController } from "@/handlers/controllers";

const router = Router();


router.get("/", HostController.default.getAllHosts)
router.get("/d/:domain_name", HostController.default.getSingleHost)
router.put("/proxy/:domain_name?", HostController.default.updateHost)
router.delete("/proxy/:domain_name?", HostController.default.deleteHost)
router.post("/proxy", HostController.default.addNewHosts)

router.post("/error-page", HostController.default.AddNewErrorPage)
router.get("/error-page", HostController.default.getAllErrorPage)
router.get("/error-page/:id", HostController.default.getOneErrorPage)
router.delete("/error-page/:id", HostController.default.deleteErrorPage)
router.put("/error-page/:id", HostController.default.updateErrorPage)




export default router