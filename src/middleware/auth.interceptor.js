import createDebug from 'debug';
import { HttpError } from '../types/http.error.js';
import { AuthServices } from '../services/auth.js';
const debug = createDebug('FP:AuthInterceptor');
export class AuthInterceptor {
  constructor(filmRepo) {
    this.filmRepo = filmRepo;
    debug('Instantiated');
  }

  logged(req, res, next) {
    try {
      const authHeader = req.get('Authorization');
      if (!authHeader) {
        throw new HttpError(401, 'Not Authorized', 'Not Authorization header');
      }

      if (!authHeader.startsWith('Bearer')) {
        throw new HttpError(
          401,
          'Not Authorized',
          'Not Bearer in Authorization header'
        );
      }

      const token = authHeader.slice(7);
      const payload = AuthServices.verifyJWTGettingPayload(token);
      req.body.tokenPayload = payload;
      next();
    } catch (error) {
      next(error);
    }
  }

  async authorizedForFilms(req, res, next) {
    try {
      if (!req.body.tokenPayload) {
        throw new HttpError(
          498,
          'Token not found',
          'Token not found in Authorized interceptor'
        );
      }

      const { id: userID } = req.body.tokenPayload;
      const { id: filmId } = req.params;
      const film = await this.filmRepo.queryById(filmId);
      if (film.owner.id !== userID) {
        throw new HttpError(401, 'Not authorized', 'Not authorized');
      }

      next();
    } catch (error) {
      next(error);
    }
  }
}
