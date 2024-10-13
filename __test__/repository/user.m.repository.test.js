import { UserRepo } from '../../src/repository/user.m.repository.js';
import { UserModel } from '../../src/repository/user.m.model.js';
import { HttpError } from '../../src/types/http.error.js';

jest.mock('../../src/repository/user.m.model.js', () => ({
  UserModel: {
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

describe('UserRepo', () => {
  let userRepo;

  beforeEach(() => {
    userRepo = new UserRepo();
  });

  describe('query', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { name: 'John Doe', films: [] },
        { name: 'Jane Doe', films: [] },
      ];

      UserModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUsers),
      });

      const result = await userRepo.query();
      expect(result).toEqual(mockUsers);
      expect(UserModel.find).toHaveBeenCalled();
      expect(UserModel.find().populate).toHaveBeenCalledWith('films', {
        id: 0,
      });
    });
  });

  describe('queryById', () => {
    it('should return a user by id', async () => {
      const mockUser = { name: 'John Doe', films: [] };

      UserModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await userRepo.queryById('someId');
      expect(result).toEqual(mockUser);
      expect(UserModel.findById).toHaveBeenCalledWith('someId');
      expect(UserModel.findById().populate).toHaveBeenCalledWith('films', {
        id: 0,
      });
    });

    it('should throw HttpError if user not found', async () => {
      UserModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(userRepo.queryById('someId')).rejects.toThrow(HttpError);
      await expect(userRepo.queryById('someId')).rejects.toThrow(
        'No user found with this id'
      );
    });
  });

  describe('search', () => {
    it('should search users by key and value', async () => {
      const mockUsers = [{ name: 'John Doe', films: [] }];

      UserModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUsers),
      });

      const result = await userRepo.search({ key: 'name', value: 'John Doe' });
      expect(result).toEqual(mockUsers);
      expect(UserModel.find).toHaveBeenCalledWith({ name: 'John Doe' });
      expect(UserModel.find().populate).toHaveBeenCalledWith('films', {
        id: 0,
      });
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const mockUser = { name: 'John Doe', films: [] };

      UserModel.create.mockResolvedValue(mockUser);

      const result = await userRepo.create({ name: 'John Doe' });
      expect(result).toEqual(mockUser);
      expect(UserModel.create).toHaveBeenCalledWith({ name: 'John Doe' });
    });
  });

  describe('update', () => {
    it('should update a user by id', async () => {
      const mockUser = { name: 'John Doe', films: [] };

      UserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await userRepo.update('someId', { name: 'John Updated' });
      expect(result).toEqual(mockUser);
      expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'someId',
        { name: 'John Updated' },
        { new: true }
      );
    });

    it('should throw HttpError if user not found for update', async () => {
      UserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        userRepo.update('someId', { name: 'John Updated' })
      ).rejects.toThrow(HttpError);
      await expect(
        userRepo.update('someId', { name: 'John Updated' })
      ).rejects.toThrow('Bad id for the update');
    });
  });

  describe('delete', () => {
    it('should delete a user by id', async () => {
      UserModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(true),
      });

      await userRepo.delete('someId');
      expect(UserModel.findByIdAndDelete).toHaveBeenCalledWith('someId');
    });

    it('should throw HttpError if user not found for delete', async () => {
      UserModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(userRepo.delete('someId')).rejects.toThrow(HttpError);
      await expect(userRepo.delete('someId')).rejects.toThrow(
        'Bad id for the delete'
      );
    });
  });

  describe('count', () => {
    it('should return the count of users', async () => {
      UserModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(5),
      });

      const result = await userRepo.count();
      expect(result).toBe(5);
      expect(UserModel.countDocuments).toHaveBeenCalled();
    });
  });
});
