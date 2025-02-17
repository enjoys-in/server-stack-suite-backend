interface PluginMetadata {
    name: string;
    version: string;
    status: "active" | "inactive";
  }
  
  class PluginRegistry {
    private registry: PluginMetadata[] = [];
  
    register(plugin: PluginMetadata): void {
      this.registry.push(plugin);
    }
  
    listActivePlugins(): PluginMetadata[] {
      return this.registry.filter((plugin) => plugin.status === "active");
    }
  }
  