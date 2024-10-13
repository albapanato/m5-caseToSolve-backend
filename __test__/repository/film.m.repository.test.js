import { FilmRepo } from '../../src/repository/film.m.repository.js';
import { FilmModel } from '../../src/repository/film.m.model.js';
import { HttpError } from '../../src/types/http.error.js';

jest.mock('../../src/repository/film.m.model.js', () => ({
  FilmModel: {
    find: jest.fn(),
    findById: jest.fn(),
    countDocuments: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

describe('FilmRepo', () => {
  let filmRepo;

  beforeEach(() => {
    filmRepo = new FilmRepo();
  });

  describe('query', () => {
    it('should return films with pagination', async () => {
      const mockFilms = [{ title: 'Film 1' }, { title: 'Film 2' }];
      FilmModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockFilms),
      });

      const result = await filmRepo.query(1, 6, 'Action');
      expect(result).toEqual(mockFilms);
      expect(FilmModel.find).toHaveBeenCalledWith({ genre: 'Action' });
      expect(FilmModel.find().skip).toHaveBeenCalledWith(0);
      expect(FilmModel.find().limit).toHaveBeenCalledWith(6);
      expect(FilmModel.find().populate).toHaveBeenCalledWith('owner');
    });

    it('should return films without genre filter', async () => {
      const mockFilms = [{ title: 'Film 1' }, { title: 'Film 2' }];
      FilmModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockFilms),
      });

      const result = await filmRepo.query(2, 6);
      expect(result).toEqual(mockFilms);
      expect(FilmModel.find).toHaveBeenCalledWith({});
    });
  });

  describe('count', () => {
    it('should return the count of films with genre filter', async () => {
      FilmModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(5),
      });

      const result = await filmRepo.count('Action');
      expect(result).toBe(5);
      expect(FilmModel.countDocuments).toHaveBeenCalledWith({
        genre: 'Action',
      });
    });

    it('should return the count of all films without genre filter', async () => {
      FilmModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(10),
      });

      const result = await filmRepo.count();
      expect(result).toBe(10);
      expect(FilmModel.countDocuments).toHaveBeenCalledWith({});
    });
  });

  describe('queryById', () => {
    it('should return a film by id', async () => {
      const mockFilm = { title: 'Film 1' };

      FilmModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockFilm),
      });

      const result = await filmRepo.queryById('someId');
      expect(result).toEqual(mockFilm);
      expect(FilmModel.findById).toHaveBeenCalledWith('someId');
      expect(FilmModel.findById().populate).toHaveBeenCalledWith('owner', {
        films: 0,
      });
    });

    it('should throw HttpError if film not found', async () => {
      FilmModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(filmRepo.queryById('someId')).rejects.toThrow(HttpError);
      await expect(filmRepo.queryById('someId')).rejects.toThrow(
        'Wrong id for the query'
      );
    });
  });

  describe('search', () => {
    it('should search films by key and value', async () => {
      const mockFilms = [{ title: 'Film 1' }];

      FilmModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockFilms),
      });

      const result = await filmRepo.search({ key: 'title', value: 'Film 1' });
      expect(result).toEqual(mockFilms);
      expect(FilmModel.find).toHaveBeenCalledWith({ title: 'Film 1' });
      expect(FilmModel.find().populate).toHaveBeenCalledWith('owner', {
        films: 0,
      });
    });
  });

  describe('create', () => {
    it('should create a new film', async () => {
      const mockFilm = { title: 'Film 1' };

      FilmModel.create.mockResolvedValue(mockFilm);

      const result = await filmRepo.create({ title: 'Film 1' });
      expect(result).toEqual(mockFilm);
      expect(FilmModel.create).toHaveBeenCalledWith({ title: 'Film 1' });
    });
  });

  describe('update', () => {
    it('should update a film by id', async () => {
      const mockFilm = { title: 'Film Updated' };

      FilmModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockFilm),
      });

      const result = await filmRepo.update('someId', { title: 'Film Updated' });
      expect(result).toEqual(mockFilm);
      expect(FilmModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'someId',
        { title: 'Film Updated' },
        { new: true }
      );
      expect(FilmModel.findByIdAndUpdate().populate).toHaveBeenCalledWith(
        'owner',
        { films: 0 }
      );
    });

    it('should throw HttpError if film not found for update', async () => {
      FilmModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        filmRepo.update('someId', { title: 'Film Updated' })
      ).rejects.toThrow(HttpError);
      await expect(
        filmRepo.update('someId', { title: 'Film Updated' })
      ).rejects.toThrow('Wrong id for the update');
    });
  });

  describe('delete', () => {
    it('should delete a film by id', async () => {
      FilmModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(true),
      });

      await filmRepo.delete('someId');
      expect(FilmModel.findByIdAndDelete).toHaveBeenCalledWith('someId');
    });

    it('should throw HttpError if film not found for delete', async () => {
      FilmModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(filmRepo.delete('someId')).rejects.toThrow(HttpError);
      await expect(filmRepo.delete('someId')).rejects.toThrow(
        'Wrong id for the delete'
      );
    });
  });
});
