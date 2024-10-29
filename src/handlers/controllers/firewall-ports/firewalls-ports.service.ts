import { CreateFirewallsPortDto } from './dto/create-firewalls-port.dto';
import { UpdateFirewallsPortDto } from './dto/update-firewalls-port.dto';
 
 
export class FirewallsPortsService {
  create(createFirewallsPortDto: CreateFirewallsPortDto) {
    return 'This action adds a new firewallsPort';
  }

  findAll() {
    return `This action returns all firewallsPorts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} firewallsPort`;
  }

  update(id: number, updateFirewallsPortDto: UpdateFirewallsPortDto) {
    return `This action updates a #${id} firewallsPort`;
  }

  remove(id: number) {
    return `This action removes a #${id} firewallsPort`;
  }
  async parseProcessList(text: string) {
    const lines = text.trim().split('\n');
    const processes = lines.map(line => {
      const parts = line.trim().split(/\s+/);
      return {
        command: parts[0],
        pid: parseInt(parts[1], 10),
        user: parts[2],
        fd: parts[3],
        type: parts[4],
        device: parseInt(parts[5], 10),
        sizeOff: parts[6],
        node: parts[7],
        name: parts.slice(8).join(' ')
      };
    });
    return processes;
  }
}
