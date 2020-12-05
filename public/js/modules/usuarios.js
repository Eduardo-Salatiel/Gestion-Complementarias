import axios from "axios";
import Swal from "sweetalert2";

const btnEliminar = document.querySelector("#btn-eliminar");
const eliminarContainer = document.querySelector('.eliminar')

if(eliminarContainer){
    eliminarContainer.addEventListener('click', e => {
        const idUsuario = e.target.dataset.usuario;
        const url = `${location.origin}/eliminar-usuario/${idUsuario}`;
        
    Swal.fire({
        title: "¿Deseas eliminar este usuario?",
        text: "Un usuario eliminado no se puede recuperar",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, eliminar",
        cancelButtonText: "No, cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          axios.delete(url, { params: { idUsuario } }).then((resp) => {
            Swal.fire(
              "Usuario Eliminado",
              "El usuario se ha eliminado",
              "success"
            );
            setTimeout(() => {
                window.location.href = "/"
            }, 3000)
  
          })
          .catch(() => {
            Swal.fire({
              type:'error',
              title:'Hubo un error',
              text: 'No se pudo eliminar el usuario'
            })
          });
        }
      });


    })
}


export default btnEliminar;
