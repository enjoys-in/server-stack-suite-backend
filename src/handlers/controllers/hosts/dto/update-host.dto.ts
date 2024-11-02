import { DEFAULT_STATUS } from '@/utils/interfaces/user.interface';
import { CreateErrorPageDto, CreateHostDto } from './create-host.dto';
import { PartialType } from '@/utils/interfaces';
import { UserEntity } from '@/factory/entities/users.entity';

export class UpdateHostDto extends PartialType(CreateHostDto) {
    user!:UserEntity
    
}
export class UpdateErrorPageDto extends PartialType(CreateErrorPageDto) {
    content!:string
    status!: Exclude<DEFAULT_STATUS, "ACTIVE" | "INACTIVE">
    pageType!:string
}
