 
import { PartialType } from '@/utils/interfaces';
import { CreateFirewallsPortDto } from './create-firewalls-port.dto';

export class UpdateFirewallsPortDto extends PartialType(CreateFirewallsPortDto) {}
