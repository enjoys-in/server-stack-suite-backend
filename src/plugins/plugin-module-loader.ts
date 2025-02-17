async function loadPlugin(pluginPath: string): Promise<any> {
    return await import(pluginPath);
  }