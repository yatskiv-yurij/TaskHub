import jwt from 'jsonwebtoken';

import { SECRET_KEY } from '../config/index.js';

export const checkAccess = (req, res, next) => {
    const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');
    if(token) {
        try {
           const decoded = jwt.verify(token, SECRET_KEY); 
           req.userId = decoded._id;
           req.email = decoded.email
           next();
        } catch (e) {
            return res.status(403).json({
                message: 'No access',
            });
        }
    }else{
        console.log("He")
        return res.status(403).json({
            message: 'No access',
        });
    }
}