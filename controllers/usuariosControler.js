const crypto = require("crypto");
const Usuarios = require("./../models/Usuarios");
const Alumnos = require("./../models/Alumnos");
const AlumnoComplementaria = require("./../models/AlumnoComplementaria");
const JefeCoordinador = require("./../models/JefeCoordinador");
const JefeServicios = require("./../models/JefeServicios");
const Actividades = require("./../models/Actividades");
const enviarEmail = require("./../helpers/email");
const { excelToJson } = require("./../helpers/excelData");
const Docxtemplater = require("docxtemplater");
const PizZip = require("pizzip");
const fs = require("fs");
const path = require("path");
const { MESES } = require("./../helpers/constants/meses");

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
    console.log(error.errors);
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

//------ CARGAR DATOS DE EXCEL -------
exports.cargarDatosForm = (req, res) => {
  res.render("datosExcel", {
    nombrePagina: "Cargar Datos",
    usuario: req.user,
  });
};

//------------------------------------------------------------------------
//------------------------------------------------------------------------
//------------------------------------------------------------------------
//------------------------------------------------------------------------

exports.cargarDatos = async (req, res) => {
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

  //GUARDA ALUMNOS Y ACTIVIDADES EN LA BD
  for (let usuario of data) {
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
      where: { 
        actividad: usuario.actividad
      },
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
      });
    }
    const actividadId = await Actividades.findOne({
      where: { actividad: usuario.actividad },
    });
    const alumnoUpdate = await Alumnos.findOne({ where: { id: usuario.id } });
    const alumnoCom = await AlumnoComplementaria.findOne({
      where: { alumnoId: alumnoUpdate.id, actividadeId: actividadId.id },
    });

    if (!alumnoCom) {
      if (alumnoUpdate.creditos < 5) {
        alumnoUpdate.creditos = alumnoUpdate.creditos + actividadId.creditos;
        if (alumnoUpdate.creditos >= 5) {
          alumnoUpdate.estado = true;
        }

        await alumnoUpdate.save();

        const reg = await AlumnoComplementaria.create({
          periodo: usuario.periodo,
          alumnoId: alumnoUpdate.id,
          actividadeId: actividadId.id,
        });

        if (!reg) {
          req.flash(
            "error",
            "Error al cargar datos, verifique la estructura de su archivo"
          );
          res.redirect("/cargar-datos");
          return;
        }
      }
    }
  }

  req.flash("correcto", "Los datos han sido cargados");
  return res.render("datosExcel", {
    nombrePagina: "Cargar Datos",
    usuario: req.user,
    mensajes: req.flash(),
  });
};

//------ ELIMINAR USUARIOS ------
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

//------ CONSULTAR ALUMNOS ------
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

