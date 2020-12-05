const db = require('./../server/config/db')
const Sequelize = require('sequelize')
const Alumnos = require('./Alumnos');
const Actividades = require('./Actividades')

const AlumnoComplementaria = db.define('alumnoComplementaria',{
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
})

AlumnoComplementaria.belongsTo(Alumnos);
AlumnoComplementaria.belongsTo(Actividades)

module.exports = AlumnoComplementaria;