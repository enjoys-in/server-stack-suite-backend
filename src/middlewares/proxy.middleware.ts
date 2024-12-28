import { onEnableHook } from '@/utils/decorators';
import helpers from '@/utils/helpers';
import { OnAppShutDown } from '@/utils/interfaces/application.interface';
import { HttpException } from '@enjoys/exception';
import { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';

export let subdomainPortMap: Record<string, number> = {};
@onEnableHook()
export class AppProxyMiddleware implements OnAppShutDown {
    onAppShutDown(): void {

    }
    static extractSubdomain(domain:string|undefined){
        const subdomain = domain?.split('.').shift()
        return subdomain;
    }
    static dynamicProxy(req: Request, res: Response, next: NextFunction) {
        const subdomain = AppProxyMiddleware.extractSubdomain(req.headers.host)
        if (!helpers.isValidSubdomain(subdomain as string)) {
            // throw new HttpException({
            //     name: "NOT_FOUND",
            //     message: "Subdomain is required",
            //     stack: {
            //         info: `Given subdomain ${subdomain} is not valid`, path: req.baseUrl, method: req.method
            //     }
            // })
            throw new HttpException({
                name: "NOT_FOUND",
                message: "Page Not Found",
                stack: { info: "Forbidden Resource", path: req.baseUrl, method: req.method }
            })

        }

        const port = AppProxyMiddleware.getPortForSubdomain(subdomain as string);
        if (!port) {
            throw new HttpException({
                name: "NOT_FOUND",
                message: "No App configured for this subdomain",
                stack: { info: "Forbidden Resource", path: req.baseUrl, method: req.method }
            })
        }
        const target = `http://localhost:${port}`;
        const proxy = createProxyMiddleware({
            target,
            changeOrigin: true,
            pathRewrite: (path, req) => {
                return path.replace(/^\/[^/]+/, '/');
            },
            on: {
                proxyReq: (proxyReq, req, res) => {
                    const expressReq = req as Request;
                    if (['POST', 'PUT', 'PATCH'].includes(expressReq.method)) {
                        if (expressReq.body) {
                            const bodyData = JSON.stringify(expressReq.body);
                            proxyReq.setHeader('Content-Type', 'application/json');
                            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                            proxyReq.write(bodyData);
                            proxyReq.end();
                        }
                    }
                    return fixRequestBody
                },

            },
        });

        proxy(req, res, next);
    };

    // Helper function to map subdomain to port
    private static getPortForSubdomain = (subdomain: string): number | undefined => {

        return subdomainPortMap[subdomain];
    };



}