const express = require('express')
const app = express.Router();
const loginController = require('./../controllers/loginController');

app.get('/iniciar-sesion', loginController.loginIndex)
app.post('/iniciar-sesion', loginController.autenticarUsuario)

//CONFIGURAR PASSWORD
app.get('/configurar-password/:token', loginController.asignarPasswordForm)
app.post('/cofigurar-password/:token', loginController.asignarPassword)

module.exports = app;