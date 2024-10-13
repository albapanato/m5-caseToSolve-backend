import { AuthServices } from '../../src/services/auth.js';
import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { HttpError } from '../../src/types/http.error.js';
import { secret } from '../../src/config.js';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthServices', () => {
  const mockPayload = { userId: 1 };
  const mockToken = 'mockToken';
  const mockHash = 'mockHash';
  const mockValue = 'password';

  describe('createJWT', () => {
    it('should create a JWT token', () => {
      jwt.sign.mockReturnValue(mockToken);

      const token = AuthServices.createJWT(mockPayload);

      expect(token).toBe(mockToken);
      expect(jwt.sign).toHaveBeenCalledWith(mockPayload, secret);
    });
  });

  describe('verifyJWTGettingPayload', () => {
    it('should return decoded payload for valid token', () => {
      const decodedPayload = { userId: 1 };
      jwt.verify.mockReturnValue(decodedPayload);

      const result = AuthServices.verifyJWTGettingPayload(mockToken);

      expect(result).toEqual(decodedPayload);
      expect(jwt.verify).toHaveBeenCalledWith(mockToken, secret);
    });

    it('should throw HttpError for invalid token', () => {
      const errorMessage = 'Token expired';
      jwt.verify.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      const error = new HttpError(498, 'Invalid Token', errorMessage);

      expect(() => AuthServices.verifyJWTGettingPayload(mockToken)).toThrow(
        error
      );
    });

    it('should throw HttpError for string result', () => {
      jwt.verify.mockReturnValue('stringResult');

      const error = new HttpError(498, 'Invalid Token', 'stringResult');

      expect(() => AuthServices.verifyJWTGettingPayload(mockToken)).toThrow(
        error
      );
    });
  });

  describe('hash', () => {
    it('should hash a value', async () => {
      hash.mockResolvedValue(mockHash);

      const result = await AuthServices.hash(mockValue);

      expect(result).toBe(mockHash);
      expect(hash).toHaveBeenCalledWith(mockValue, AuthServices.salt);
    });
  });

  describe('compare', () => {
    it('should compare a value with a hash', async () => {
      compare.mockResolvedValue(true);

      const result = await AuthServices.compare(mockValue, mockHash);

      expect(result).toBe(true);
      expect(compare).toHaveBeenCalledWith(mockValue, mockHash);
    });
  });
});
