export interface CreateNewSSLInterface {
    "provider": string;
    "host": {
        "id": number
        "primary_doman": string;
        "domains": string[];
    };
}