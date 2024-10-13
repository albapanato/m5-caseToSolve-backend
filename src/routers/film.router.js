import createDebug from 'debug';
import { Router as createRouter } from 'express';
import { FilmRepo } from '../repository/film.m.repository.js';
import { UserRepo } from '../repository/user.m.repository.js';
import { FilmController } from '../controllers/film.controller.js';
import { AuthInterceptor } from '../middleware/auth.interceptor.js';
import { FileMiddleware } from '../middleware/files.js';
const debug = createDebug('FP:FilmRouter');
debug('Executed');
const filmRepo = new FilmRepo();
const userRepo = new UserRepo();
const controller = new FilmController(filmRepo, userRepo);
const interceptor = new AuthInterceptor(filmRepo);
const fileStore = new FileMiddleware();
export const filmRouter = createRouter();
filmRouter.get('/', controller.getAll.bind(controller));
filmRouter.get('/:id', controller.getById.bind(controller));
filmRouter.post(
  '/',
  interceptor.logged.bind(interceptor),
  fileStore.singleFileStore('poster').bind(fileStore),
  fileStore.saveDataImage.bind(fileStore),
  controller.post.bind(controller)
);
filmRouter.patch(
  '/:id',
  interceptor.logged.bind(interceptor),
  fileStore.singleFileStore('poster').bind(fileStore),
  interceptor.authorizedForFilms.bind(interceptor),
  controller.patch.bind(controller)
);
filmRouter.delete(
  '/:id',
  interceptor.logged.bind(interceptor),
  interceptor.authorizedForFilms.bind(interceptor),
  controller.deleteById.bind(controller)
);
filmRouter.patch(
  '/addcomment/:id',
  interceptor.logged.bind(interceptor),
  controller.addComment.bind(controller)
);
