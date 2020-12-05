const localStrategy = require("passport-local").Strategy;
const bcrypt = require('bcrypt');
const passport = require("passport");
const Usuarios = require("./../../models/Usuarios");

passport.use(
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const usuario = await Usuarios.findOne({
          where: {
            correo: email
          },
        });

        if (!bcrypt.compareSync(password, usuario.password) ){
          return done(null, false, { message: "Contraseña incorrecta" });
        }

        return done(null, usuario);
      } catch (error) {
        return done(null, false, { message: "Esa cuenta no existe" });
      }
    }
  )
);

passport.serializeUser((user, callback) => {
  callback(null, user);
});

passport.deserializeUser((user, callback) => {
  callback(null, user);
});

module.exports = passport;
