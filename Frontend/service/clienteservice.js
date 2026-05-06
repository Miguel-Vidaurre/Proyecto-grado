import axios from 'axios';

const baseUrl = 'http://localhost:8080';
const listacli = '/cliente/listacliente';
const agregarcli = '/cliente/agregar';
const modificarcli = '/cliente/modificar';
const eliminarcli = '/cliente/eliminar';
// const urlcli = baseUrl + listacli;

export async function getlistacli() {
  try {
    const response = await axios.get(baseUrl + listacli);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Codigo recopilado
export async function agregarCliente(cliente) {
  try {
    const response = await axios.post(baseUrl + agregarcli, cliente);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export const verificarCarnet = async (carnet) => {
  const res = await axios.get(`${baseUrl}/cliente/verificar-carnet/${carnet}`);
  return res.data.existe; // backend responde { existe: true/false }
};

export async function modificarCliente(cliente) {
  try {
    const response = await axios.put(baseUrl + modificarcli, cliente);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// 🔹 Eliminar solo cliente
export async function eliminarCliente(idCliente) {
  try {
    await axios.delete(`${baseUrl + eliminarcli}/${idCliente}`);
  } catch (error) {
    console.error(error);
  }
}

// 🔹 Eliminar cliente + cotizaciones (en cascada)
export async function eliminarClienteConCotizaciones(idCliente) {
  try {
    await axios.delete(`${baseUrl + eliminarcli}/${idCliente}`);
  } catch (error) {
    console.error(error);
  }
}
