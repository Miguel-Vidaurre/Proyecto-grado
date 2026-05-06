import axios from 'axios';

const baseUrl = 'http://localhost:8080';
const listar = '/marca/lista';
const agregar = '/marca/agregar';
const modificar = '/marca/modificar';
const eliminar = '/marca/eliminar';

export async function getMarcas() {
  try {
    const response = await axios.get(baseUrl + listar);
    return response.data;
  } catch (error) {
    console.error('Error al listar marcas:', error);
    return [];
  }
}

export async function agregarMarca(marca) {
  try {
    const response = await axios.post(baseUrl + agregar, marca);
    return response.data;
  } catch (error) {
    console.error('Error al agregar marca:', error);
    return null;
  }
}

export async function modificarMarca(marca) {
  try {
    const response = await axios.put(baseUrl + modificar, marca);
    return response.data;
  } catch (error) {
    console.error('Error al modificar marca:', error);
    return null;
  }
}

export async function eliminarMarca(id) {
  try {
    await axios.delete(`${baseUrl + eliminar}/${id}`);
  } catch (error) {
    console.error('Error al eliminar marca:', error);
  }
}
