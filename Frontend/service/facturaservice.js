import axios from 'axios';

const baseUrl = 'http://localhost:8080';
const listafact = '/factura/listafactura';
const agregarfact = '/factura/agregar';
const eliminarfact = '/factura/eliminar';

export async function getlistafac() {
  try {
    const response = await axios.get(baseUrl + listafact);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Codigo recopilado
export async function agregarFactura(factura) {
  try {
    const response = await axios.post(baseUrl + agregarfact, factura);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function eliminarFactura(id) {
  try {
    await axios.delete(`${baseUrl + eliminarfact}/${id}`);
  } catch (error) {
    console.error(error);
  }
}
