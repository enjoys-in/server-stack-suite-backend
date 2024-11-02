import { PartialType } from '@/utils/interfaces';
import { CreateSslCertificateDto } from './create-ssl_certificate.dto';
import { UserEntity } from '@/factory/entities/users.entity';

export class UpdateSslCertificateDto extends PartialType(CreateSslCertificateDto) {
    user!:UserEntity
}
