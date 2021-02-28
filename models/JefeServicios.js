const db = require('./../server/config/db');
const Sequelize = require('sequelize');

const JefeServicios = db.define('jefeServicios',{
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
    },
    jefe: {
        type: Sequelize.STRING,
        allowNull: false,
        validate:{
            notNull:{
                msg: 'Especifique un jefe de servicios escolares'
            }
        }
    },
}
)

module.exports = JefeServicios