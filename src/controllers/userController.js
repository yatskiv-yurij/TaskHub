import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import axios from 'axios';
import { validationResult } from 'express-validator';


import User from "../models/User.js";
import { SECRET_KEY } from '../config/index.js';

const userController = {

    async checkUser(req, res){
        try{
            const email = req.body.email;

            const candidate = await User.findOne({ email })
            if (candidate) return res.status(200).json({ 
                isUser: true
             });

            return res.status(200).json({
                isUser: false
            })
        }catch (error) {
            console.log(error);
            return res.status(400).json({ error: 'Failed find user' });
        }
    },
    async register(req, res){
        try {
            const { fullname, email, password, image, username } = req.body;

            const errors = validationResult(req);
            if(!errors.isEmpty()){
                return res.status(400).json(errors.array());
            }
            let hash = null;
            if(password){
                const salt = await bcrypt.genSalt(10);
                hash = await bcrypt.hash(password, salt);
            }

            const candidate = await User.findOne({ email })
            if (candidate) return res.status(409).json({ error: 'User already exist' });

            const doc = new User({
                fullname,
                email,
                passwordHash: hash,
                image,
                username
            })
            
            const user = await User.create(doc);
            const token = jwt.sign({
                    _id: user._id,
                    email: user.email,
                    fullname: user.fullname
                },
                SECRET_KEY,
                {
                    expiresIn: '30d',
                }
            );
            const {passwordHash, ...userData} = user._doc;
            return res.status(200).json({token, ...userData});
        } catch (error) {
            console.log(error);
            return res.status(400).json({ error: 'Failed create user' });
        }
    },
    async login(req, res) {
        try {
            const user = await User.findOne({ email: req.body.email });
    
            if(!user) {
                return res.status(400).json({
                    message: "Invalid login or password",
                });
            }
    
            if(req.body.password){
                const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);
                if(!isValidPass) {
                    return res.status(400).json({
                        message: "Invalid login or password",
                    });
                }
            }
    
            const token = jwt.sign({
                    _id: user._id,
                    email: user.email,
                    fullname: user.fullname
                },
                SECRET_KEY,
                {
                    expiresIn: '30d',
                }
            );
    
            const {passwordHash, ...userData} = user._doc;
    
            res.json({
                ...userData,
                token,
            });
    
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                message: "Authorization failed",
            });
        }
    },
    async getMe(req, res) {
        try {
            const user = await User.findById(req.userId);
            if(!user) {
                return res.status(404).json({
                    message: "User not found",
                });
            }

            res.json({
               ...user._doc,
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({
                message: "No access",
            });
        }
    },
    async getMeForChangePass(req, res){
        try {
            const user = await User.findOne({ email: req.body.email });
            if(!user) {
                return res.status(404).json({
                    message: "User not found",
                });
            }

            const {passwordHash, ...userData} = user._doc;
    
            res.json({
                ...userData,
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({
                message: "No access",
            });
        }
    },
    async checkAuthGoogle(req, res){
        const googleToken = req.body.token;
        try {
            // Валідація токену через Google API
            const googleResponse = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${googleToken}`);
            const userData = googleResponse.data;
        
            // Повернення відповіді на клієнт
            res.status(200).send({ success: true, userData: userData });
        } catch (error) {
            console.error('Error validating Google token:', error.message);
            res.status(401).send({ success: false, error: 'Invalid token' });
        }
    },
    async checkAuthGitHub(req, res){
        const code = req.body.code;

        if (!code) {
            return res.status(400).send('Invalid authorization code');
        }

        try {
            const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', null, {
            params: {
                client_id: 'e472c1ac15d95cb2f88c',
                client_secret: '32cb5d7ed6a0fb30d62519a4057d4ce58c1906cb',
                code: code,
            },
            headers: {
                Accept: 'application/json',
            },
            });

            const accessToken = tokenResponse.data.access_token;
            
            res.json({
                token: accessToken,
            });
        } catch (error) {
            console.error('Error exchanging code for access token:', error.message);
            res.status(500).send('Internal server error');
        }
    },
    async updateMe(req, res) {
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                return res.status(400).json(errors.array());
            }

            let updateUser = null;
            const id = req.userId;
            if(req.body.password){
                const password = req.body.password;
                const salt = await bcrypt.genSalt(10);
                req.body.passwordHash = await bcrypt.hash(password, salt);

                updateUser = await User.findByIdAndUpdate(id, req.body, {
                    new: true,
                });
            }else{
                updateUser = await User.findByIdAndUpdate(id, req.body, {
                    new: true,
                });
            }
    
            return res.status(200).json(updateUser);
            
        } catch (err) {
            console.log(err);
            res.status(500).json({
                message: "Failed to update data",
            })
        }
    },

    async checkPass(req, res){
        try {
            const user = await User.findById(req.userId);
            if(user.passwordHash == null){
                res.status(200).json({
                    success: true
                });
            }else{
                if(await bcrypt.compare(req.query.password, user._doc.passwordHash)){
                    res.status(200).json({
                        success: true
                    });
                }else{
                    res.status(200).json({
                        success: false
                    });
                }
            }
            
            
        } catch (err) {
            console.log(err);
            res.status(500).json({
                message: "No access",
            });
        }
    },

    async newPass(req, res){
        try {
            const { id, password } = req.body;
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            await User.findByIdAndUpdate( id , { passwordHash }, {
                new: true,
            });
            res.status(200).json({
                success: true
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({
                message: "No access",
            });
        }
    },

    async getUserInfo(req, res){
        try {
            const user = await User.find({ email: {$in: req.body.emails}}, 'id email fullname image');
            if(!user) {
                return res.status(404).json({
                    message: "User not found",
                });
            }

            res.json([...user
            ]);
        } catch (err) {
            console.log(err);
            res.status(500).json({
                message: "No access",
            });
        }
    },

    async deleteUser(req, res){
        try {
             await User.deleteOne({_id: req.userId});
            res.status(200).json({
                success: true
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({
                message: "No access",
            });
        }
    }
}



export default userController;