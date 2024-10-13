import { handleError } from '../../src/middleware/error.js';
import { HttpError } from '../../src/types/http.error.js';
import mongoose, { mongo } from 'mongoose';

describe('Error Middleware', () => {
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      statusMessage: '',
    };
    mockNext = jest.fn();
  });

  it('should handle HttpError correctly', () => {
    const error = new HttpError(
      404,
      'Not Found',
      'The requested resource was not found'
    );

    handleError(error, {}, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.statusMessage).toBe(
      'The requested resource was not found'
    );
    expect(mockResponse.send).toHaveBeenCalledWith({ status: 404 });
  });

  it('should handle mongoose.ValidationError correctly', () => {
    const error = new mongoose.Error.ValidationError();

    handleError(error, {}, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.statusMessage).toBe('Bad Request');
    expect(mockResponse.send).toHaveBeenCalledWith({
      status: '400 Bad Request',
    });
  });

  it('should handle mongo.MongoServerError correctly', () => {
    const error = new mongo.MongoServerError('Invalid operation');

    handleError(error, {}, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(406);
    expect(mockResponse.statusMessage).toBe('Not accepted');
    expect(mockResponse.send).toHaveBeenCalledWith({
      status: '406 Not accepted',
    });
  });

  it('should handle generic errors correctly', () => {
    const error = new Error('Something went wrong');

    handleError(error, {}, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.send).toHaveBeenCalledWith({
      error: 'Something went wrong',
    });
  });
});
