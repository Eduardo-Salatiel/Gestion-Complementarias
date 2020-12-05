

const btnCargarDatos = document.querySelector('#archivo');

if(btnCargarDatos){
    btnCargarDatos.addEventListener('change', e =>{
        
        btnCargarDatos.previousElementSibling.classList.add('cargado');
    })
}

export default btnCargarDatos;