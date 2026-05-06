import axios from 'axios';

const baseUrl = 'http://localhost:8080';
const listarServicios = '/servicio/listar';
const agregar = '/servicio/agregar';
const modificar = '/servicio/modificar';
const eliminar = '/servicio/eliminar';

// 🔄 Obtener todos los servicios
export async function getServicios() {
  try {
    const response = await axios.get(baseUrl + listarServicios);
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener servicios:', error);
    return [];
  }
}

// ➕ Agregar un nuevo servicio
export async function agregarServicio(servicio) {
  try {
    const response = await axios.post(baseUrl + agregar, servicio);
    return response.data;
  } catch (error) {
    console.error('❌ Error al agregar servicio:', error);
    throw error;
  }
}

// ✏️ Modificar un servicio existente
export async function modificarServicio(servicio) {
  try {
    const response = await axios.put(baseUrl + modificar, servicio);
    return response.data;
  } catch (error) {
    console.error('❌ Error al modificar servicio:', error);
    throw error;
  }
}

// ❌ Eliminar un servicio por ID
export async function eliminarServicio(idServicio) {
  try {
    await axios.delete(`${baseUrl + eliminar}/${idServicio}`);
  } catch (error) {
    console.error('❌ Error al eliminar servicio:', error);
    throw error;
  }
}

// ✅ Verificar si ya existe una descripción de servicio
export async function verificarDescripcion(descripcion) {
  try {
    const response = await axios.get(`${baseUrl}/servicio/verificar/${descripcion}`);
    return response.data; // true o false
  } catch (error) {
    console.error('❌ Error al verificar descripción:', error);
    return false; // fallback
  }
}
