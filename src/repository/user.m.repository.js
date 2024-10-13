import { UserModel } from './user.m.model.js';
import createDebug from 'debug';
import { HttpError } from '../types/http.error.js';
const debug = createDebug('FP:UserRepo');
export class UserRepo {
  constructor() {
    debug('Instantiated', UserModel);
  }

  async query() {
    const allData = await UserModel.find().populate('films', { id: 0 }).exec();
    return allData;
  }

  async queryById(id) {
    const result = await UserModel.findById(id)
      .populate('films', { id: 0 })
      .exec();
    if (result === null)
      throw new HttpError(404, 'Not found', 'No user found with this id');
    return result;
  }

  async search({ key, value }) {
    const result = await UserModel.find({ [key]: value })
      .populate('films', { id: 0 })
      .exec();
    return result;
  }

  async create(data) {
    const newUser = await UserModel.create(data);
    return newUser;
  }

  async update(id, data) {
    const newUser = await UserModel.findByIdAndUpdate(id, data, {
      new: true,
    }).exec();
    if (newUser === null)
      throw new HttpError(404, 'Not found', 'Bad id for the update');
    return newUser;
  }

  async delete(id) {
    const result = await UserModel.findByIdAndDelete(id).exec();
    if (result === null)
      throw new HttpError(404, 'Not found', 'Bad id for the delete');
  }

  async count() {
    return UserModel.countDocuments().exec();
  }
}
