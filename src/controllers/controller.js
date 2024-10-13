export class Controller {
  async getAll(req, res, next) {
    try {
      const items = await this.repo.query();
      const response = {
        items,
        count: await this.repo.count(),
      };
      res.send(response);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      res.send(await this.repo.queryById(req.params.id));
    } catch (error) {
      next(error);
    }
  }

  async patch(req, res, next) {
    try {
      res.status(202);
      res.send(await this.repo.update(req.params.id, req.body));
    } catch (error) {
      next(error);
    }
  }

  async deleteById(req, res, next) {
    try {
      res.status(204);
      res.send(await this.repo.delete(req.params.id));
    } catch (error) {
      next(error);
    }
  }
}
