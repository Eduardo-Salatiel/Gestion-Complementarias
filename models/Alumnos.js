const Sequelize = require('sequelize');
const db = require('./../server/config/db');

const Alumnos = db.define('alumnos',{
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: Sequelize.STRING(40),
        allowNull: false
    },
    aPaterno: {
        type: Sequelize.STRING(25),
        allowNull:false
    },
    aMaterno: {
        type: Sequelize.STRING(25),
        allowNull: false,
    },
    carrera:{
        type: Sequelize.STRING(45),
        allowNull: false,
        validate: {
            notEmpty:{
                msg: "Es necesario ingresar la carrera"
            }
        }
    },
    estado:{
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    creditos: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    }
})

module.exports = Alumnos;