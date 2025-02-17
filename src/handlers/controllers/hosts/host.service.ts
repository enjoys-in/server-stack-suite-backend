import { ErrorPagesEnitity } from "@/factory/entities/error_pages.entity"
import { HostsEnitity } from "@/factory/entities/hosts.entity"
import { InjectRepository } from "@/factory/typeorm"
import { HOST_TYPE } from "@/utils/interfaces/user.interface"
 
import { CreateErrorPageDto } from "./dto/create-host.dto"
import { UpdateErrorPageDto, UpdateHostDto } from "./dto/update-host.dto"
import { SERVER_TYPE, SERVER_TYPES } from "@/utils/interfaces"
 
export type FixedServerTypeName = Uppercase<SERVER_TYPES>


const errorPagesRepository = InjectRepository(ErrorPagesEnitity)
const hostsRepository = InjectRepository(HostsEnitity)

 
export class HostsService {
  repository = hostsRepository

 

  create(createHostDto: UpdateHostDto) {
    return hostsRepository.save(createHostDto)
  }
  createErrorPage(createHostDto: CreateErrorPageDto) {
    return errorPagesRepository.save(createHostDto)
  }
  findErrorPage(data:any){
    return errorPagesRepository.find({
      where:data
    })
  }
  getAllErrorPages() {
    return errorPagesRepository.find()
  }
  getSingleErrorPage(id: number) {
    return errorPagesRepository.findOneBy({ id })
  }
  updateErrorPage(id: number, createHostDto: Partial<UpdateErrorPageDto>) {
    return errorPagesRepository.update({ id }, createHostDto)
  }
  deleteErrorPage(id: number) {
    return errorPagesRepository.delete({ id })
  }
  findAll(server_type: SERVER_TYPES, host_type: HOST_TYPE, fields: "*" | string) {
    let select = {}
    let where = {}

    if (server_type === "all") {
      where = {
        host_type: HOST_TYPE[host_type],
      }
    } else {
      where = {
        host_type: HOST_TYPE[host_type],
        server_type: SERVER_TYPE[(server_type.toLocaleUpperCase()) as FixedServerTypeName],
      }
    }
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

    return hostsRepository.find({
      where,
      select,
      relations: {
        ssl: true
      }
    })
  }
  deleteHost(domain_name: string) {
    return hostsRepository.delete({ domain_name })
  }
  findOne(id: number) {
    return hostsRepository.findOne({ where: { id } })
  }
  findOneByDomainName(domain_name: string, server_type: SERVER_TYPES) {
    return hostsRepository.findOne({ where: { domain_name, server_type: SERVER_TYPE[(server_type.toLocaleUpperCase()) as FixedServerTypeName], } })
  }
  update(id: number, updateHostDto: UpdateHostDto) {
    return hostsRepository.update({ id }, updateHostDto)
  }

  remove(id: number) {
    return hostsRepository.delete({ id })
  }
}
