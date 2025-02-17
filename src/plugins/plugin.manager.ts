import { promises as fs } from "fs";
import path from "path";

class PluginManager {
  private pluginsDir = path.resolve(__dirname, "plugins");
  private activePlugins: Map<string, any> = new Map();

  async uploadPlugin(file: Buffer, pluginName: string): Promise<void> {
    const pluginPath = path.join(this.pluginsDir, pluginName);
    await fs.writeFile(pluginPath, file);
  }

  async activatePlugin(pluginName: string, appContext: any): Promise<void> {
    const pluginPath = path.join(this.pluginsDir, pluginName);
    const plugin = await import(pluginPath);
    if (plugin.default.init) {
      await plugin.default.dbChanges(appContext.db);
      await plugin.default.init(appContext);
    }
    this.activePlugins.set(pluginName, plugin.default);
  }

  deactivatePlugin(pluginName: string): void {
    this.activePlugins.delete(pluginName);
  }
}
