
export const SERVER_DATA={
    DEFAULT_SERVICES:{
        "redis": {
            "serviceId": 1,
            "serviceName": "Redis",
            "serviceSlug": "redis",
            "imageName": "redis:latest",
            "serviceDescription": "A high-performance in-memory data structure",
            "serviceType": "Database",
            "servicePort": ["6379"],
            "serviceStatus": false,
            "auth_required": true,
        },
        "mongodb": {
            "serviceId": 2,
            "serviceName": "Mongo Database",
            "imageName": "mongo:latest",
            "serviceSlug": "mongodb",
            "serviceDescription": "A NoSQL database",
            "serviceType": "Database",
            "servicePort": ["27017"],
            "serviceStatus": false,
            "auth_required": true,
        },
        "postgres": {
            "serviceId": 3,
            "serviceName": "PostgreSQL",
            "serviceSlug": "postgres",
            "imageName": "postgres:latest",
            "serviceDescription": "A powerful relational database",
            "serviceType": "Database",
            "serviceStatus": false,
            "servicePort": ["5432"],
            "auth_required": true,
        },
        "mysql": {
            "serviceId": 4,
            "serviceName": "MySQL",
            "serviceSlug": "mysql",
            "imageName": "mysql:latest",
            "serviceDescription": "A popular open-source relational database",
            "serviceType": "Database",
            "serviceStatus": false,
            "servicePort": ["3306"],
            "auth_required": true,
        },
        "mail-server": {
            "serviceId": 5,
            "serviceName": "Mail Server",
            "serviceSlug": "mail-server",
            "imageName": "stalwartlabs/mail-server:latest",
            "serviceDescription": "A popular open-source email server",
            "serviceType": "Application",
            "servicePort": ["443","8080","25","587","465","143","993","4190","110","995"],
            "serviceStatus": false,
            "auth_required": true,
        },
        
    },
   
    GIT__IGNORE__CONTENT:  `.vscode         
    Makefile
    README.md
    .env
    *.env
    *.log
    dist
    build
    out
    export
    node_modules
    .dockerignore
    .DS_Store
    .git
    .github
    .gitignore
    .gitlab-ci.yml
    .gitmodules
    .idea
    .data
    .sass-cache
    tests
    README.md
    Dockerfile
    Dockerfile.archive
    docker-compose.yml
    
    */temp*
    */*/temp*
    docker
    .vagrant
    .data
    .idea
    app/sessions/*
    app/logs/*
    app/cache/*
    app/gen-src/*
    app/conf/config.yml
    app/*.zip
    app/*.sql
    app/*.tar.gz
    *.zip
    *.sql
    *.log
    *.tar.gz
    themes/*/build
    themes/*/node_modules
    themes/*/app
    */*/*/node_modules
    files/*
    web/files/*
    */*/*/src-img
    */*/src-img
    */*.log
    Vagrantfile
    pimple.json
    
    !vendor
    !app/gen-src/GeneratedNodeSources/.gitignore
    !app/gen-src/Proxies/.gitignore
    !docker/php-nginx-alpine/crontab.txt
    !docker/php-nginx-alpine/before_launch.sh
    !themes/BaseTheme/static
    !themes/BaseTheme/Resources/views/partials/*
    !themes/BaseTheme/Resources/views/base.html.twig
    !web/themes/*
            `
 }