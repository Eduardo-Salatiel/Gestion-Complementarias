const nodemailer = require('nodemailer');
const juice = require('juice');
const htmlToText = require('html-to-text');
const util = require('util');
const pug = require('pug');

const transport = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: '163107289@tesci.edu.mx',
        pass: 'TESCI2019'
    }
});

const generarHTML = (archivo, opciones={}) => {
    const html = pug.renderFile(`${__dirname}/../views/emails/${archivo}.pug`, 
    opciones);
    return juice(html)
}

exports.enviar = async (opciones) => {
    const html = generarHTML(opciones.archivo, opciones)
    const text = htmlToText.fromString(html)

  let info = transport.sendMail({ 
    from: 'Gestión Complementarias <no-reply@tesci.com>', // sender address
    to: opciones.usuario.correo, // list of receivers
    subject: opciones.subjet, // Subject line
    text: htmlToText.fromString,
    text,
    html
  });

  const enviarEmail = util.promisify(transport.sendMail,transport)
  return enviarEmail.call(transport, info)
}


