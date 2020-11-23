const express = require('express');
const app = express.Router();
const usuariosController = require('./../controllers/usuariosControler')

//REGISTRAR USUARIOS
app.get('/crear-usuario', usuariosController.registrarUsuarioForm)
app.post('/crear-usuario', usuariosController.registrarUsuario)

module.exports = app;