import { Logging } from "@/logs";
import Helpers, { SetAppRoutes } from "@/utils/helpers";
import { Security } from "@/utils/helpers/security";
import { Request, Response, NextFunction } from "express";

const sigHeaderName = "X-Signature";
export class AppMiddlewares {
  static setHeaders(req: Request, res: Response, next: NextFunction) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin!);
    res.setHeader('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization,x-app-version,x-app-name,x-api-key,Access-Control-Allow-Origin,Cache-Control,Access-Control-Allow-Credentials');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');

    next();
  }

  /**
   * Middleware to protect API routes.
   * 
   * This middleware checks if the API request contains the required API key header.
   * If the key is not present or is invalid, it will return a 404 or 401 status code respectively.
   * If the key is valid, it will set the client secret to the API key and call the next middleware.
   * 
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @param {NextFunction} next - The next middleware function.
   */

  public static isApiProtected() {
    Logging.dev(`API Route is Protected`)
    return (req: Request, res: Response, next: NextFunction) => {
      const headers = req.headers;
      const apiKey = headers["api_key"] || undefined;
      if (typeof apiKey === "undefined") {
        res.status(404).json({
          success: false,
          result: {
            code: 404
          },
          message: "API_KEY is Required",
        });
        res.end();
        return
      }
      if (apiKey !== process.env.API_KEY) {
        res.status(401).json({
          success: false,
          status_code: {
            code: 412
          },
          message: "Invalid KEY, Check API KEY",
        });
        res.end();
        return
      }
      next();
    }

  }
  /**
   * Sets the X-Request-Id and X-Platform headers in the request and response objects.
   *
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @param {NextFunction} next - The next function in the middleware chain.
   */
  public static IRequestHeaders() {
    Logging.dev("IRequestHeaders ID Initiated")
    return (req: Request, res: Response, next: NextFunction) =>{
    const requestId = Helpers.RequestId();
    req.headers['X-Request-Id'] = requestId;
    res.setHeader('X-Request-Id', requestId);
    res.setHeader('X-Platform', "AIRAPI - ENJOYS");
    next();
    }
  }
 
}