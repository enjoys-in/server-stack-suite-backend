import { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
export class ProxyMiddleware {
    
    dynamicProxy(req: Request, res: Response, next: NextFunction) {
        const subdomain = req.headers.host?.split('.')[0]; // Extract subdomain

        if (!subdomain) {
            res.status(400).send('Subdomain is required');
            return;
        }

        // Map subdomain to port or target URL
        const port = this.getPortForSubdomain(subdomain);
        if (!port) {
            res.status(404).send('No target configured for this subdomain');
            return;
        }

        const target = `http://${subdomain}.localhost:${port}`;

        // Create a proxy middleware for this request
        const proxy = createProxyMiddleware({
            target,
            changeOrigin: true,
            pathRewrite: {
                '^/api': '/',
            },
        });

        proxy(req, res, next);
    };

    // Helper function to map subdomain to port
    getPortForSubdomain = (subdomain: string): number | undefined => {
        const subdomainPortMap: Record<string, number> = {
            "test": 8080,
            "dev": 9090,           
        };
        return subdomainPortMap[subdomain];
    };



}