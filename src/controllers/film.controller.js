 
import createDebug from 'debug';
import { Controller } from './controller.js';
const debug = createDebug('FP:FilmController');
export class FilmController extends Controller {
  constructor(repo, userRepo) {
    super();
    this.repo = repo;
    this.userRepo = userRepo;
    debug('Instantiated');
  }

  async post(req, res, next) {
    try {
      const { id: userId } = req.body.tokenPayload;
      const user = await this.userRepo.queryById(userId);
      delete req.body.tokenPayload;
      req.body.owner = userId;
      const newFilm = await this.repo.create(req.body);
      user.films.push(newFilm);
      this.userRepo.update(user.id, user);
      res.status(201);
      res.send(newFilm);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = 6;
      const {genre} = req.query;
      let items = [];
      let next = null;
      let previous = null;
      let baseUrl = '';
      if (genre) {
        items = await this.repo.query(page, limit, genre);
        const totalCount = await this.repo.count(genre);
        const totalPages = Math.ceil(totalCount / limit);
        baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
        if (page < totalPages) {
          next = `${baseUrl}?genre=${genre}&page=${page + 1}`;
        }

        if (page > 1) {
          previous = `${baseUrl}?genre=${genre}&page=${page - 1}`;
        }

        const response = {
          items,
          count: await this.repo.count(genre),
          previous,
          next,
        };
        res.send(response);
      } else {
        items = await this.repo.query(page, limit);
        const totalCount = await this.repo.count();
        const totalPages = Math.ceil(totalCount / limit);
        baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
        if (page < totalPages) {
          next = `${baseUrl}?page=${page + 1}`;
        }

        if (page > 1) {
          previous = `${baseUrl}?page=${page - 1}`;
        }

        const response = {
          items,
          count: await this.repo.count(),
          previous,
          next,
        };
        res.send(response);
      }
    } catch (error) {
      next(error);
    }
  }

  async deleteById(req, res, next) {
    try {
      if (!req.body.tokenPayload) {
        throw new Error('No token payload was found');
      }

      await this.repo.delete(req.params.id);
      const { id } = req.body.tokenPayload;
      const user = await this.userRepo.queryById(id);
      const createdFilm = user.films.findIndex(
        (item) => item.id === req.params.id
      );
      user.films.splice(createdFilm, 1);
      await this.userRepo.update(id, user);
      res.status(204);
      res.send();
    } catch (error) {
      next(error);
    }
  }

  async addComment(req, res, next) {
    try {
      const { id: userId } = req.body.tokenPayload;
      const film = await this.repo.queryById(req.params.id);
      const user = await this.userRepo.queryById(userId);
      film.comments.push({ comment: req.body.comment, owner: user });
      const updatedPost = await this.repo.update(req.params.id, film);
      res.send(updatedPost);
    } catch (error) {
      next(error);
    }
  }
}
