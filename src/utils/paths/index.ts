import { join } from "path"
export const CRUD = {
    CREATE: {
        DIR: "sudo mkdir {path}",
        FILE: `sudo echo "{content}" > {path}`
    },
    DELETE : {
        DIR: "sudo rm -rf {path}",
        FILE: "sudo rm -rf {path}"
    },
    COPY :{
        FILE: "sudo cp {source_path} {destination_path}",
        DIR: "sudo cp -r {source_path} {destination_path}"
    },
    READ : {
        FILE: "cat {path}",
        DIR: "ls -l {path}"
    },
    MOVE :{
        FILE: "sudo mv {source_path} {destination_path}",
        DIR: "sudo mv -r {source_path} {destination_path}"
    }
}
export const SERVER_TYPE_FILE_PATH = {
    NGINX: {
        DEFAULT: "/etc/nginx",
        INDEX_HTML: "/var/www/html/index.nginx-debian.html",
        ERROR_PAGES: "/usr/share/nginx/html/custom_{file_name}.html",
        DEAFULT_CONFIGURATION_FILE: "/etc/nginx/nginx.conf",
        SITES_AVAILABLE_LOCATION_FILE: "/etc/nginx/sites-available/:file_name",
        SITES_ENABLED_LOCATION_FILE: "/etc/nginx/sites-enabled:file_name",

    },
    HTTPD: {
        DEFAULT: "/etc/httpd",
        DEAFULT_CONFIGURATION_FILE: "/etc/httpd/httpd.conf",
        INDEX_HTML: "/var/www/html/index.nginx-debian.html",
        ERROR_PAGES: "/usr/share/nginx/html/custom_{file_name}.html",
        SITES_AVAILABLE_LOCATION_FILE: "/etc/nginx/sites-available/:file_name",
        SITES_ENABLED_LOCATION_FILE: "/etc/nginx/sites-enabled:file_name",
    },
    APACHE: {
        DEFAULT: "/etc/apache2",
        DEAFULT_CONFIGURATION_FILE: "/etc/apache2/apache2.conf",
        INDEX_HTML: "/var/www/html/index.nginx-debian.html",
        ERROR_PAGES: "/usr/share/nginx/html/custom_{file_name}.html",
        SITES_AVAILABLE_LOCATION_FILE: "/etc/nginx/sites-available/:file_name",
        SITES_ENABLED_LOCATION_FILE: "/etc/nginx/sites-enabled:file_name",

    },
    // CADDY: {
    //     DEFAULT: "/etc/caddy",
    //     DEAFULT_CONFIGURATION_FILE: "/etc/caddy/Caddyfile",
    // }
}

export const PATHS = {
    ROOT: "/",
    APPLICATION_PATH: {
        REPOSITORIES: (path: string): string => join(process.cwd(), "application", "repositories", ...path),
        FRAMEWORKS: (path: string): string => join(process.cwd(), "application", "frameworks", ...path),
    },
    SSH: {
        DEFAULT: "/root/.ssh"

    },
    SSL_CERTIFICATES: {
        DEFAULT: "/etc/ssl/certs",
        LETS_ENCRYPT: {
            pk_key: "/etc/letsencrypt/live/:domain/fullchain.pem",
            cert_key: "/etc/letsencrypt/live/:domain/privkey.pem"

        }
    },
    ...SERVER_TYPE_FILE_PATH
}

