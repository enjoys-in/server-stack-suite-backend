import { PartialType } from '@nestjs/mapped-types';
import { CreateErrorPageDto, CreateHostDto } from './create-host.dto';
import { DEFAULT_STATUS } from '@app/common/constants/enum';

export class UpdateHostDto extends PartialType(CreateHostDto) {
    
}
export class UpdateErrorPageDto extends PartialType(CreateErrorPageDto) {
    content:string
    status: Exclude<DEFAULT_STATUS, "ACTIVE" | "INACTIVE">
    pageType:string
}
