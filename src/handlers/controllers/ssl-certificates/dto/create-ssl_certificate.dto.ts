import { CreateNewSSLInterface } from "@/utils/interfaces";

 
export class CreateSslCertificateDto implements CreateNewSSLInterface {
    provider!: string;
    host!: {
        id: number
        primary_doman: string;
        domains: string[];
    };
    ssl_certificates!:{
        pk_key:string,
        cert_key:string
      }



}
