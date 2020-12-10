require("./../models/index");
const express = require("express");
const imprimir = require('./../helpers/imprimir')
const path = require("path");
const routes = require("./../routes/index");
const db = require("./config/db");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("./config/passport");
const fileUpload = require("express-fileupload");
require("dotenv").config({ path: "variables.env" });

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
app.use(bodyParser.json());

//AGREGAR SUBIDA DE ARCHIVOS
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

//SE HABILITAN LAS VISTAS
app.set("views", path.join(__dirname, "./../views"));

app.use(cookieParser());

//SESIONES NOS PERMITE VIAJAR POR PAJINAS SIN VOLVER A AUTENTICAR
app.use(
  session({
    secret: "supersecreto",
    resave: false,
    saveUninitialized: false
  })
);

//VALIDACION DE INICIO DE SESION
app.use(passport.initialize());
app.use(passport.session());

//AGREGAR FLASH MESSAGES
app.use(flash());

//VARIABLE GLOBAL DE ERRORES
app.use((req, res, next) => {
  res.locals.vardump = imprimir.vardump;
  res.locals.mensajes = req.flash();
  next();
});

//SE IMPORTAN LAS RUTAS
app.use("/", routes);

//SE LE ASIGNA UN PUERTO
const host = process.env.HOST || "0.0.0.0";
const port = process.env.PORT || 3000;

app.listen(port, host, () => {
  console.log("Escuchando el puerto ", port);
});
