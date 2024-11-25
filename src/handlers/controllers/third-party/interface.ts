export interface  SelectedRepoWebhookResponse {
    type: string
    id: number
    name: string
    active: boolean
    events: string[]
    config: Config
    updated_at: string
    created_at: string
    url: string
    test_url: string
    ping_url: string
    deliveries_url: string
    last_response: LastResponse
  }
  
  export interface Config {
    content_type: string
    insecure_ssl: string
    url: string
  }
  
  export interface LastResponse {
    code: any
    status: string
    message: any
  }
  
 

export interface AllRepositorieshooks {
  type: string
  id: number
  name: string
  active: boolean
  events: string[]
  config: Config
  updated_at: string
  created_at: string
  url: string
  test_url: string
  ping_url: string
  deliveries_url: string
  last_response: LastResponse
}

export interface Config {
  content_type: string
  insecure_ssl: string
  url: string
}

export interface LastResponse {
  code: any
  status: string
  message: any
}
