import { ErrorPagesEnitity } from "@/factory/entities/error_pages.entity"
import { HostsEnitity } from "@/factory/entities/hosts.entity"
import { InjectRepository } from "@/factory/typeorm"
import { onEnableHook } from "@/utils/decorators"
import { OnAppStart, OnModuleInit } from "@/utils/interfaces/application.interface"
import { DEFAULT_STATUS, HOST_TYPE } from "@/utils/interfaces/user.interface"
import { Repository } from "typeorm"
import { CreateErrorPageDto, CreateHostDto } from "./dto/create-host.dto"
import { UpdateErrorPageDto, UpdateHostDto } from "./dto/update-host.dto"
import { SERVER_TYPE, SERVER_TYPES } from "@/utils/interfaces"

 

export type FixedServerTypeName = Uppercase<SERVER_TYPES>

 
@onEnableHook()
export class HostsService implements OnAppStart {
    private errorPagesRepository: Repository<ErrorPagesEnitity>
    private hostsRepository: Repository<HostsEnitity>
  constructor() {
    this.errorPagesRepository = InjectRepository(ErrorPagesEnitity)
    this.hostsRepository = InjectRepository(HostsEnitity)
   }
async onAppStart() {
    const defaultPage = await InjectRepository(ErrorPagesEnitity).findOne({ where: { name: "default" } })    
    if (!defaultPage) {
      this.createErrorPage({ name: "default", status: DEFAULT_STATUS.PUBLISH, path: "/", content: ` <!DOCTYPE html>
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
    return this.hostsRepository.save(createHostDto)
  }
  createErrorPage(createHostDto: CreateErrorPageDto) {
    return this.errorPagesRepository.save(createHostDto)
  }
  getAllErrorPages() {
    return this.errorPagesRepository.find()
  }
  getSingleErrorPage(id:number) {
    return this.errorPagesRepository.findOneBy({id})
  }
  updateErrorPage(id:number,createHostDto: Partial<UpdateErrorPageDto>) {
    return this.errorPagesRepository.update({id},createHostDto)
  }
  deleteErrorPage(id:number) {
    return this.errorPagesRepository.delete({id})
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
  deleteHost(domain_name:string) {
    return this.hostsRepository.delete({domain_name})
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
