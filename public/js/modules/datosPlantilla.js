import axios from "axios";
import Swal from "sweetalert2";

const select = document.getElementById("dato");
const campos = document.querySelector(".campos");

//PETICION
const apiCall = async (url, params = {}) => {
  const resultado = await axios.get(url, { params });
  return resultado;
};

const handleChange = async (e) => {
  let data = e.target.value;
  const divJefe = document.createElement("div");
  divJefe.setAttribute("class", "campo");
  const submit = document.createElement("input");
  submit.setAttribute("type", "submit");
  submit.setAttribute("value", "Guardar");
  submit.setAttribute("class", "boton");

  if (
    data === "Ingeniería en Sistemas Computacionales" ||
    data === "Ingeniería en Gestión Empresarial" ||
    data === "Ingeniería Industrial" ||
    data === "Ingeniería en Tecnologías de la Información y Comunicaciones" ||
    data === "Ingeniería Mecatronica" ||
    data === "Ingeniería en Logística" ||
    data === "Contador Público" ||
    data === "Ingeniería en Administración" ||
    data === "Ingeniería Quimica"

  ) {
    //LLAMADA A LA API
    let url = `${location.origin}/jefe-coordinador`;
    let params = { carrera: data };
    let jefe, coordinador;
    const resp = await apiCall(url, params);

    if (resp.status === 200) {
      jefe = resp.data.jefes.jefe;
      coordinador = resp.data.jefes.coordinador;
    }

    if (campos.childNodes.length)
      campos.parentElement.removeChild(campos.parentElement.lastChild);

    while (campos.firstChild) {
      campos.removeChild(campos.firstChild);
    }

    const labelJefe = document.createElement("label");
    labelJefe.textContent = "Jefe de Carrera:";
    const inputJefe = document.createElement("input");
    inputJefe.setAttribute("type", "text");
    inputJefe.setAttribute("name", "jefe");
    inputJefe.setAttribute("value", jefe);
    divJefe.appendChild(labelJefe);
    divJefe.appendChild(inputJefe);
    //---------------------------------------
    const divCoordinador = document.createElement("div");
    divCoordinador.setAttribute("class", "campo");
    const labelCoordinador = document.createElement("label");
    labelCoordinador.textContent = "Coordinador:";
    const inputCoordinador = document.createElement("input");
    inputCoordinador.setAttribute("type", "text");
    inputCoordinador.setAttribute("name", "coordinador");
    inputCoordinador.setAttribute("value", coordinador);
    divCoordinador.appendChild(labelCoordinador);
    divCoordinador.appendChild(inputCoordinador);
    //------------------------------------------
    campos.appendChild(divJefe);
    campos.appendChild(divCoordinador);
    campos.parentElement.appendChild(submit);
  }
  if (data === "Jefe servicios") {
    if (campos.childNodes.length > 1)
      campos.parentElement.removeChild(campos.parentElement.lastChild);

    while (campos.firstChild) {
      campos.removeChild(campos.firstChild);
    }
    let jefeServicio;
    const response = await apiCall(`${location.origin}/jefe-servicios`);
    
    if (response.status === 200) {
      jefeServicio = response.data.jefe.jefe;
    }

    const labelJefe = document.createElement("label");
    labelJefe.textContent = "Jefe de Servicios Escolares:";
    const inputJefe = document.createElement("input");
    inputJefe.setAttribute("type", "text");
    inputJefe.setAttribute("name", "jefe");
    inputJefe.setAttribute("value", jefeServicio);
    divJefe.appendChild(labelJefe);
    divJefe.appendChild(inputJefe);
    campos.parentElement.appendChild(submit);
    campos.appendChild(divJefe);
  }
};

if (select) {
  select.addEventListener("change", handleChange);
}

if (select) {
  select.parentElement.parentElement.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log(select.value);

    if (select.value === "Jefe servicios") {
      const body = {
        jefe: select.parentElement.nextElementSibling.firstChild.lastChild.value.toUpperCase(),
      };

      const url = `${location.origin}/jefe-servicios`;
      axios.post(url, body).then(function (res) {
        Swal.fire(
          "Datos Guardados",
          "Los datos se guardaron correctamente",
          "success"
        );
        setTimeout(() => {
          location.href = `${location.origin}/datos-plantilla`;
        }, 3000);
      });
    } else {
      const body = {
        carrera: select.value.toUpperCase(),
        jefe: select.parentElement.nextElementSibling.firstChild.lastChild.value.toUpperCase(),
        coordinador: select.parentElement.nextElementSibling.lastChild.lastChild.value.toUpperCase(),
      };

      const url = `${location.origin}/jefe-coordinador`;
      axios.post(url, body).then(function (res) {
        Swal.fire(
          "Datos Guardados",
          "Los datos se guardaron correctamente",
          "success"
        );
        setTimeout(() => {
          location.href = `${location.origin}/datos-plantilla`;
        }, 3000);
      });
    }
  });
}
