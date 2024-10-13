import { Schema, model } from 'mongoose';
const filmSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    release: {
        type: String,
        required: true,
        trim: true,
    },
    genre: {
        type: String,
        required: true,
        trim: true,
    },
    synopsis: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    poster: {
        type: {
            urlOriginal: { type: String },
            url: { type: String },
            mimetype: { type: String },
            size: { type: Number },
        },
        required: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    comments: [
        {
            comment: { type: String },
            owner: {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        },
    ],
});
filmSchema.set('toJSON', {
    transform(_document, returnedObject) {
        returnedObject.id = returnedObject._id;
        delete returnedObject.__v;
        delete returnedObject._id;
        delete returnedObject.passwd;
    },
});
export const FilmModel = model('Film', filmSchema, 'films');
