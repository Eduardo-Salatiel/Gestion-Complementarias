const crypto = require("crypto");
const Usuarios = require("./../models/Usuarios");
const Alumnos = require("./../models/Alumnos");
const AlumnoComplementaria = require("./../models/AlumnoComplementaria");
const Actividades = require("./../models/Actividades");
const enviarEmail = require("./../helpers/email");
const { excelToJson } = require("./../helpers/excelData");
const Docxtemplater = require("docxtemplater");
const PizZip = require("pizzip");
const fs = require("fs");
const path = require("path");
const {MESES}= require('./../helpers/constants/meses')

exports.registrarUsuarioForm = (req, res) => {
  res.render("crearUsuario", {
    nombrePagina: "Registrar Usuario",
    usuario: req.user,
  });
};

exports.registrarUsuario = async (req, res) => {
  const token = crypto.randomBytes(20).toString("hex");
  const { nombre, aPaterno, aMaterno, correo, role, jefe } = req.body;

  try {
    const usuario = await Usuarios.create({
      nombre,
      aPaterno,
      aMaterno,
      correo,
      jefe,
      role,
      token,
    });

    //-----ENVIAR CORREO PARA REGISTRAR USUARIO------
    const resetURL = `http://${req.headers.host}/configurar-password/${token}`;
    enviarEmail.enviar({
      subject: "Configurar contraseña",
      usuario,
      resetURL,
      archivo: "email",
      correo,
    });

    req.flash("correcto", "Se ha registrado el usuario");
    res.redirect("/crear-usuario");
  } catch (error) {
    req.flash(
      "error",
      error.errors.map((error) => error.message)
    );

    res.render("crearUsuario", {
      mensajes: req.flash(),
      nombrePagina: "Registrar Usuario",
      usuario: req.user,
    });
  }
};

//CARGAR DATOS DE EXCEL
exports.cargarDatosForm = (req, res) => {
  res.render("datosExcel", {
    nombrePagina: "Cargar Datos",
    usuario: req.user,
  });
};

exports.cargarDatos = async (req, res, next) => {
  //VALIDA SI SI VIENE UN ARCHIVO
  if (!req.files || Object.keys(req.files).length === 0) {
    req.flash("error", "Por favor adjunte un archivo");

    return res.render("datosExcel", {
      nombrePagina: "Cargar Datos",
      usuario: req.user,
      mensajes: req.flash(),
    });
  }

  //VALIDA QUE LA EXTENCION SEA EXCEL
  let archivo = req.files.ex;
  let archivoExt = archivo.name.split(".");
  let extencion = archivoExt[archivoExt.length - 1];

  if (extencion != "xlsx") {
    req.flash("error", "Extencion de archivo invalida");
    return res.render("datosExcel", {
      nombrePagina: "Cargar Datos",
      usuario: req.user,
      mensajes: req.flash(),
    });
  }

  const data = await excelToJson(archivo.tempFilePath);

  //GUARDAR DATOS EN LA BD
  data.map(async (usuario) => {
    if (!usuario.id) {
      req.flash(
        "error",
        "Error al cargar datos, verifique la estructura de su archivo"
      );
      res.redirect("/cargar-datos");
      return;
    }
    const alumno = await Alumnos.findOne({ where: { id: usuario.id } });
    const actividad = await Actividades.findOne({
      where: { actividad: usuario.actividad },
    });

    if (!alumno) {
      await Alumnos.create({
        id: usuario.id,
        nombre: usuario.nombre,
        aPaterno: usuario.aPaterno,
        aMaterno: usuario.aMaterno,
        carrera: usuario.carrera,
      });
    }

    if (!actividad) {
      await Actividades.create({
        actividad: usuario.actividad,
        creditos: usuario.creditos,
        periodo: usuario.periodo,
      });
    }

    const actividadId = await Actividades.findOne({
      where: { actividad: usuario.actividad },
    });
    const alumnoUpdate = await Alumnos.findOne({ where: { id: usuario.id } });

    alumnoUpdate.creditos = alumnoUpdate.creditos + actividadId.creditos;
    if (alumnoUpdate >= 5) {
      alumnoUpdate.estado = true;
    }
    alumnoUpdate.save();

    const reg = await AlumnoComplementaria.create({
      alumnoId: usuario.id,
      actividadeId: actividadId.id,
    });
  });
  if (!reg) {
    req.flash(
      "error",
      "Error al cargar datos, verifique la estructura de su archivo"
    );
    res.redirect("/cargar-datos");
    return;
  }

  req.flash("correcto", "Los Datos han Sido Cargados");
  return res.render("datosExcel", {
    nombrePagina: "Cargar Datos",
    usuario: req.user,
    mensajes: req.flash(),
  });
};

