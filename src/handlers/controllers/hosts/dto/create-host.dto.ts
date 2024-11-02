import { CreateHostInterface, CustomHeader, Domain, SERVER_TYPE } from "@/utils/interfaces";
import { DEFAULT_STATUS, HOST_TYPE } from "@/utils/interfaces/user.interface";
 



export class CreateHostDto implements CreateHostInterface {
  domains!: Domain[];
  custom_headers!: CustomHeader[];
  destination!: string;
  domain_name!: string;
  path!: string;
  has_custom_headers!: boolean;
  websocket_support!: boolean;
  force_https_redirect!: boolean;
  allow_caching!: boolean;
  block_exploits!: boolean;
  auto_ssl!: boolean;
  publicly_accessible!: boolean;
  host_type?: HOST_TYPE
  ip_whitelist!: false
  allowed_ips!: string
}
export class CreateErrorPageDto {
  status!: Exclude<DEFAULT_STATUS, "ACTIVE" | "INACTIVE">
  name!: string
  path!: string
  content!: string
  server_type?: SERVER_TYPE

}