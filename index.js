import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import http from 'http';
import { Server as socketIo } from 'socket.io';
import session from 'express-session';
import passport from 'passport';

import { MONGODB_URI, PORT } from './src/config/index.js';
import unknownEndpoint from './src/middlewares/unknownEndpoint.js';
import router from './src/routes/index.js';
import taskSocket from './src/socket/taskSocket.js';
import commentSocket from './src/socket/commentSocket.js';

const app = express();
const server = http.createServer(app); 
const io = new socketIo(server, {
    cors: {
      origin: '*',
      methods: '*',
    },
});

app.use(express.json({ limit: '25mb' }));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'SECRET' 
  }));
app.use(passport.initialize());
app.use(passport.session());
app.use('/uploads', express.static('uploads'));

app.use('/taskhub', router);

taskSocket(io.of('/'));
commentSocket(io.of('/'));

app.use(unknownEndpoint);

async function startApp() {
    try {
        await mongoose.connect(MONGODB_URI);
        server.listen(PORT, () => {
            console.log(`Server started on port ${PORT}!`);
        });
    } catch (e) {
        console.error(e);
    }
}
startApp();



