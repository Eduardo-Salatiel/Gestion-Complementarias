const express = require('express');
const app = express.Router();
const {usuarioAutenticado} = require('./../controllers/loginController');
const plantillaController = require('./../controllers/plantillaController')

app.get('/datos-plantilla', usuarioAutenticado ,plantillaController.datosPlantillaForm);
app.get('/jefe-coordinador', usuarioAutenticado, plantillaController.usuarioCoordinadorData);
app.post('/jefe-coordinador', usuarioAutenticado, plantillaController.usuarioCoordinadorSave)
app.get('/jefe-servicios', usuarioAutenticado, plantillaController.jefeServiciosData);
app.post('/jefe-servicios', usuarioAutenticado, plantillaController.jefeServiciosSave)
app.get('/editar-plantilla', usuarioAutenticado, plantillaController.editarPlantillaForm)
app.get('/descargar-plantilla', usuarioAutenticado, plantillaController.descargarPlantilla)
app.post('/cargar-plantilla', usuarioAutenticado, plantillaController.subirPlantilla)
app.get('/descargar-respaldo', usuarioAutenticado, plantillaController.descargarRespaldo)

module.exports = app;