import { ErrorPagesEnitity } from "@/factory/entities/error_pages.entity"
import { HostsEnitity } from "@/factory/entities/hosts.entity"
import { InjectRepository } from "@/factory/typeorm"
import { HOST_TYPE } from "@/utils/interfaces/user.interface"
import { Repository } from "typeorm"
import { CreateErrorPageDto } from "./dto/create-host.dto"
import { UpdateErrorPageDto, UpdateHostDto } from "./dto/update-host.dto"
import { SERVER_TYPE, SERVER_TYPES } from "@/utils/interfaces"


export type FixedServerTypeName = Uppercase<SERVER_TYPES>



export class HostsService  {
  private errorPagesRepository: Repository<ErrorPagesEnitity>
  private hostsRepository: Repository<HostsEnitity>
  constructor() {
    this.errorPagesRepository = InjectRepository(ErrorPagesEnitity)
    this.hostsRepository = InjectRepository(HostsEnitity)
  }
 
  create(createHostDto: UpdateHostDto) {
    return this.hostsRepository.save(createHostDto)
  }
  createErrorPage(createHostDto: CreateErrorPageDto) {
    return this.errorPagesRepository.save(createHostDto)
  }
  getAllErrorPages() {
    return this.errorPagesRepository.find()
  }
  getSingleErrorPage(id: number) {
    return this.errorPagesRepository.findOneBy({ id })
  }
  updateErrorPage(id: number, createHostDto: Partial<UpdateErrorPageDto>) {
    return this.errorPagesRepository.update({ id }, createHostDto)
  }
  deleteErrorPage(id: number) {
    return this.errorPagesRepository.delete({ id })
  }
  findAll(server_type: SERVER_TYPES, host_type: HOST_TYPE, fields: "*" | string) {
    let select = {}
    if (fields !== "*") {
      decodeURIComponent(fields).split(',')
        .map((item) => ({ [item]: true }))
        .forEach((item) => select = { ...select, ...item })

    } else {
      select = {
        id: true,
        created_at: true,
        domain_name: true,
        ssl: {
          provider: true
        },
        server_type: true,
        status: true,
        publicly_accessible: true,
        websocket_support: true,
        destination: true
      }
    }

    return this.hostsRepository.find({
      where: {
        host_type: HOST_TYPE[host_type],
        server_type: SERVER_TYPE[(server_type.toLocaleUpperCase()) as FixedServerTypeName],
      },
      select,
      relations: {
        ssl: true
      }
    })
  }
  deleteHost(domain_name: string) {
    return this.hostsRepository.delete({ domain_name })
  }
  findOne(id: number) {
    return this.hostsRepository.findOne({ where: { id } })
  }
  findOneByDomainName(domain_name: string, server_type: SERVER_TYPES) {
    return this.hostsRepository.findOne({ where: { domain_name, server_type: SERVER_TYPE[(server_type.toLocaleUpperCase()) as FixedServerTypeName], } })
  }
  update(id: number, updateHostDto: UpdateHostDto) {
    return this.hostsRepository.update({ id }, updateHostDto)
  }

  remove(id: number) {
    return this.hostsRepository.delete({ id })
  }

}
