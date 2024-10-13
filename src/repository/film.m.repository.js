import createDebug from 'debug';
import { FilmModel } from './film.m.model.js';
import { HttpError } from '../types/http.error.js';
const debug = createDebug('FP:FilmRepo');
export class FilmRepo {
    constructor() {
        debug('Instantiated');
    }

    async query(page = 1, limit = 6, genre) {
        page = Number(page);
        limit = Number(limit);
        const queryObj = {};
        if (genre) {
            queryObj.genre = genre;
        }

        return FilmModel.find(queryObj)
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('owner')
            .exec();
    }

    async count(genre) {
        const queryObj = {};
        if (genre) {
            queryObj.genre = genre;
        }

        return FilmModel.countDocuments(queryObj).exec();
    }

    async queryById(id) {
        const result = await FilmModel.findById(id)
            .populate('owner', { films: 0 })
            .exec();
        if (result === null)
            throw new HttpError(404, 'Not found', 'Wrong id for the query');
        return result;
    }

    async search({ key, value, }) {
        const result = await FilmModel.find({ [key]: value })
            .populate('owner', { films: 0 })
            .exec();
        return result;
    }

    async create(data) {
        const newFilm = await FilmModel.create(data);
        return newFilm;
    }

    async update(id, data) {
        const newFilm = await FilmModel.findByIdAndUpdate(id, data, {
            new: true,
        })
            .populate('owner', { films: 0 })
            .exec();
        if (newFilm === null)
            throw new HttpError(404, 'Not found', 'Wrong id for the update');
        return newFilm;
    }

    async delete(id) {
        const result = await FilmModel.findByIdAndDelete(id).exec();
        if (result === null)
            throw new HttpError(404, 'Not found', 'Wrong id for the delete');
    }
}
