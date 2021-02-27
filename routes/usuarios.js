const express = require('express');
const app = express.Router();
const usuariosController = require('./../controllers/usuariosControler')
const {usuarioAutenticado} = require('./../controllers/loginController');

//REGISTRAR USUARIOS
app.get('/crear-usuario', usuariosController.registrarUsuarioForm)
app.post('/crear-usuario', usuariosController.registrarUsuario)

//CARGAR DATOS DE EXCEL
app.get('/cargar-datos',usuarioAutenticado, usuariosController.cargarDatosForm)
app.post('/cargar-datos', usuarioAutenticado, usuariosController.cargarDatos)

//ELIMINAR USUARIOS
app.get('/eliminar-usuario',usuarioAutenticado, usuariosController.eliminarUsuarioForm)
app.delete('/eliminar-usuario/:id',usuarioAutenticado, usuariosController.eliminarUsuario)

//CONSULTAR ALUMNOS
app.get('/consultar-alumno', usuariosController.consultarAlumnoForm)
app.get('/consultar-alumno-resultado',usuariosController.consultarAlumno)

//GENERAR CARTA
app.get('/generar-carta', usuarioAutenticado, usuariosController.generarCartaForm)
app.get('/carta-finalizacion',usuarioAutenticado, usuariosController.generarCarta)
app.get('/descargar-carta', usuarioAutenticado, usuariosController.descargarArchivo)

//ACTUALIZAR USUARIO
app.get('/actualizar-usuario', usuarioAutenticado, usuariosController.actualizarUsuarioForm)
app.post('/consultar-usuario', usuarioAutenticado, usuariosController.consultarUsuario)
app.post('/actualizar-usuario', usuarioAutenticado, usuariosController.actualizarUsuario)

module.exports = app;