//------ GENERAR CARTA ------
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
  if (!alumno) {
    req.flash("error", "No se encontro ningún alumno con ese No. de Control");
    res.redirect("/generar-carta");
    return;
  }

  const complementarias = await AlumnoComplementaria.findAll({
    where: { alumnoId: req.query.alumno },
    include: [{ model: Actividades }],
  });
  const jefes = await JefeCoordinador.findOne({
    where: { carrera: alumno.alumno.carrera.toUpperCase() },
  });
  const jefeServicio = await JefeServicios.findOne({ where: { id: 1 } });

  if (!jefes || !jefeServicio) {
    req.flash("error", "Por favor registra los datos del personal administrativo");
    res.redirect("/generar-carta");
    return;
  }

  let comPosition, Ac1, Ac2, Ac3, Ac4, Ac5;
  //VALIDA MAS DE 6 CREDITOS
  let validarCreditos = alumno.alumno.creditos;

  for (let i = 0; i < complementarias.length; i++) {
    comPosition = i;
    switch (comPosition) {
      case 0:
        Ac1 = [
          {
            actividad: complementarias[0].actividade.actividad,
            periodo: complementarias[0].periodo,
            creditos: complementarias[0].actividade.creditos,
          },
        ];
        if (
          validarCreditos > 5 &&
          complementarias[0].actividade.creditos === 2
        ) {
          Ac1[0].creditos = 1;
          validarCreditos = validarCreditos - 1;
        }
        break;
      case 1:
        Ac2 = [
          {
            actividad: complementarias[1].actividade.actividad,
            periodo: complementarias[1].periodo,
            creditos: complementarias[1].actividade.creditos,
          },
        ];
        if (
          validarCreditos > 5 &&
          complementarias[1].actividade.creditos === 2
        ) {
          Ac2[0].creditos = 1;
          validarCreditos -= 1;
        }
        break;
      case 2:
        Ac3 = [
          {
            actividad: complementarias[2].actividade.actividad,
            periodo: complementarias[2].periodo,
            creditos: complementarias[2].actividade.creditos,
          },
        ];
        if (
          validarCreditos > 5 &&
          complementarias[2].actividade.creditos === 2
        ) {
          Ac3[0].creditos = 1;
          validarCreditos -= 1;
        }
        break;
      case 3:
        Ac4 = [
          {
            actividad: complementarias[3].actividade.actividad,
            periodo: complementarias[3].periodo,
            creditos: complementarias[3].actividade.creditos,
          },
        ];
        if (
          validarCreditos > 5 &&
          complementarias[3].actividade.creditos === 2
        ) {
          Ac4[0].creditos = 1;
          validarCreditos -= 1;
        }
        break;
      case 4:
        Ac5 = [
          {
            actividad: complementarias[4].actividade.actividad,
            periodo: complementarias[4].periodo,
            creditos: complementarias[4].actividade.creditos,
          },
        ];
        if (
          validarCreditos > 5 &&
          complementarias[4].actividade.creditos === 2
        ) {
          Ac5[0].creditos = 1;
          validarCreditos -= 1;
        }
        break;
      default:
        break;
    }
  }

  const data = {
    jefeServicios: jefeServicio.jefe.trim(),
    coordinador: jefes.coordinador.trim(),
    jefe: jefes.jefe.trim(),
    control: alumno.alumno.id.toString(),
    alumno: `${alumno.alumno.nombre.toUpperCase()} ${alumno.alumno.aPaterno.toUpperCase()} ${alumno.alumno.aMaterno.toUpperCase()}`,
    carrera: alumno.alumno.carrera.toUpperCase(),
    creditos: alumno.alumno.creditos > 5 ? 5 : alumno.alumno.creditos,
    dia: `${date.getDate() < 10 ? "0" + date.getDate() : date.getDate()}`,
    mes: MESES[date.getMonth()],
    año: date.getFullYear().toString(),
    periodo: complementarias[complementarias.length - 1].actividade.periodo,
    act1: Ac1,
    act2: Ac2,
    act3: Ac3,
    act4: Ac4,
    act5: Ac5,
  };

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

    res.render("generarCarta", {
      nombrePagina: "Generar Carta",
      usuario: req.user,
      alumno: alumno,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.descargarArchivo = (req, res) => {
  let fd = fs.createReadStream(path.join(__dirname, "../doc", "carta.docx"));

  res.setHeader("Content-Type", "application/msword");
  fd.pipe(res);
};

exports.actualizarUsuarioForm = (req, res) => {
  res.render("actualizarUsuario", {
    nombrePagina: "Actualizar Usuario",
    usuario: req.user,
  });
};

//---------------------------------------------------------------------

exports.consultarUsuario = async (req, res) => {
  const correo = await Usuarios.findOne({ where: { correo: req.body.correo } });

  res.render("actualizarUsuario", {
    nombrePagina: "Actualizar Usuario",
    usuario: req.user,
    infoUsuario: correo,
  });
};

exports.actualizarUsuario = async (req, res) => {
  try {
    let { nombre, aPaterno, aMaterno, correo, role, jefe } = req.body;
    const token = crypto.randomBytes(20).toString("hex");
    const usuario = await Usuarios.findOne({ where: { correo } });

    usuario.nombre = nombre;
    usuario.aPaterno = aPaterno;
    usuario.aMaterno = aMaterno;
    usuario.correo = correo;
    usuario.role = role;
    usuario.password = "";
    usuario.token = token;

    if (jefe) usuario.jefe = jefe;
    //ENVIAR CORREO DE ACTUALIZACION
    const resetURL = `http://${req.headers.host}/configurar-password/${token}`;
    enviarEmail.enviar({
      subject: "Actualizar contraseña",
      usuario,
      resetURL,
      archivo: "actualizar",
      correo,
    });
    await usuario.save();
    req.flash("correcto", "Usuario Actualizado");
    res.redirect("/actualizar-usuario");
  } catch (error) {
    req.flash("error", "Error al actualizar usuario");
    res.redirect("/actualizar-usuario");
  }
};
