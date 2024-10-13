import { FilmController } from '../../src/controllers/film.controller';

const mockRepo = {
  create: jest.fn(),
  query: jest.fn(),
  count: jest.fn(),
  queryById: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
};

const mockUserRepo = {
  queryById: jest.fn(),
  update: jest.fn(),
};

const mockRequest = {
  body: { tokenPayload: { id: '1' }, comment: 'Great movie!' },
  params: { id: '1' },
  query: {},
  protocol: 'http',
  get: jest.fn().mockReturnValue('localhost:3000'),
  baseUrl: '/films',
};

const mockResponse = {
  status: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
};

const mockNext = jest.fn();

describe('FilmController', () => {
  let filmController;

  beforeEach(() => {
    filmController = new FilmController(mockRepo, mockUserRepo);
  });
  describe('post', () => {
    it('should create a new film and update user', async () => {
      const mockUser = { id: '1', films: [] };
      const mockNewFilm = { id: '2', title: 'Inception' };
      mockRequest.body = {
        tokenPayload: { id: '1' },
        title: 'Inception',
        description: 'A mind-bending thriller',
      };

      mockUserRepo.queryById.mockResolvedValue(mockUser);
      mockRepo.create.mockResolvedValue(mockNewFilm);

      await filmController.post(mockRequest, mockResponse, mockNext);

      expect(mockUserRepo.queryById).toHaveBeenCalledWith('1');
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ owner: '1' })
      );
      expect(mockUserRepo.update).toHaveBeenCalledWith('1', {
        ...mockUser,
        films: [mockNewFilm],
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.send).toHaveBeenCalledWith(mockNewFilm);
    });

    it('should call next with error on failure', async () => {
      const mockError = new Error('Error');
      // Aseguramos que el tokenPayload esté presente, aunque simulemos un error
      mockRequest.body.tokenPayload = { id: '1' }; // Define tokenPayload aquí.
      // Simulamos el error en userRepo.queryById
      mockUserRepo.queryById.mockRejectedValue(mockError);
      await filmController.post(mockRequest, mockResponse, mockNext);
      // Verificamos que next se llame con el error
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  describe('getAll', () => {
    it('should send paginated films with genre filter and generate next and previous links', async () => {
      const mockFilms = [{ id: '1', title: 'Inception' }];
      mockRequest.query = { page: '1', genre: 'Action' };

      mockRepo.query.mockResolvedValue(mockFilms);
      mockRepo.count.mockResolvedValue(10); // Hay más de una página

      await filmController.getAll(mockRequest, mockResponse, mockNext);

      expect(mockRepo.query).toHaveBeenCalledWith(1, 6, 'Action');
      expect(mockRepo.count).toHaveBeenCalledWith('Action');
      expect(mockResponse.send).toHaveBeenCalledWith({
        items: mockFilms,
        count: 10,
        previous: null, // No hay página anterior
        next: 'http://localhost:3000/films?genre=Action&page=2', // Debe generar el enlace para la siguiente página
      });
    });

    it('should send paginated films without genre filter and generate next and previous links', async () => {
      const mockFilms = [{ id: '1', title: 'Inception' }];
      mockRequest.query = { page: '1' };

      mockRepo.query.mockResolvedValue(mockFilms);
      mockRepo.count.mockResolvedValue(10); // Hay más de una página

      await filmController.getAll(mockRequest, mockResponse, mockNext);

      expect(mockRepo.query).toHaveBeenCalledWith(1, 6);
      expect(mockRepo.count).toHaveBeenCalled();
      expect(mockResponse.send).toHaveBeenCalledWith({
        items: mockFilms,
        count: 10,
        previous: null, // No hay página anterior
        next: 'http://localhost:3000/films?page=2', // Debe generar el enlace para la siguiente página
      });
    });

    it('should send no next link if on the last page with genre', async () => {
      const mockFilms = [{ id: '1', title: 'Inception' }];
      mockRequest.query = { page: '2', genre: 'Action' };

      mockRepo.query.mockResolvedValue(mockFilms);
      mockRepo.count.mockResolvedValue(10); // Solo hay 10 en total

      await filmController.getAll(mockRequest, mockResponse, mockNext);

      expect(mockRepo.query).toHaveBeenCalledWith(2, 6, 'Action');
      expect(mockRepo.count).toHaveBeenCalledWith('Action');
      expect(mockResponse.send).toHaveBeenCalledWith({
        items: mockFilms,
        count: 10,
        previous: 'http://localhost:3000/films?genre=Action&page=1', // Debe haber enlace a la página anterior
        next: null, // No hay siguiente página
      });
    });

    it('should send no next link if on the last page without genre', async () => {
      const mockFilms = [{ id: '1', title: 'Inception' }];
      mockRequest.query = { page: '2' };

      mockRepo.query.mockResolvedValue(mockFilms);
      mockRepo.count.mockResolvedValue(10); // Solo hay 10 en total

      await filmController.getAll(mockRequest, mockResponse, mockNext);

      expect(mockRepo.query).toHaveBeenCalledWith(2, 6);
      expect(mockRepo.count).toHaveBeenCalled();
      expect(mockResponse.send).toHaveBeenCalledWith({
        items: mockFilms,
        count: 10,
        previous: 'http://localhost:3000/films?page=1', // Debe haber enlace a la página anterior
        next: null, // No hay siguiente página
      });
    });
    it('should call next with error on failure', async () => {
      const mockError = new Error('Error');
      mockRepo.query.mockRejectedValue(mockError);

      await filmController.getAll(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });
  describe('deleteById', () => {
    it('should delete film and update user', async () => {
      const mockUser = { id: '1', films: [{ id: '1' }] };

      mockUserRepo.queryById.mockResolvedValue(mockUser);
      mockRepo.delete.mockResolvedValue(true);

      await filmController.deleteById(mockRequest, mockResponse, mockNext);

      expect(mockRepo.delete).toHaveBeenCalledWith('1');
      expect(mockUserRepo.queryById).toHaveBeenCalledWith('1');
      expect(mockUserRepo.update).toHaveBeenCalledWith('1', {
        id: '1',
        films: [],
      });
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should call next with error on failure', async () => {
      const mockError = new Error('Error');
      mockRepo.delete.mockRejectedValue(mockError);
      await filmController.deleteById(mockRequest, mockResponse, mockNext);
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
    it('should throw an error if no token payload is found', async () => {
      // Simulamos que no hay tokenPayload en la solicitud
      mockRequest.body.tokenPayload = undefined;
      await filmController.deleteById(mockRequest, mockResponse, mockNext);
      expect(mockNext).toHaveBeenCalledWith(
        new Error('No token payload was found')
      );
    });
  });
  describe('addComment', () => {
    it('should add comment to film and update it', async () => {
      const mockUser = { id: '1', name: 'John' };
      const mockFilm = { id: '1', comments: [] };
      const updatedFilm = {
        id: '1',
        comments: [{ comment: 'Great movie!', owner: mockUser }],
      };
      mockRequest.body = {
        tokenPayload: { id: '1' },
        comment: 'Great movie!',
      };

      mockUserRepo.queryById.mockResolvedValue(mockUser);
      mockRepo.queryById.mockResolvedValue(mockFilm);
      mockRepo.update.mockResolvedValue(updatedFilm);

      await filmController.addComment(mockRequest, mockResponse, mockNext);

      expect(mockRepo.queryById).toHaveBeenCalledWith('1');
      expect(mockRepo.update).toHaveBeenCalledWith('1', updatedFilm);
      expect(mockResponse.send).toHaveBeenCalledWith(updatedFilm);
    });

    it('should call next with error on failure', async () => {
      const mockError = new Error('Error');
      mockRepo.queryById.mockRejectedValue(mockError);

      await filmController.addComment(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });
});
