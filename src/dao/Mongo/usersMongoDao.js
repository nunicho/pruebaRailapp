const UserModel = require("./models/users.modelo.js");


class UsersMongoDao {
  async createUser(userData) {
    try {
      const user = await UserModel.create(userData);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async getUserByEmail(email) {
    try {
      const user = await UserModel.findOne({ email });
      return user;
    } catch (error) {
      throw new Error(
        "Error al obtener usuario por correo electrónico desde la base de datos"
      );
    }
  }

  async getUserById(id) {
    return await UserModel.findById(id);
  }

  async getUsers() {
    try {
      const users = await UserModel.find();
      return users;
    } catch (error) {
      throw new Error("Error al obtener usuarios desde la base de datos");
    }
  }

  async updateUser(userId, userData) {
    try {
      const updatedUser = await UserModel.findByIdAndUpdate(userId, userData, {
        new: true,
      });
      return updatedUser;
    } catch (error) {
      throw new Error("Error al actualizar usuario en la base de datos");
    }
  }

  async deleteUser(userId) {
    try {
      await UserModel.findByIdAndDelete(userId);
    } catch (error) {
      throw new Error("Error al eliminar usuario desde la base de datos");
    }
  }

  async getUserByEmailRegister({ email }) {
    try {
      await UserModel.findOne({ email });
    } catch (error) {
      throw new Error("El correo electrónico ya está registrado");
    }
  }
  async getUserByGithubEmail(githubEmail) {
    try {
      const user = await UserModel.findOne({ email: githubEmail });
      return user;
    } catch (error) {
      throw new Error(
        "Error al obtener usuario de GitHub por correo electrónico desde la base de datos"
      );
    }
  }

  async createUserGithub(userData) {
    try {
      const user = await UserModel.create(userData);
      return user;
    } catch (error) {
      throw new Error(
        "Error al crear usuario desde GitHub en la base de datos"
      );
    }
  }
  async getUserByIdGithub(userId) {
    try {
      const user = await UserModel.findById(userId);
      return user;
    } catch (error) {
      throw new Error(
        "Error al obtener usuario de GitHub por ID desde la base de datos"
      );
    }
  }
  async updateLastConnection(email) {
    try {
      const updatedUser = await UserModel.findOneAndUpdate(
        { email: email },
        { last_connection: new Date() },
        { new: true }
      );

      if (!updatedUser) {
        throw new Error(
          `Usuario no encontrado al intentar actualizar last_connection`
        );
      }

      return updatedUser;
    } catch (error) {
      // Manejar el error según tus necesidades
      throw new Error(
        `Error al actualizar last_connection en la base de datos: ${error.message}`
      );
    }
  }
  async updateLastConnectionGithub(email) {
    try {
      const updatedUser = await UserModel.findOneAndUpdate(
        { email: email },
        { last_connection: new Date() },
        { new: true }
      );

      if (!updatedUser) {
        throw new Error(
          `Usuario no encontrado al intentar actualizar last_connection`
        );
      }

      return updatedUser;
    } catch (error) {
      // Manejar el error según tus necesidades
      throw new Error(
        `Error al actualizar last_connection en la base de datos: ${error.message}`
      );
    }
  }
}

module.exports = new UsersMongoDao();
