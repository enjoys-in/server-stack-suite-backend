import { PartialType } from '@nestjs/mapped-types';
import { CreateFirewallsPortDto } from './create-firewalls-port.dto';

export class UpdateFirewallsPortDto extends PartialType(CreateFirewallsPortDto) {}
