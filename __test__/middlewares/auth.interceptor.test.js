import { AuthInterceptor } from '../../src/middleware/auth.interceptor.js';
import { HttpError } from '../../src/types/http.error.js';
import { AuthServices } from '../../src/services/auth.js';

jest.mock('../../src/services/auth.js');
const filmRepoMock = {
  queryById: jest.fn(),
};

describe('AuthInterceptor', () => {
  let authInterceptor;
  let req;
  let res;
  let next;

  beforeEach(() => {
    authInterceptor = new AuthInterceptor(filmRepoMock);
    req = {
      get: jest.fn(),
      body: {},
      params: {},
    };
    res = {};
    next = jest.fn();
  });

  describe('logged', () => {
    it('should call next() with error if Authorization header is missing', () => {
      req.get.mockReturnValueOnce(undefined); // Simular si no hay encabezado

      authInterceptor.logged(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(HttpError));
      expect(next.mock.calls[0][0].status).toBe(401);
    });

    it('should call next() with error if Authorization header does not start with Bearer', () => {
      req.get.mockReturnValueOnce('Basic token');

      authInterceptor.logged(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(HttpError));
      expect(next.mock.calls[0][0].status).toBe(401);
    });

    it('should call next() and attach payload to req.body if token is valid', () => {
      const tokenPayload = { id: 1 };
      req.get.mockReturnValueOnce('Bearer validtoken');
      AuthServices.verifyJWTGettingPayload.mockReturnValueOnce(tokenPayload);

      authInterceptor.logged(req, res, next);

      expect(req.body.tokenPayload).toEqual(tokenPayload);
      expect(next).toHaveBeenCalled();
    });

    it('should call next() with error if JWT verification fails', () => {
      req.get.mockReturnValueOnce('Bearer validtoken');
      AuthServices.verifyJWTGettingPayload.mockImplementation(() => {
        throw new Error('JWT verification failed');
      });

      authInterceptor.logged(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('authorizedForFilms', () => {
    it('should call next() with error if tokenPayload is missing', async () => {
      await authInterceptor.authorizedForFilms(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(HttpError));
      expect(next.mock.calls[0][0].status).toBe(498);
    });

    it('should call next() and allow access if user is authorized', async () => {
      req.body.tokenPayload = { id: 'userId' };
      req.params.id = 'filmId';
      const film = { owner: { id: 'userId' } };
      filmRepoMock.queryById.mockResolvedValueOnce(film);

      await authInterceptor.authorizedForFilms(req, res, next);

      expect(next).toHaveBeenCalled(); // Verificar que next() se llama sin errores
    });

    it('should call next() with error if user is not authorized', async () => {
      req.body.tokenPayload = { id: 'userId' };
      req.params.id = 'filmId';
      const film = { owner: { id: 'anotherUserId' } };
      filmRepoMock.queryById.mockResolvedValueOnce(film);

      await authInterceptor.authorizedForFilms(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(HttpError));
      expect(next.mock.calls[0][0].status).toBe(401);
    });
  });
});
