import axios from 'axios';

const baseUrl = 'http://localhost:8080';
const listareci = '/recibo/listarecibo';
const agregarreci = '/recibo/agregar';
const eliminarreci = '/recibo/eliminar';

export async function getlistareci() {
  try {
    const response = await axios.get(baseUrl + listareci);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Codigo recopilado
export async function agregarRecibo(recibo) {
  try {
    const response = await axios.post(baseUrl + agregarreci, recibo);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function eliminarRecibo(id) {
  try {
    await axios.delete(`${baseUrl + eliminarreci}/${id}`);
  } catch (error) {
    console.error(error);
  }
}
