const Sequelize = require('sequelize');
const db = require('./../server/config/db');

const Actividades = db.define('actividades',{
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    actividad:{
        type: Sequelize.STRING,
        allowNull: false,
    },
    creditos: {
        type: Sequelize.INTEGER
    },
})


module.exports = Actividades