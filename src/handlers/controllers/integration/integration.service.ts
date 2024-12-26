import { IntegrationsEntity } from "@/factory/entities/integrations.enitity";
import { InjectRepository } from "@/factory/typeorm";
import { Security } from "@/utils/helpers/security";
import { CreateIntegrationDto, CreateIntegrationDto2 } from "./dto/createIntegration.dto";
import { CONFIG } from "@/app/config";
import helpers from "@/utils/helpers";
const security = new Security()
import { FindOptionsSelect, FindOptionsSelectByString } from "typeorm";

const integrationRepository = InjectRepository(IntegrationsEntity)
const { EncryptToString } = security.EncryptDecryptData()

class IntegrationService {

    create(data: CreateIntegrationDto | CreateIntegrationDto2, userId: number) {
        let metadata: Record<string, string> = {}
        if ("token" in data) {
            metadata = { token: EncryptToString(data.token, CONFIG.SECRETS.APP_SECRET) }

        } else {
            metadata = {
                client_id: EncryptToString(data.client_id, CONFIG.SECRETS.APP_SECRET),
                client_secret: EncryptToString(data.client_secret, CONFIG.SECRETS.APP_SECRET),
                redirect_url: EncryptToString(data.redirect_url, CONFIG.SECRETS.APP_SECRET),
                app_id: EncryptToString(data.app_id, CONFIG.SECRETS.APP_SECRET),
                private_key: EncryptToString(data.private_key, CONFIG.SECRETS.APP_SECRET),
                webhook_secret: EncryptToString(data.webhook_secret, CONFIG.SECRETS.APP_SECRET),
            }
        }
        const body = {
            name: helpers.RequestId(),
            metadata,
            user: {
                id: userId
            },
            access_type: data.access_type,
            provider: data.provider

        }
        return integrationRepository.save(body)
    }
    delete(id: number) {
        return integrationRepository.delete({ id })
    }
    update(id: number) {
        return integrationRepository.update({
            id
        }, {
            is_active: true
        })
    }
    findAppByProvider(id: number, provider: string, select?: FindOptionsSelect<IntegrationsEntity> | FindOptionsSelectByString<IntegrationsEntity> | undefined) {
        let options:any = {
            where: {
                provider,
                user: {
                    id
                },
            }
        }
        if (select) {
            options.select = select
        }
        return integrationRepository.findOne(options)
    }
    findAllAppByProvider(id: number, provider: string, select?: FindOptionsSelect<IntegrationsEntity> | FindOptionsSelectByString<IntegrationsEntity> | undefined) {
        let options:any = {
            where: {
                provider,
                user: {
                    id
                },
                is_active: true,
            }
        }
        if (select) {
            options.select = select
        }
        return integrationRepository.find(options)
    }
}


export default new IntegrationService()