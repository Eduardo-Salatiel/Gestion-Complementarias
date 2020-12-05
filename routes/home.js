const express = require('express');
const app = express.Router();
const homeController = require('./../controllers/homeController');
const {usuarioAutenticado} = require('./../controllers/loginController');

app.get('/',usuarioAutenticado, homeController.homeView);

module.exports = app;