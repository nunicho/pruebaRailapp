const authMiddleware = {
  auth: (req, res, next) => {
    if (req.session.usuario) {
      next();
    } else {
      return res.redirect("/login");
    }
  },

  auth2: (req, res, next) => {
    if (req.session.usuario) {
      return res.redirect("/");
    } else {
      next();
    }
  },

  authRol: (roles) => {
    return (req, res, next) => {
      const user = req.session.usuario;
      if (!user || !roles.includes(user.role)) {
        return res
          .status(403)
          .send("No tienes permisos para acceder a esta ruta");
      }
      next();
    };
  },
};

module.exports = authMiddleware;
