const Sequelize = require('sequelize')
const db = require('./../server/config/db')

const JefeCoordinador = db.define('jefeCoordinador',{
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    jefe: {
        type: Sequelize.STRING,
        allowNull: false,
        validate:{
            notNull:{
                msg: 'Especifique un jefe de carrera'
            }
        }
    },
    coordinador:{
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notNull:{
                msg: 'Especifique un coordinador de actividades'
            }
        }
    },
    carrera: {
        type: Sequelize.STRING
    }
})

module.exports = JefeCoordinador;