export const SERVER_COMMANDS = {
    NGINX: {
        TEST_CONF_FILE: "sudo nginx -t",
        RELOAD_CONF: "sudo systemctl reload nginx",
        STOP_SERVER: "sudo systemctl stop nginx",
        RESTART_SERVER: "sudo systemctl restart nginx",
        START_SERVER: "sudo systemctl start nginx",
        STATUS: "sudo systemctl status nginx",

    },
    HTTPD: {
        TEST_CONF_FILE: "sudo httpd -t",
        RELOAD_CONF: "sudo systemctl restart httpd",
        STOP_SERVER: "sudo service httpd stop",
        START_SERVER: "sudo service httpd start",
        RESTART_SERVER: "sudo service httpd restart",
        STATUS: "sudo systemctl status httpd",
    },
    APACHE: {
        TEST_CONF_FILE: "sudo sudo httpd -t",
        RELOAD_CONF: "sudo service apache2 reload",
        STOP_SERVER: "sudo service apache2 stop",
        START_SERVER: "sudo service apache2 start",
        RESTART_SERVER: "sudo service apache2 restart",
        STATUS: "sudo service apache2 status",
    },
    CADDY: {
        TEST_CONF_FILE: "sudo caddy -t",
        RELOAD_CONF: "sudo systemctl reload caddy",
        STOP_SERVER: "sudo systemctl stop caddy",
        START_SERVER: "sudo systemctl start caddy",
        RESTART_SERVER: "sudo systemctl restart caddy",
        STATUS: "",
    },
}
export const COMMANDS = {
    BASIX: {
        FIREWALL: {
            AVIALABLE_APPLICATION_PROFILES: "sudo ufw app list",
            GET_STATUS: "sudo ufw status",
            ENABLE: "sudo ufw enable",
            DISABLE: "sudo ufw disable",
            ALLOW_PORT: "sudo ufw allow {port}",
            ALLOW_FROM_IP: "sudo ufw allow from {ip}",
            DENY_FROM_IP: "sudo ufw deny from {ip}",
            DELETE_FROM_ALLOW_IP: "sudo ufw delete allow from {ip}",
            DELETE: "sudo ufw delete {port}",
            LOGS: "sudo ufw status verbose",
            RUNNING_PORTS: "sudo lsof -i -P -n | grep LISTEN",
            GET_PROCESS_ID: "sudo lsof -t -i:{port} | xargs kill -9",           
            KILL_FROM_PROCCESS_ID: "sudo lsof -t -i:{port} | xargs kill -9",           
            KILL_PORT: "sudo kill -9 {pid}",
        },
        UPDATE_PACKAGES: ["apt update", "apt upgrade -y"],
        CEHCK_PACKAGES_REQUIREMENTS: ["nginx -v", "apache2 -v", "httpd -v", "caddy -v", "certbot --version", "pm2 -v"],
        SETUP: {
            NGINX: "sudo apt install nginx -y",
            HTTPD: "sudo apt install apache2 -y",
            CADDY: "sudo apt install caddy -y",
            PM2: "sudo npm install pm2 -g",
            GIT: "sudo apt install git -y",
            CERTBOT: "sudo apt install certbot python3-certbot-nginx",
            SSH: "sudo apt install openssh-server -y",
            NODE: "sudo apt install nodejs -y",
        },

    },
    PM2: {
        RESTART: "pm2 restart {id}",
        START: "pm2 start {id}",
        STOP: "pm2 stop {id}",
        DELETE: "pm2 delete {id}",
        LOGS: "pm2 logs",
    },
    SSL: {
        GENERATE: "sudo certbot --{server} -d {domain} ",
        RENEW: "sudo certbot --{server} -d {domain} ",
        REMOVE: "sudo certbot delete --cert-name {domain}",
    },

    GIT: {
        ALL_KEYS: "ls -al ~/.ssh",
        CONFIG: "~/.ssh/config",
        ADD: "ssh-add ~/.ssh/{key_name}_rsa",
        REMOVE_KEY: "ssh-add -d ~/.ssh/{key_name}_rsa",
        ADD_CONIFG: `Host github.com
    Hostname ssh.github.com
    Port 443
    User git`,
        TEST_CONNECTION: "ssh -T git@github.com",
        ADD_KEY: "ssh-add -l -E sha256",
        SSH: {
            KEY: `ssh-keygen -t rsa -b  4096 -C "{email}" -f ~/.ssh/{key_name}_rsa -N "{passphrase}"`,
            CAT: `cat ~/.ssh/{key_name}.pub`,
        },
        CLONE: "git clone -b {branch} {url}"
    },

    ...SERVER_COMMANDS
}