//ELIMINAR USUARIOS
exports.eliminarUsuarioForm = async (req, res) => {
  const usuariosAll = await Usuarios.findAll();
  const usuarios = usuariosAll.filter(
    (usuario) => usuario.dataValues.correo != req.user.correo
  );

  res.render("eliminarUsuario", {
    nombrePagina: "Eliminar Usuario",
    usuario: req.user,
    usuarios,
  });
};

exports.eliminarUsuario = async (req, res, next) => {
  const { idUsuario } = req.query;

  const usuario = await Usuarios.destroy({ where: { id: idUsuario } });
  res.send("ok");

  if (!usuario) {
    return next();
  }
};

//CONSULTAR ALUMNOS
exports.consultarAlumnoForm = (req, res) => {
  res.render("consultarAlumnos", {
    nombrePagina: "Consulta de Alumnos",
    usuario: req.user,
  });
};

exports.consultarAlumno = async (req, res) => {
  const alumno = await AlumnoComplementaria.findOne({
    where: { alumnoId: req.query.alumno },
    include: { model: Alumnos },
  });
  const complementarias = await AlumnoComplementaria.findAll({
    where: { alumnoId: req.query.alumno },
    include: [{ model: Actividades }],
  });
  
  if (!alumno) {
    req.flash("error", "No se encontro ningun alumno con ese No. de Control");
    res.redirect("/consultar-alumno");
    return;
  }
  
  if (!complementarias) {
    req.flash("error", "No se encontraron registros de complementarias");
    res.redirect("/consultar-alumno");
    return;
  }

  res.render("consultarAlumnos", {
    nombrePagina: "Consulta de Alumnos",
    usuario: req.user,
    alumno,
    complementarias,
  });
};

//GENERAR CARTA
exports.generarCartaForm = (req, res) => {
  res.render("generarCarta", {
    nombrePagina: "Generar Carta",
    usuario: req.user,
  });
};

exports.generarCarta = async (req, res) => {
  const date = new Date();
  const alumno = await AlumnoComplementaria.findOne({
    where: { alumnoId: req.query.alumno },
    include: { model: Alumnos },
  });
  const complementarias = await AlumnoComplementaria.findAll({
    where: { alumnoId: req.query.alumno },
    include: [{ model: Actividades }],
  });
  const data = {
    control: alumno.alumno.id.toString(),
    alumno: `${alumno.alumno.nombre.toUpperCase()} ${alumno.alumno.aPaterno.toUpperCase()} ${alumno.alumno.aMaterno.toUpperCase()}`,
    carrera: alumno.alumno.carrera.toUpperCase(),
    dia: `${date.getDate() < 10 ? '0'+ date.getDate() : date.getDate()}`,
    mes: MESES[date.getMonth()],
    año: date.getFullYear().toString()
  }

  //GENERAR LA CARTA
  try {
    const content = fs.readFileSync(
      path.resolve(__dirname + "/../doc/plantilla.docx"),
      "binary"
    );
    var zip = new PizZip(content);
    var doc = new Docxtemplater(zip);
    doc.setData(data);
    doc.render();
    var buf = doc.getZip().generate({ type: "nodebuffer" });
    fs.writeFileSync(path.resolve(__dirname + "/../doc/carta.docx"), buf);

    res.render('generarCarta',{
      nombrePagina: 'Generar Carta',
      usuario: req.user,
      alumno: alumno,
      url: "doc/carta.docx"

    })
  } catch (error) {
    console.log(error);
  }
};
