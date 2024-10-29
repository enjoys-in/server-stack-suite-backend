import { Router } from "express";
import AppIntegrationRoutes from "./intergration";
import { UserAuthController ,HostController ,BaseController,FirewallPortsController,SslCertificatesController} from "@/handlers/controllers";
import { ReqValidator,HostValidator,ErrroPageValidator } from "@/utils/validators/Request.validator";
import { Validator } from "@/middlewares/validator.middleware";

const router = Router();
// Auth
router.post("/auth/login", ReqValidator.Login, UserAuthController.default.Login)
router.post("/auth/register", ReqValidator.Register, UserAuthController.default.Register)
router.post("/auth/update-password", ReqValidator.UpdatePassword, UserAuthController.default.UpdatePassword)

// Main
router.get("/server-logs", BaseController.default.serverLogs)
router.get("/server-info", BaseController.default.readServerAnaylitcs)
router.get("/filesystem-info", BaseController.default.fileSystemInfo)
router.get("/first-setup", BaseController.default.setUpServerStackSuite)
router.get("/sftp/upload", BaseController.default.sftpUpload)
router.get("/files", BaseController.default.getFiles)
router.get("/file-content", BaseController.default.getFileContent)




// Firewall and Ports Routes
router.get("/firewalls-ports/running-ports", FirewallPortsController.default.findAll)
router.get("/firewalls-ports/kill-port/:port", FirewallPortsController.default.killPort)
router.get("/firewalls-ports/kill-process/:pid", FirewallPortsController.default.killProcess)

// SSL certificate
router.route("/:server_name/ssl-certificates")
.get(SslCertificatesController.default.findAll)
.post(SslCertificatesController.default.create)
.delete(SslCertificatesController.default.delete)
router.get("/:server_name/ssl-certificates/:id",SslCertificatesController.default.findOne)

// Third Party Apps Integration
router.use("app",AppIntegrationRoutes)
// Host Routes
router.get("/:server_name/hosts",Validator.forFeature(HostValidator.getAll),HostController.default.getAllHosts)
router.get("/:server_name/hosts/d/:domain_name",Validator.forFeature(HostValidator.getSingle), HostController.default.getSingleHost)
router.put("/:server_name/hosts/proxy/:domain_name?", HostController.default.updateHost)
router.delete("/:server_name/hosts/proxy/:domain_name?", HostController.default.deleteHost)
router.post("/:server_name/hosts/proxy", HostController.default.addNewHosts)
router.post("/:server_name/hosts/error-page", HostController.default.AddNewErrorPage)
router.get("/:server_name/hosts/error-page", HostController.default.getAllErrorPage)
router.get("/:server_name/hosts/error-page/:id", HostController.default.getOneErrorPage)
router.delete("/:server_name/hosts/error-page/:id", HostController.default.deleteErrorPage)
router.put("/:server_name/hosts/error-page/:id", HostController.default.updateErrorPage) 

export default router
