import { Router } from "express";
import { IntegrationController } from "@/handlers/controllers";

const router = Router();


// Third Party Apps Integration  Provider(google,github are supported yet) Api routes 
router.get("/oauth2/:provider", IntegrationController.default.providerAuth)
router.get("/oauth2/:provider/callback", IntegrationController.default.providerCallback)
router.post("/webhook/:provider", IntegrationController.default.providerWebhook)

// Github/Gitlab integration
router.get("/:provider/repos", IntegrationController.default.allRepositories)
router.post("/:provider/save-repo", IntegrationController.default.createSelectedRepoWebhook)
router.post("/:provider/all-repo-hooks", IntegrationController.default.allRepositoriesHooks)



export default router