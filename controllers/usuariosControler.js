const crypto = require('crypto');
const Usuarios = require('./../models/Usuarios')
const enviarEmail = require('./../helpers/email');

exports.registrarUsuarioForm = (req, res) => {
    res.render('crearUsuario',{
        nombrePagina: 'Registrar Usuario'
    })
}

exports.registrarUsuario = async (req, res) => {
    const token = crypto.randomBytes(20).toString('hex');
    const {nombre, aPaterno, aMaterno, correo, role, jefe} = req.body;
    
    try {
        const usuario = await Usuarios.create({
            nombre,
            aPaterno,
            aMaterno,
            correo,
            jefe,
            role,
            token, 
        })

        //-----ENVIAR CORREO PARA REGISTRAR USUARIO------
        const resetURL = `http://${req.headers.host}/configurar-password/${token}`
        enviarEmail.enviar({
            subject: 'Configurar contraseña',
            usuario,
            resetURL,
            archivo: 'email',
            correo
        })

        req.flash('correcto', 'Se ha registrado el usuario')
        res.redirect('/')
    } catch (error) {
        req.flash('error', error.errors.map(error => error.message));

        res.render('crearUsuario',{
            mensajes: req.flash(),
            nombrePagina: 'Registrar Usuario'
        })
    }
}