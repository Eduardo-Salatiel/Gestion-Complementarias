const express = require('express');
const app = express.Router();
const homeController = require('./../controllers/homeController');

app.get('/', homeController.homeView);

module.exports = app;