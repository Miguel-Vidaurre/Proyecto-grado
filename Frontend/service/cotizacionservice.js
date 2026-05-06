import axios from 'axios';

const baseUrl = 'http://localhost:8080';
const listacot = '/cotizacion/listacotizacion';
const agregarcot = '/cotizacion/agregar';
const modificarcot = '/cotizacion/modificar';
const eliminarcot = '/cotizacion/eliminar';

export async function getlistacot() {
  try {
    const response = await axios.get(baseUrl + listacot);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Codigo recopilado
export async function agregarCotizacion(cotizacion) {
  try {
    console.log('🔥 Enviando cotización al backend:', cotizacion);
    const response = await axios.post(baseUrl + agregarcot, cotizacion);
    return response.data;
  } catch (error) {
    console.error('❌ Error al agregar cotización:', error.response?.data || error.message);
    return null;
  }
}

export async function modificarCotizacion(cotizacion) {
  try {
    const response = await axios.put(baseUrl + modificarcot, cotizacion);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function eliminarCotizacion(id) {
  try {
    await axios.delete(`${baseUrl + eliminarcot}/${id}`);
  } catch (error) {
    console.error(error);
  }
}
