import { Router } from "express";
import HostRoutes from "./hosts";
import AppIntegrationRoutes from "./intergration";
import { UserAuthController ,BaseController,FirewallPortsController,SslCertificatesController} from "@/handlers/controllers";
import { ReqValidator } from "@/utils/validators/Request.validator";

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
 
// Host Routes
router.use("/:server_name/hosts",HostRoutes)

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

export default router
