require("./config/config");
require("./../models/index");
const express = require("express");
const path = require("path");
const routes = require("./../routes/index");
const db = require("./config/db");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("./config/passport");

//SE LEVANTA EL SERVIDOR EXPRESS
const app = express();

//SE CONECTA A LA BASE DE DATOS
db.sync()
  .then(() => console.log("BASE DE DATOS ONLINE"))
  .catch((error) => console.log(error));

//SE ASIGNA EL VIEW ENGINE
app.set("view engine", "pug");

//SE HABILITA LA CARPETA PUBLIC
app.use(express.static("public"));

//OBTENCION DEL BODY DE DATOS}
app.use(bodyParser.urlencoded({ extended: false }));

//SE HABILITAN LAS VISTAS
app.set("views", path.join(__dirname, "./../views"));

app.use(cookieParser());

//SESIONES NOS PERMITE VIAJAR POR PAJINAS SIN VOLVER A AUTENTICAR
app.use(
  session({
    secret: "supersecreto",
    resave: false,
    saveUninitialized: false,
  })
);

//VALIDACION DE INICIO DE SESION
app.use(passport.initialize());
app.use(passport.session());


//AGREGAR FLASH MESSAGES
app.use(flash());

//VARIABLE GLOBAL DE ERRORES
app.use((req, res, next) =>{
    res.locals.mensajes = req.flash()
    next();
})

//SE IMPORTAN LAS RUTAS
app.use('/', routes);

//SE LE ASIGNA UN PUERTO
app.listen(process.env.PORT, () => {
  console.log("Escuchando el puerto ", process.env.PORT);
});
