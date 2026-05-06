import axios from 'axios';

const baseUrl = 'http://localhost:8080';
const listahis = '/historial/listahistorial';
const agregarhis = '/historial/agregar';
const modificarhis = '/historial/modificar';
const eliminarhis = '/historial/eliminar';
// const urlcli = baseUrl + listacli;

export async function getlistahis() {
  try {
    const response = await axios.get(baseUrl + listahis);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Codigo recopilado
export async function agregarHistorial(historial) {
  try {
    const response = await axios.post(baseUrl + agregarhis, historial);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function modificarHistorial(historial) {
  try {
    const response = await axios.put(baseUrl + modificarhis, historial);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function eliminarHistorial(id) {
  try {
    await axios.delete(`${baseUrl + eliminarhis}/${id}`);
  } catch (error) {
    console.error(error);
  }
}
