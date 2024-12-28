import jwt from "jsonwebtoken";
import { Response, Request, NextFunction } from 'express'
import { CONFIG } from "@/app/config";
import { IUser } from "@/utils/interfaces/user.interface";
import { PUBLIC_ROUTE_KEY } from "@/utils/helpers/constants";
import { RouteResolver } from "@/app/common/RouteResolver";
import utils from "@/utils";
import { match } from 'path-to-regexp';

export class JwtAuth {


    /**
     * Validates the user's authorization token.
     *
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     * @param {NextFunction} next - The next function in the middleware chain.
     * @return {void} This function does not return a value.
     */
    static validateUser(req: Request, res: Response, next: NextFunction) {
        try {

            const routeHandler = RouteResolver.mappedRoutes.find((layer: any) => {
                const path = req.originalUrl.split('?')[0]

                const regex = new RegExp(
                    `^${layer.path
                        .replace(/\/:([^/]+)\?/g, '(?:/[^/]*)?')
                        .replace(/\/:([^/]+)/g, '/[^/]+')}$`
                );
                return regex.test(path);
            })?.handler;

            const isPublicRoute = routeHandler && Reflect.getMetadata(PUBLIC_ROUTE_KEY, routeHandler);
            if (isPublicRoute) {
                return next();
            }
            const authHeader = req.cookies?.access_token || req.headers["authorization"] as String || null

            if (!authHeader) {
                res.json({ message: "Authorization header is missing", result: null, success: false })
                res.end()
                return;
            }

            const token = authHeader


            if (!token) {
                res.json({ message: "Authorization Token is missing", result: null, success: false })
                res.end()
                return;

            }
            const decodedToken = utils.verifyJWT(String(token), { issuer: "ENJOYS", jwtid: "web" }) as IUser

            if (!decodedToken) {
                res.json({ message: "Invalid Token", result: null, success: false })
                res.end()
                return;
            }

            req.user = decodedToken

            next()
        } catch (error: any) {
            console.log("error")
            res.json({ message: "Invalid Token", result: error.message, success: false })
            res.end()
            return;

        }

    }
    /**
     * Validates if the user making the request is an admin.
     *
     * @param {Request} req - The request object.
     * @param {Response} res - The response object.
     * @param {NextFunction} next - The next function.
     */


    static Me(req: Request, res: Response, next: NextFunction) {
        try {
            const authHeader = req.cookies?.access_token || req.headers["authorization"] as String || null



            if (!authHeader) {
                res.json({ message: "Authorization header is missing", result: null, success: false })
                res.end()
                return;
            }
            const token = authHeader

            if (!token) {
                res.json({ message: "Authorization Token is missing", result: null, success: false })
                res.end()
                return;
            }
            const decodedToken = utils.verifyJWT(String(token))
            if (!decodedToken) {
                res.json({ message: "Invalid Token", result: null, success: false })
                res.end()
                return;
            }
            res.json({ message: "Validated Token", result: decodedToken, success: true })
            res.end()
            return;
        } catch (error: any) {
            res.json({ message: "Invalid Token", result: error.message, success: false })
            res.end()
            return;
        }
    }
}