import axios from 'axios';

const baseUrl = 'http://localhost:8080';
const listaper = '/empleado/listaempleado';
const agregarper = '/empleado/agregar';
const modificarper = '/empleado/modificar';
const eliminarper = '/empleado/eliminar';
// const urlcli = baseUrl + listacli;

export async function getlistaper() {
  try {
    const response = await axios.get(baseUrl + listaper);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Codigo recopilado
export async function agregarPersonal(personal) {
  try {
    const response = await axios.post(baseUrl + agregarper, personal);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(error);

    if (error.response) {
      return {
        success: false,
        message: error.response.data, // Mensaje exacto del backend
      };
    }

    return { success: false, message: 'Error desconocido' };
  }
}

export const verificarCarnet = async (carnet) => {
  const res = await axios.get(`${baseUrl}/verificar-carnet/${carnet}`);
  return res.data.existe; // backend responde { existe: true/false }
};

export async function modificarPersonal(personal) {
  try {
    const response = await axios.put(baseUrl + modificarper, personal);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function eliminarPersonal(id) {
  try {
    await axios.delete(`${baseUrl + eliminarper}/${id}`);
  } catch (error) {
    console.error(error);
  }
}
