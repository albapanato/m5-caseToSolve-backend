import { Controller } from '../../src/controllers/controller';

// Mockear el reposirtorio y otros objetivos necesarios
const mockRepo = {
  query: jest.fn(),
  count: jest.fn(),
  queryById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockRequest = {
  params: { id: '1' },
  body: {},
};

const mockResponse = {
  status: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
};

const mockNext = jest.fn();

describe('Controller', () => {
  describe('Controller getAll', () => {
    let controller;
    beforeEach(() => {
      controller = new Controller();
      controller.repo = mockRepo;
    });
    it('should send response with items and count', async () => {
      const mockItems = ['item1', 'item2'];
      const mockCount = 2;
      mockRepo.query.mockResolvedValue(mockItems);
      mockRepo.count.mockResolvedValue(mockCount);

      await controller.getAll(mockRequest, mockResponse, mockNext);

      expect(mockResponse.send).toHaveBeenCalledWith({
        items: mockItems,
        count: mockCount,
      });
    });
    it('should call next with error on failure', async () => {
      const mockError = new Error('Error');
      mockRepo.query.mockRejectedValue(mockError);

      await controller.getAll(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });
  describe('Controller getById', () => {
    let controller;

    beforeEach(() => {
      controller = new Controller();
      controller.repo = mockRepo;
    });

    it('should send item by id', async () => {
      const mockItem = { id: '1', name: 'item1' };
      mockRepo.queryById.mockResolvedValue(mockItem);

      await controller.getById(mockRequest, mockResponse, mockNext);

      expect(mockRepo.queryById).toHaveBeenCalledWith('1');
      expect(mockResponse.send).toHaveBeenCalledWith(mockItem);
    });

    it('should call next with error on failure', async () => {
      const mockError = new Error('Error');
      mockRepo.queryById.mockRejectedValue(mockError);

      await controller.getById(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  describe('Controller patch', () => {
    let controller;

    beforeEach(() => {
      controller = new Controller();
      controller.repo = mockRepo;
    });

    it('should update item and send response', async () => {
      const updatedItem = { id: '1', name: 'updatedItem' };
      mockRepo.update.mockResolvedValue(updatedItem);

      await controller.patch(mockRequest, mockResponse, mockNext);

      expect(mockRepo.update).toHaveBeenCalledWith('1', mockRequest.body);
      expect(mockResponse.status).toHaveBeenCalledWith(202);
      expect(mockResponse.send).toHaveBeenCalledWith(updatedItem);
    });

    it('should call next with error on failure', async () => {
      const mockError = new Error('Error');
      mockRepo.update.mockRejectedValue(mockError);

      await controller.patch(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  describe('Controller deleteById', () => {
    let controller;

    beforeEach(() => {
      controller = new Controller();
      controller.repo = mockRepo;
    });

    it('should delete item and send response', async () => {
      mockRepo.delete.mockResolvedValue({ success: true });

      await controller.deleteById(mockRequest, mockResponse, mockNext);

      expect(mockRepo.delete).toHaveBeenCalledWith('1');
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should call next with error on failure', async () => {
      const mockError = new Error('Error');
      mockRepo.delete.mockRejectedValue(mockError);

      await controller.deleteById(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });
});
