
import { IntegrationsEntity } from "@/factory/entities/integrations.enitity";
import { PartialType } from "@/utils/interfaces";
import { IntegrationsProviderCredType, IntegrationsProviderType } from "@/utils/interfaces/deployment.interface";

export class CreateIntegrationDto extends PartialType(IntegrationsEntity) {
    client_id!: string
    client_secret!: string
    redirect_url!: string
    app_id!: string;
    webhook_secret!: string;
    private_key!: string;
    access_type!: IntegrationsProviderCredType;
    provider!: IntegrationsProviderType;
}
export class CreateIntegrationDto2 extends PartialType(IntegrationsEntity) {
    token!: string;
    access_type!: IntegrationsProviderCredType;
    provider!: IntegrationsProviderType;
}