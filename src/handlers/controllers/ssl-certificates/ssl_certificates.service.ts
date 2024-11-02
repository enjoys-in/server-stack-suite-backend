import { SSL_STATUS } from "@/utils/interfaces/user.interface";
import { CreateSslCertificateDto } from "./dto/create-ssl_certificate.dto";
import moment from "moment";
import { SSLCertificatesEnitity } from "@/factory/entities/ssl_certificates.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@/factory/typeorm";
import { UpdateSslCertificateDto } from "./dto/update-ssl_certificate.dto";

 
export class SslCertificatesService {
  private sslCertificatesRepository: Repository<SSLCertificatesEnitity>
  constructor() {
    this.sslCertificatesRepository = InjectRepository(SSLCertificatesEnitity)
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
