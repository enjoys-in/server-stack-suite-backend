export interface IDockerImageOptions {
    fromImage: string;
    t: string;
    context: string;
    dockerfile: string;
    buildargs: {
        NODE_VERSION: string;
        INSTALL: string;
        PORT: string;
    }
    labels: {
        version: string;
        maintainer: string;
    };
    cachefrom: string[];
    forcerm: boolean;
    nocache: boolean;
    rm: boolean;
    pull: boolean;
    q: boolean;
    squash: boolean;
    buildx: boolean;
}