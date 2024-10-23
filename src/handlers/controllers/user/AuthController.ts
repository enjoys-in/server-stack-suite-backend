import { CONFIG } from "@/app/config";
import { UserEntity } from "@/factory/entities/users.entity";
import { InjectRepository } from "@/factory/typeorm";
import utils from "@/utils";
import { AsyncHandler } from "@/utils/libs/AsyncHandler";
import type { Request, Response } from "express";
import moment from "moment";


class AuthController {


    async Login(req: Request, res: Response) {
        try {
            const { email, password } = req.body
            const isUser = await InjectRepository(UserEntity).findOne({
                where: { email },
            })
            if (!isUser) {
                throw new Error('Invalid credentials')
            }
            if (!utils.ComparePassword(isUser.password, password)) {
                throw new Error('Invalid credentials')
            }

            const token = utils.signJWT({
                uid: isUser.id,
                email: isUser.email,
                isFirstLogin: isUser.isfirstlogin
            }, "web")
            const cookieExpiration = moment(new Date()).add(CONFIG.SECRETS.JWT_SECRET_EXPIRATION, "days").toDate()
            res.cookie('access_token', token, { httpOnly: true, expires: cookieExpiration });
            req.session["id"] = isUser.id.toString()
            res.json({
                message: "OK", result: {
                    access_token: token,
                    type: "Bearer",
                    expires_at: CONFIG.SECRETS.JWT_SECRET_EXPIRATION
                }, success: true
            })
        } catch (error: any) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
        }
    }


    async Register(req: Request, res: Response) {
        try {
            const isUser = await InjectRepository(UserEntity).findOne(req.body.email)
            if (isUser) {
                throw new Error(`User ${req.body.email} already exists`)
            }
            res.json({ message: "User created successfully", result: await InjectRepository(UserEntity).save(req.body), success: true });

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
        }
    }

    async UpdatePassword(req: Request, res: Response) {
        try {
            res.json({ message: "OK", result: null, success: true });

        } catch (error) {
            if (error instanceof Error) {
                res.json({ message: error.message, result: null, success: false })
                return;
            }
            res.json({ message: "Something went wrong", result: null, success: false })
        }
    }
}

export default new AuthController()