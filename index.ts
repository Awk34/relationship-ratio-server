import express, {Request, Response, Router} from 'express';
import {interactionRouter, init as interactionInit} from './routes/interaction';
import {userRouter, init as userInit} from './routes/user';
import {createDb} from './db';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

const PORT = process.env.PORT || process.env.NODE_ENV === 'production' ? '80' : '8080';

const app = express();

app.use(cookieParser());
app.use(bodyParser());

app.get('/', (req: Request, res: Response) => {
    res.send('hello world');
});

createDb().then(() => Promise.all([interactionInit(), userInit()])).then(() => {
    app.use('/interaction', interactionRouter);
    app.use('/user', userRouter);

    app.listen(PORT, () => {
        console.info(`Server listening on port ${PORT}`);
    });
}).catch((err) => {
    console.error(`Couldn't start DB`);
    console.error(err);
    process.exit(1);
});
