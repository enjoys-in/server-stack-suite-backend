import { ExpressValidator } from 'express-validator';
const myExpressValidator = new ExpressValidator();
const { query, body } = myExpressValidator;

export const UserRefreshTokenValidator = () => query('token').isString().notEmpty().withMessage('Please Provide Token query string');


export const ReqValidator = {
    Login: [
        body('email').isString().isEmail().withMessage('Please Enter Valid Email Address').notEmpty().withMessage('Please Provide Email Address'),
        body('password').isString().isLength({ min: 6, max: 16 }).withMessage('Password should be 6 to 16 characters').notEmpty().withMessage('Please Provide Password'),
    ],
    Register: [
        body('name').isString().isEmail().withMessage('Please Enter Valid Email Address').notEmpty().withMessage('Please Provide Email Address'),     
        body('email').isString().isEmail().withMessage('Please Enter Valid Email Address').notEmpty().withMessage('Please Provide Email Address'),
        body('password').isString().isLength({ min: 6, max: 16 }).withMessage('Password should be 6 to 16 characters').notEmpty().withMessage('Please Provide Password'),
    ],
    UpdatePassword: [
        body('old_password').isString().isLength({ min: 6, max: 16 }).withMessage('Old Password should be 6 to 16 characters').notEmpty().withMessage('Please Provide Password'),
        body('new password').isString().isLength({ min: 6, max: 16 }).withMessage('New Password should be 6 to 16 characters').notEmpty().withMessage('Please Provide Password'),

    ],
    
}