import path from "path"

export class InstallPlugins{
    static async installPlugins(){
        try {
            const plugins =  [
                'temp-mail',
                'dns-server',
                'smtp-server',
                'rmtp-server',
                'ftp-server',
            ]
           
                
            for (const plugin of plugins) {
                const pluginPath = path.join('plugins', plugin)
                const pluginModule = require(pluginPath)
                await pluginModule.install()
            }
        } catch (error) {
            console.error('Error installing plugins:', error)
        }
    }
}