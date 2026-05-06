import axios from 'axios';

const baseUrl = 'http://localhost:8080';

const listarRepuestos = '/repuesto/lista';
const agregarRepuesto = '/repuesto/agregar';
const modificarRepuesto = '/repuesto/modificar';
const eliminarRepuesto = '/repuesto/eliminar';

// ✅ Obtener todos los repuestos
export async function getListaRepuestos() {
  try {
    const response = await axios.get(baseUrl + listarRepuestos);
    return response.data; // Aquí ya tienes la lista de RepuestoDTO con marca incluida
  } catch (error) {
    console.error('Error al obtener los repuestos:', error);
    return null;
  }
}

// ➕ Agregar nuevo repuesto
export async function crearRepuesto(repuesto) {
  try {
    const response = await axios.post(baseUrl + agregarRepuesto, repuesto);
    return response.data;
  } catch (error) {
    console.error('Error al crear repuesto:', error);
    return null;
  }
}

// ✏️ Modificar repuesto existente
export async function actualizarRepuesto(repuesto) {
  try {
    console.log('Repuesto a enviar:', repuesto);
    const response = await axios.put(`${baseUrl}/repuesto/modificar`, repuesto);
    return response.data;
  } catch (error) {
    console.error('Error al modificar repuesto:', error);
    return null;
  }
}

// ❌ Eliminar repuesto por ID
export async function eliminarRepuestoPorId(id) {
  try {
    await axios.delete(`${baseUrl + eliminarRepuesto}/${id}`);
  } catch (error) {
    console.error('Error al eliminar repuesto:', error);
  }
}
