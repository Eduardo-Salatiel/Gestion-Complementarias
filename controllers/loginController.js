const passport = require("passport");
const bcrypt = require("bcrypt");
const Usuarios = require("./../models/Usuarios");

exports.loginIndex = (req, res) => {
  const { error } = res.locals.mensajes;
  res.render("login", {
    error,
    nombrePagina: "Inicio",
  });
};

exports.autenticarUsuario = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/iniciar-sesion",
  failureFlash: true,
  badRequestMessage: "Ambos campos son obligatorios",
});

//-------PASSWORD-------
exports.asignarPasswordForm = (req, res) => {
  const token = req.params.token;
  res.render("configPass", {
    nombrePagina: "Configurar Contraseña",
    token,
  });
};

exports.asignarPassword = async (req, res) => {
  const token = req.params.token;
  const { pass } = req.body;
  const url = `http://${req.headers.host}/configurar-password/${token}`;
  const usuario = await Usuarios.findOne({ where: { token: token } });

  if (!usuario) {
    req.flash("error", "Ha ocurrido un error");
    res.render("configPass", {
      nombrePagina: "Configurar Contraseña",
      token,
      mensajes: req.flash(),
    });
  }
  if (pass.trim() === "") {
    req.flash("error", "Ha ocurrido un error");
    res.render("configPass", {
      nombrePagina: "Configurar Contraseña",
      token,
      mensajes: req.flash(),
    });
  }

  usuario.password = bcrypt.hashSync(pass, bcrypt.genSaltSync(10));
  usuario.token = null;
  await usuario.save();
  res.render("login", {
    nombrePagina: "Inicio",
  });
};

exports.usuarioAutenticado = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect("/iniciar-sesion");
};

exports.cerrarSesion = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/iniciar-sesion");
  });
};



