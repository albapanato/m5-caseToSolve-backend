import { UserController } from '../../src/controllers/user.controller.js';
import { AuthServices } from '../../src/services/auth.js';
import { HttpError } from '../../src/types/http.error.js';

describe('UserController', () => {
  let userController;
  let mockRepo;
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    // Configurar los mocks antes de cada prueba
    mockRepo = {
      create: jest.fn(),
      search: jest.fn(),
    };

    mockRequest = {
      body: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockNext = jest.fn();

    userController = new UserController(mockRepo);
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const hashedPassword = 'hashedPassword';

      // Mockear el método hash de AuthServices
      jest.spyOn(AuthServices, 'hash').mockResolvedValue(hashedPassword);

      // Simular el cuerpo de la solicitud
      mockRequest.body = { userName: 'testuser', password: 'password123' };

      // Simular el método create del repositorio
      mockRepo.create.mockResolvedValue({
        id: '1',
        userName: 'testuser',
        password: hashedPassword,
      });

      // Llamar a la función register
      await userController.register(mockRequest, mockResponse, mockNext);

      // Verificaciones
      expect(AuthServices.hash).toHaveBeenCalledWith('password123');
      expect(mockRepo.create).toHaveBeenCalledWith({
        userName: 'testuser',
        password: hashedPassword,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.send).toHaveBeenCalledWith({
        id: '1',
        userName: 'testuser',
        password: hashedPassword,
      });
    });

    it('should call next with error on failure', async () => {
      const mockError = new Error('Registration error');

      // Mockear el método hash para que falle
      jest.spyOn(AuthServices, 'hash').mockRejectedValue(mockError);

      await userController.register(mockRequest, mockResponse, mockNext);

      // Verificar que next se llame con el error
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });
  describe('login', () => {
    it('should log in a user and return a token and user data', async () => {
      const mockUser = {
        id: '1',
        userName: 'testuser',
        password: 'hashedPassword',
      };
      const mockToken = 'mockedToken';

      // Simular el cuerpo de la solicitud
      mockRequest.body = { user: 'testuser', password: 'password123' };

      // Mockear el método search del repositorio para devolver un usuario
      mockRepo.search.mockResolvedValue([mockUser]);

      // Mockear el método compare para que devuelva true
      jest.spyOn(AuthServices, 'compare').mockResolvedValue(true);

      // Mockear el método createJWT para devolver un token
      jest.spyOn(AuthServices, 'createJWT').mockReturnValue(mockToken);

      // Llamar a la función login
      await userController.login(mockRequest, mockResponse, mockNext);

      // Verificaciones
      expect(mockRepo.search).toHaveBeenCalledWith({
        key: 'userName',
        value: 'testuser',
      });
      expect(AuthServices.compare).toHaveBeenCalledWith(
        'password123',
        'hashedPassword'
      );
      expect(AuthServices.createJWT).toHaveBeenCalledWith({
        id: '1',
        userName: 'testuser',
      });
      expect(mockResponse.send).toHaveBeenCalledWith({
        token: mockToken,
        user: mockUser,
      });
    });

    it('should return an error if user or password is missing', async () => {
      mockRequest.body = { user: 'testuser' };

      await userController.login(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(HttpError));
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 400,
          message: 'Invalid user or password',
        })
      );
    });

    it('should return an error if user not found', async () => {
      mockRequest.body = { user: 'testuser', password: 'password123' };

      // Simular que el usuario no se encuentra
      mockRepo.search.mockResolvedValue([]);

      await userController.login(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(HttpError));
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 400,
          message: 'Invalid user or password',
        })
      );
    });

    it('should return an error if password is incorrect', async () => {
      const mockUser = {
        id: '1',
        userName: 'testuser',
        password: 'hashedPassword',
      };

      mockRequest.body = { user: 'testuser', password: 'wrongPassword' };

      // Simular el usuario encontrado
      mockRepo.search.mockResolvedValue([mockUser]);
      // Mockear el método compare para que devuelva false
      jest.spyOn(AuthServices, 'compare').mockResolvedValue(false);

      await userController.login(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(HttpError));
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 400,
          message: 'Invalid user or password',
        })
      );
    });
  });
});
