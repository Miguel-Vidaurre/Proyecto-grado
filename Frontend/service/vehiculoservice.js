import axios from 'axios';

const baseUrl = 'http://localhost:8080';
const listavehi = '/vehiculo/listavehiculo';
const agregarvehi = '/vehiculo/agregar';
const modificarvehi = '/vehiculo/modificar';
const eliminarvehi = '/vehiculo/eliminar';
// const urlcli = baseUrl + listacli;

export async function getlistavehi() {
  try {
    const response = await axios.get(baseUrl + listavehi);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Codigo recopilado
export async function agregarVehiculo(vehiculo) {
  try {
    const response = await axios.post(baseUrl + agregarvehi, vehiculo);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error; // mejor lanzar error para que Formik pueda capturarlo
  }
}

export const modificarVehiculo = async (vehiculo) => {
  try {
    console.log('📡 PUT /vehiculo/modificar:', vehiculo);
    const response = await axios.put(`${baseUrl}/vehiculo/modificar`, vehiculo, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const verificarPlaca = async (placa) => {
  console.log('🔎 Verificando placa en backend:', `${baseUrl}/vehiculo/verificar/${placa}`);
  const response = await axios.get(`${baseUrl}/vehiculo/verificar/${placa}`);
  return response.data.existe;
};

export async function eliminarVehiculo(id) {
  try {
    await axios.delete(`${baseUrl + eliminarvehi}/${id}`);
  } catch (error) {
    console.error(error);
  }
}
