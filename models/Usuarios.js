const db = require('./../server/config/db');
const Sequelize = require('sequelize');

const Usuarios = db.define('usuarios',{
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: Sequelize.STRING(50),
        allowNull: false, 
        validate:{
            notEmpty:{
                msg: 'El nombre es necesario'
            }
        }
    },
    aPaterno: {
        type: Sequelize.STRING(50),
        allowNull: false, 
        validate:{
            notEmpty:{
                msg: 'En apellido paterno es necesario'
            }
        }
    },
    aMaterno: {
        type: Sequelize.STRING(50),
        allowNull: false, 
        validate:{
            notEmpty:{
                msg: 'El apellido materno es necesario'
            }
        }
    },
    correo: {
        type: Sequelize.STRING(60),
        allowNull: false,
        validate: {
            isEmail:{
                msg: "Ingrese un correo electronico valido"
            },
            notEmpty: {
                msg: "El correo no puede ir vacio",
              }
        },
        unique: {
            args: true,
            msg: 'Ya existe ese correo electronico'
        }
    },
    password: {
        type: Sequelize.STRING,
    },
    jefe:{
        type: Sequelize.STRING(100),
    },
    role: {
        type: Sequelize.STRING(18),
        allowNull: false,
        validate:{
            notEmpty:{
                msg: 'Especifique un role de usuario'
            }
        }

    },
    token:{
        type: Sequelize.STRING
    }
})

module.exports = Usuarios;