import { PartialType } from '@nestjs/mapped-types';
import { CreateSslCertificateDto } from './create-ssl_certificate.dto';

export class UpdateSslCertificateDto extends PartialType(CreateSslCertificateDto) {}
