import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { secret } from '../config.js';
import { HttpError } from '../types/http.error.js';
export class AuthServices {
  static createJWT(payload) {
    const token = jwt.sign(payload, secret);
    return token;
  }

  static verifyJWTGettingPayload(token) {
    try {
      const result = jwt.verify(token, secret);
      if (typeof result === 'string') {
        throw new HttpError(498, 'Invalid Token', result);
      }

      return result;
    } catch (error) {
      throw new HttpError(498, 'Invalid Token', error.message);
    }
  }

  static hash(value) {
    return hash(value, AuthServices.salt);
  }

  static compare(value, hash) {
    return compare(value, hash);
  }
}

AuthServices.salt = 10;
