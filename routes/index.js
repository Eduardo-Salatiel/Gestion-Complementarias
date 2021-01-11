const express = require('express');
const app = express.Router();

app.use(require('./home'));
app.use(require('./login'));
app.use(require('./usuarios'));
app.use(require('./plantilla'))

module.exports = app;