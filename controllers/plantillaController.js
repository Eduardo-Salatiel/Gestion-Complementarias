const JefeCoordinador = require("./../models/JefeCoordinador");
const JefeServicios = require("./../models/JefeServicios");
const fs = require("fs");
const path = require("path");

exports.datosPlantillaForm = (req, res) => {
  res.render("datosPlantilla", {
    nombrePagina: "Datos Plantilla",
    usuario: req.user,
    mensajes: req.flash(),
  });
};

exports.usuarioCoordinadorData = async (req, res) => {
  let { carrera } = req.query;

  const jefes = await JefeCoordinador.findOne({ where: { carrera } });
  if (jefes) {
    res.json({
      ok: true,
      jefes,
    });
  } else {
    const Jefes = {
      jefe: " ",
      coordinador: " ",
    };
    res.status(200).json({
      ok: true,
      jefes: Jefes,
    });
  }
};

exports.usuarioCoordinadorSave = async (req, res) => {
  let { carrera, jefe, coordinador } = req.body;

  const data = await JefeCoordinador.findOne({ where: { carrera } });
  if (!data) {
    try {
      await JefeCoordinador.create({ jefe, coordinador, carrera });
      res.send("ok");
    } catch (error) {
      res.status(400).json({
        ok: false,
        err: "Hubo un error",
      });
    }
  } else {
    res.send("ok");
    data.jefe = jefe;
    data.coordinador = coordinador;
    await data.save();
  }
};

exports.jefeServiciosData = async (req, res) => {
  const jefe = await JefeServicios.findOne({ where: { id: 1 } });
  if (jefe) {
    res.json({
      ok: true,
      jefe,
    });
  } else {
    const Jefe = {
      jefe: " ",
    };
    res.status(200).json({
      ok: true,
      jefe: Jefe,
    });
  }
};

exports.jefeServiciosSave = async (req, res) => {
  let { jefe } = req.body;

  const data = await JefeServicios.findOne({ where: { id: 1 } });
  if (!data) {
    try {
      const resp = await JefeServicios.create({ jefe });
      console.log(resp);
      res.send("ok");
    } catch (error) {
      res.status(400).json({
        ok: false,
        err: "Hubo un error",
        msg: error.message
      });
    }
  } else {
    console.log(data);
    data.jefe = jefe;
    await data.save();
    res.send("ok");
  }
};

exports.editarPlantillaForm = (req, res) => {
  res.render("editarPlantilla", {
    nombrePagina: "Editar Plantilla",
    usuario: req.user,
    mensajes: req.flash(),
  });
};

exports.descargarPlantilla = (req, res) => {
  let fd = fs.createReadStream(
    path.join(__dirname, "../doc", "plantilla.docx")
  );

  res.setHeader("Content-Type", "application/msword");
  fd.pipe(res);
};

exports.subirPlantilla = (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    req.flash("error", "Por favor adjunte un archivo");
    res.render("editarPlantilla", {
      nombrePagina: "Editar Plantilla",
      usuario: req.user,
      mensajes: req.flash(),
    });
    return;
  }

  let archivo = req.files.plantilla;
  let ext = archivo.name.split(".")[1];

  if (ext !== "docx") {
    req.flash("error", "Extencion de archivo invalida");
    res.render("editarPlantilla", {
      nombrePagina: "Editar Plantilla",
      usuario: req.user,
      mensajes: req.flash(),
    });
    return;
  }
  archivo.name = "plantilla.docx";

  archivo.mv(`${__dirname}/../doc/plantilla.docx`, (err) => {
    if (err) {
      console.log(err);
    }

    req.flash("correcto", "Plantilla guardada exitosamente");
    res.render("editarPlantilla", {
      nombrePagina: "Editar Plantilla",
      usuario: req.user,
      mensajes: req.flash(),
    });
  });
};

exports.descargarRespaldo = (req, res) => {
  let fd = fs.createReadStream(
    path.join(__dirname, "../doc", "respaldo.docx")
  );

  res.setHeader("Content-Type", "application/msword");
  fd.pipe(res);
};
