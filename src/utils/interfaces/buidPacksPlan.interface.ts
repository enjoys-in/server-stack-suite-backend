export interface NixpackPlan {
  providers: any[];
  buildImage: string;
  variables: Variables;
  phases: Phases;
  start: Start;
}

interface Start {
  cmd: string;
}

interface Phases {
  build: Build;
  install: Install;
  setup: Setup;
}

interface Setup {
  nixPkgs: string[];
  nixOverlays: string[];
  nixpkgsArchive: string;
}

interface Install {
  dependsOn: string[];
  cmds: string[];
  cacheDirectories: string[];
  paths: string[];
}

interface Build {
  dependsOn: string[];
  cacheDirectories: string[];
}

interface Variables {
  CI: string;
  NIXPACKS_METADATA: string;
  NODE_ENV: string;
  NPM_CONFIG_PRODUCTION: string;
}