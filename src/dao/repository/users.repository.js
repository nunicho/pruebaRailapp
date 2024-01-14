const UsersMongoDao = require("../usersMongoDao.js");

class UserRepository {
  async createUser(userData) {
    return await UsersMongoDao.createUser(userData);
  }

  async getUserByEmail(email) {
    return await UsersMongoDao.getUserByEmail(email);
  }

  async getUserById(id) {
    return await UsersMongoDao.getUserById(id);
  }

  async getUsers() {
    return await UsersMongoDao.getUsers();
  }

  async updateUser(userId, userData) {
    return await UsersMongoDao.updateUser(userId, userData);
  }

  async deleteUser(userId) {
    return await UsersMongoDao.deleteUser(userId);
  }

  async getUserByEmailRegister(email) {
    return await UsersMongoDao.getUserByEmailRegister(email);
  }

  async getUserByGithubEmail(githubEmail) {
    return await UsersMongoDao.getUserByGithubEmail(githubEmail);
  }

  async createUser(userData) {
    return await UsersMongoDao.createUser(userData);
  }
  async getUserByIdGithub(userId) {
    return await UsersMongoDao.getUserByIdGithub(userId);
  }
  async updateLastConnection(email) {
    try {
      return await UsersMongoDao.updateLastConnection(email);
    } catch (error) {
      throw new Error(`Error al actualizar last_connection: ${error.message}`);
    }
  }

  async updateLastConnectionGithub(email) {
    try {
      return await UsersMongoDao.updateLastConnectionGithub(email);
    } catch (error) {
      throw new Error(`Error al actualizar last_connection: ${error.message}`);
    }
  }
}



module.exports = new UserRepository();
