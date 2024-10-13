import mongoose from 'mongoose';
import { user, passwd, db, cluster } from '../config.js';
export const dbConnect = () => {
    const uri = `mongodb+srv://${user}:${passwd}@${cluster}/${db}?retryWrites=true&w=majority`;
    return mongoose.connect(uri);
};
