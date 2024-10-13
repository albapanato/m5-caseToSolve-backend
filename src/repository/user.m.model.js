import { Schema, model } from 'mongoose';
const userSchema = new Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    films: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Film',
        },
    ],
});
userSchema.set('toJSON', {
    transform(_document, returnedObject) {
        returnedObject.id = returnedObject._id;
        delete returnedObject.__v;
        delete returnedObject._id;
        delete returnedObject.password;
    },
});
export const UserModel = model('User', userSchema, 'users');
