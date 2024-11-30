import { Router } from "express";
import { UserAuthController ,HostController ,BaseController,FirewallPortsController,SslCertificatesController, ProjectController, ApplicationController} from "@/handlers/controllers";
import { ReqValidator,HostValidator } from "@/utils/validators/Request.validator";
import { Validator } from "@/middlewares/validator.middleware";
import { JwtAuth } from "@/middlewares/auth.Middleware";

const router = Router();
// Auth
router.get("/auth/me", JwtAuth.Me)
router.post("/auth/login", ReqValidator.Login, UserAuthController.default.Login)
router.get("/auth/logout", UserAuthController.default.Logout)
router.post("/auth/register", ReqValidator.Register, UserAuthController.default.Register)
router.post("/auth/update-password", ReqValidator.UpdatePassword, UserAuthController.default.UpdatePassword)


// Error Page Routes

// Project Routes
// Main
router.get("/server-logs", BaseController.default.serverLogs)
router.get("/server-info", BaseController.default.readServerAnaylitcs)
router.get("/filesystem-info", BaseController.default.fileSystemInfo)
router.get("/first-setup", BaseController.default.setUpServerStackSuite)
router.get("/sftp/upload", BaseController.default.sftpUpload)
router.post("/file/upload", BaseController.default.uploadFiles)
router.get("/files", BaseController.default.getFiles)
router.get("/file-content", BaseController.default.getFileContent)
router.get("/server-file-content", BaseController.default.getServerFileContent)
router.put("/server-file-content", BaseController.default.updateServerFileContent)




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

// Host Routes
router.get("/:server_name/hosts",Validator.forFeature(HostValidator.getAll),HostController.default.getAllHosts)
router.get("/:server_name/hosts/d/:domain_name",Validator.forFeature(HostValidator.getSingle), HostController.default.getSingleHost)
router.put("/:server_name/hosts/proxy/:domain_name?", HostController.default.updateHost)
router.delete("/:server_name/hosts/proxy/:domain_name?", HostController.default.deleteHost)
router.post("/:server_name/hosts/proxy", HostController.default.addNewHosts)
router.post("/application-domain-validation", HostController.default.checkReverseProxyConfig)

// Error Page Routes
router.post("/:server_name/hosts/error-page", HostController.default.AddNewErrorPage)
router.get("/:server_name/hosts/error-page", HostController.default.getAllErrorPage)
router.get("/:server_name/hosts/error-page/:id", HostController.default.getOneErrorPage)
router.delete("/:server_name/hosts/error-page/:id", HostController.default.deleteErrorPage)
router.put("/:server_name/hosts/error-page/:id", HostController.default.updateErrorPage) 

//  Project Route
router.get("/projects", ProjectController.default.allProject)
router.post("/create-project", ProjectController.default.createNewProject)
router.get("/project/:id", ProjectController.default.getSingleProject)
router.delete("/project/:id", ProjectController.default.deleteProject)

// Application Deploy Rouetes
router.get("/application/:id", ApplicationController.default.getApplication)
router.post("/application", ApplicationController.default.deployNewApplication)
router.put("/application/:id", ApplicationController.default.updateApplicationMetadata)
router.delete("/application/:id", ApplicationController.default.deleteApplication)
router.post("/application-redeploy", ApplicationController.default.reDeployApplication)
router.get("/stop-deployment/:application_id", ApplicationController.default.stopTheDeployement)

router.get("/deployments/events/:application_id", ApplicationController.default.getDepoymentEvents)
router.get("/deployments/logs/:application_id", ApplicationController.default.deploymentLogs)
router.get("/rollback-deployment/:application_id/:deployment_id", ApplicationController.default.rollbackApplication)
 

// Webhook Rouetes

export default router
