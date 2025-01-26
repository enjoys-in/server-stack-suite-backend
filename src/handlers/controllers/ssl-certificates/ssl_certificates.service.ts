import forge from "node-forge";
import { SSL_STATUS } from "@/utils/interfaces/user.interface";
import { CreateSslCertificateDto } from "./dto/create-ssl_certificate.dto";
import moment from "moment";
import { SSLCertificatesEnitity } from "@/factory/entities/ssl_certificates.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@/factory/typeorm";
import { UpdateSslCertificateDto } from "./dto/update-ssl_certificate.dto";

type SSLCertificateAttributes= {
  name?: string | undefined;
  type?: string | undefined;
  shortName?: string | undefined;
  valueConstructed?: boolean | undefined;
  // valueTagClass?: asnl.Class | undefined;
  value?: any[] | string | undefined;
  extensions?: any[] | undefined;
}
 
export class SslCertificatesService {
  private sslCertificatesRepository: Repository<SSLCertificatesEnitity>
  constructor() {
    this.sslCertificatesRepository = InjectRepository(SSLCertificatesEnitity)
  }
  generateSSLCert(validityInYears:number) {
    // const keys = forge.pki.rsa.generateKeyPair(2048);
    // const cert = forge.pki.createCertificate();
    // cert.publicKey = keys.publicKey;
    // cert.serialNumber = forge.random.getBytesSync(16);
    // cert.validity.notBefore = moment().toDate();
    // cert.validity.notAfter = new Date();
    // cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + validityInYears);
     
    // const attrs = [
    //   { name: "commonName", value: domainName },
    //   { name: "countryName", value: "US" },
    //   { shortName: "ST", value: "California" },
    //   { name: "localityName", value: "San Francisco" },
    //   { name: "organizationName", value: "My Company" },
    //   { shortName: "OU", value: "IT Department" },
    // ];
    // cert.setSubject(attrs);
    // cert.setIssuer(attrs);
    // cert.sign(keys.privateKey, forge.md.sha256.create());
    // const pemCert = forge.pki.certificateToPem(cert);
    // const pemKey = forge.pki.privateKeyToPem(keys.privateKey);
    // return { pemCert, pemKey };
   
  }
  create(createSslCertificateDto: UpdateSslCertificateDto) {
    return this.sslCertificatesRepository.save({
      provider: createSslCertificateDto.provider,
      domain: createSslCertificateDto.host!.primary_doman,
      host:{
        id:+createSslCertificateDto.host!.id
      },
      ssl_certificates:{
        pk_key:createSslCertificateDto.ssl_certificates!.pk_key,
        cert_key:createSslCertificateDto.ssl_certificates!.cert_key
      },
      expires:moment(new Date().toISOString()).add(90, 'days').format('YYYY-MM-DD HH:mm:ss'),
      status: SSL_STATUS.INACTIVE
    })
  }

  findAll() {
    return this.sslCertificatesRepository.find({
      
      select:{
        id:true,
        created_at:true,
        domain:true,
        provider:true,
        expires:true,
        status:true,
      },
      
    })
  }

  findOne(id: number) {
    return `This action returns a #${id} sslCertificate`;
  }
  findOneByDomain(domain: string) {
    return this.sslCertificatesRepository.findOne({
      where:{
        domain
      }
    })
  }
  remove(id: number) {
    return `This action removes a #${id} sslCertificate`;
  }

  
}
