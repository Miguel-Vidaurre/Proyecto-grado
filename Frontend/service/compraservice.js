import axios from 'axios';

const baseUrl = 'http://localhost:8080';
const listarCompra = '/compra/listar';
const agregarCompra = '/compra/agregar';
const modificarCompra = '/compra/modificar';
const eliminarCompra = '/compra/eliminar';

export async function getListaCompras() {
  try {
    const response = await axios.get(baseUrl + listarCompra);
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener lista de compras:', error);
    return null;
  }
}

// Agregar una nueva compra
export async function agregarCompraService(compra) {
  try {
    console.log('📦 Enviando compra al backend:', compra);
    const response = await axios.post(baseUrl + agregarCompra, compra);
    return response.data;
  } catch (error) {
    console.error('❌ Error al agregar compra:', error.response?.data || error.message);
    return null;
  }
}

// Modificar una compra
export async function modificarCompraService(compra) {
  try {
    const response = await axios.put(baseUrl + modificarCompra, compra);
    return response.data;
  } catch (error) {
    console.error('❌ Error al modificar compra:', error);
    return null;
  }
}

// Eliminar compra
export async function eliminarCompraService(id) {
  try {
    await axios.delete(`${baseUrl + eliminarCompra}/${id}`);
  } catch (error) {
    console.error('❌ Error al eliminar compra:', error);
  }
}
