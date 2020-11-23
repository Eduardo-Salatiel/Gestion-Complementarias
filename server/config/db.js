const Sequelize = require('sequelize');

const db = new Sequelize('gestion_complementarias', 'root', 'root',{
    host: 'localhost',
    port: 3306,
    dialect: 'mysql',
    define:{
        timestamps: false
    }

})

module.exports = db;