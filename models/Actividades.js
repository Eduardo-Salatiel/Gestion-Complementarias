const Sequelize = require('sequelize');
const db = require('./../server/config/db');

const Actividades = db.define('actividades',{
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    actividad:{
        type: Sequelize.STRING(120),
        allowNull: false,
    },
    creditos: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    periodo:{
        type: Sequelize.STRING(7),
        allowNull: false
    }
})


module.exports = Actividades