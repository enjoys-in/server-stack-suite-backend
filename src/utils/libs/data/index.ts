
export const SERVER_DATA = {
    DEFAULT_SERVICES: {
        "redis": {
            "serviceId": 1,
            "serviceName": "Redis",
            "serviceSlug": "redis",
            "imageName": "redis:latest",
            "serviceDescription": "A high-performance in-memory data structure",
            "serviceType": "Database",
            "servicePort": ["6379"],
            "serviceStatus": true,
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
            "serviceStatus": true,
            "auth_required": true,
        },
        "postgres": {
            "serviceId": 3,
            "serviceName": "PostgreSQL",
            "serviceSlug": "postgres",
            "imageName": "postgres:latest",
            "serviceDescription": "A powerful relational database",
            "serviceType": "Database",
            "serviceStatus": true,
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
            "serviceStatus": true,
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
            "servicePort": ["443", "8080", "25", "587", "465", "143", "993", "4190", "110", "995"],
            "serviceStatus": false,
            "auth_required": true,
        },
        "gitea": {
            "serviceId": 6,
            "serviceName": "Gitea",
            "serviceSlug": "gitea",
            "imageName": "gitea/gitea:latest",
            "serviceDescription": "Gitea: Git with a cup of tea - A painless self-hosted Git service.",
            "serviceType": "Application",
            "servicePort": ["3000", "2222","2221","8080"],
            "serviceStatus": false,
            "auth_required": false,
        },
        "kafka": {
            "serviceId": 7,
            "serviceName": "Apache Kafka",
            "serviceSlug": "apache-kafka",
            "imageName": "apache/kafka:latest",
            "serviceDescription": "Apache Kafka is an open-source event streaming platform used to collect, process, store, and integrate data at scale in real time. It powers numerous use cases including stream processing, data integration, and pub/sub messaging.",
            "serviceType": "Application",
            "servicePort": ["9092"],
            "serviceStatus": false,
            "auth_required": false,
        },
        "rabbitmq": {
            "serviceId": 8,
            "serviceName": "Rabbitmq",
            "serviceSlug": "rabbitmq",
            "imageName": "rabbitmq:latest",
            "serviceDescription": "RabbitMQ is an open source multi-protocol messaging broker.",
            "serviceType": "Application",
            "servicePort": ["8080","15672"],
            "serviceStatus": false,
            "auth_required": false,
        },
        "minio": {
            "serviceId": 9,
            "serviceName": "Minio",
            "serviceSlug": "minio",
            "imageName": "minio/minio:latest",
            "serviceDescription": "MinIO is a High Performance Object Storage released under GNU Affero General Public License v3.0. It is API compatible with Amazon S3 cloud storage service. Use MinIO to build high performance infrastructure for machine learning, analytics and application data workloads",
            "serviceType": "Application",
            "servicePort": ["9000","9001"],
            "serviceStatus": false,
            "auth_required": false,
        },
    },

    GIT__IGNORE__CONTENT: `.vscode         
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