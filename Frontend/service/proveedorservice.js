import axios from 'axios';

const baseUrl = 'http://localhost:8080';
const listar = '/proveedor/lista';
const agregar = '/proveedor/agregar';
const modificar = '/proveedor/modificar';
const eliminar = '/proveedor/eliminar';

export async function getProveedor() {
  try {
    const response = await axios.get(baseUrl + listar);
    return response.data;
  } catch (error) {
    console.error('Error al listar proveedor:', error);
    return [];
  }
}

export async function agregarProveedor(proveedor) {
  try {
    const response = await axios.post(baseUrl + agregar, proveedor);
    return response.data;
  } catch (error) {
    console.error('Error al agregar proveedor:', error);
    return null;
  }
}

export async function modificarProveedor(proveedor) {
  try {
    const response = await axios.put(baseUrl + modificar, proveedor, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error al modificar proveedor:', error);
    return null;
  }
}

export async function eliminarProveedor(id) {
  try {
    await axios.delete(`${baseUrl + eliminar}/${id}`);
  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
  }
}
