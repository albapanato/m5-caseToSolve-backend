import { HttpError } from '../types/http.error.js';
import mongoose, { mongo } from 'mongoose';
import createDebug from 'debug';
const debug = createDebug('FP:Error Middleware');
export const handleError = (error, _req, res, _next) => {
    debug('Executed');
    if (error instanceof HttpError) {
        console.error(error.status, error.statusMessage, error.message);
        res.status(error.status);
        res.statusMessage = error.message;
        res.send({
            status: error.status,
        });
        return;
    }

    if (error instanceof mongoose.Error.ValidationError) {
        console.error('400 Bad Request', error.message);
        res.status(400);
        res.statusMessage = 'Bad Request';
        res.send({
            status: '400 Bad Request',
        });
        return;
    }

    if (error instanceof mongo.MongoServerError) {
        console.error('406 Not accepted', error.message);
        res.status(406);
        res.statusMessage = 'Not accepted';
        res.send({
            status: '406 Not accepted',
        });
        return;
    }

    console.error(error);
    res.status(500);
    res.send({
        error: error.message,
    });
};
