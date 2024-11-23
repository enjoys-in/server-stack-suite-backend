import { ErrorPagesEnitity } from "@/factory/entities/error_pages.entity"
import { HostsEnitity } from "@/factory/entities/hosts.entity"
import { InjectRepository } from "@/factory/typeorm"
import { DEFAULT_STATUS, HOST_TYPE } from "@/utils/interfaces/user.interface"
import { Repository } from "typeorm"
import { CreateErrorPageDto } from "./dto/create-host.dto"
import { UpdateErrorPageDto, UpdateHostDto } from "./dto/update-host.dto"
import { SERVER_TYPE, SERVER_TYPES } from "@/utils/interfaces"
import { onEnableHook } from "@/utils/decorators"


export type FixedServerTypeName = Uppercase<SERVER_TYPES>


const errorPagesRepository = InjectRepository(ErrorPagesEnitity)
const hostsRepository = InjectRepository(HostsEnitity)

@onEnableHook()
export class HostsService {

  static async onAppStart() {
    const defaultPage = errorPagesRepository.findOne({ where: { name: "default" } })
    if (!defaultPage) {
      errorPagesRepository.save({
        name: "default", status: DEFAULT_STATUS.PUBLISH, path: "/", content: ` <!DOCTYPE html>
            <html>
              <head>
                <title>Welcome to nginx!</title>
                <style>
                  body {
                    width: 35em;
                    margin: 0 auto;
                    font-family: Tahoma, Verdana, Arial, sans-serif;
                  }
                </style>
              </head>
              <body>
                <h1>Welcome to nginx!</h1>
                <p>
                  If you see this page, the nginx web server is successfully installed and
                  working. Further configuration is required.
                </p>

                <p>
                  For online documentation and support please refer to
                  <a href="http://nginx.org/">nginx.org</a>.<br />
                  Commercial support is available at
                  <a href="http://nginx.com/">nginx.com</a>.
                </p>

                <p><em>Thank you for using nginx.</em></p>
              </body>
            </html> ` })
    }
  }

  create(createHostDto: UpdateHostDto) {
    return hostsRepository.save(createHostDto)
  }
  createErrorPage(createHostDto: CreateErrorPageDto) {
    return errorPagesRepository.save(createHostDto)
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
