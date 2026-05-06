import axios from 'axios';

const baseUrl = 'http://localhost:8080';
const agregaruser = '/usuario/agregar';
const modificaruser = '/usuario/modificar';
const eliminaruser = '/usuario/eliminar';
const login = '/usuario/login';
const listaroles = '/usuario/listaroles';
const actualizar = '/usuario/actualizar-roles';
// const usercli = `/usuario/agregarCliente`;
const sugerirNombre = '/usuario/sugerir-nombre';
const userclien = `/usuario/agregar-cliente`;

export async function getUsuarioLogueado({ usuario, password }) {
  try {
    const response = await axios.post(`${baseUrl}${login}`, {
      usuario,
      password,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Obtener lista de roles desde backend
export async function getListaRoles() {
  try {
    const response = await axios.get(baseUrl + listaroles);
    return response.data; // Debe ser un array de roles
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Codigo recopilado
export async function agregarUsuario(usuario) {
  try {
    const response = await axios.post(baseUrl + agregaruser, usuario);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function modificarUsuario(usuario) {
  try {
    const response = await axios.put(baseUrl + modificaruser, usuario);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function eliminarUsuario(id) {
  try {
    await axios.delete(`${baseUrl + eliminaruser}/${id}`);
  } catch (error) {
    console.error(error);
  }
}

export async function actualizarRolesUsuario(idEmpleado, rolesIds) {
  try {
    const payload = {
      idEmpleado,
      roles: rolesIds,
    };
    const response = await axios.put(baseUrl + actualizar, payload);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar roles:', error);
    // Aquí añade para ver detalles más específicos del error:
    if (error.response) {
      // El servidor respondió con un status fuera del rango 2xx
      console.log('Respuesta del servidor:', error.response.data);
      console.log('Status:', error.response.status);
      console.log('Headers:', error.response.headers);
    } else if (error.request) {
      // La petición fue hecha pero no hubo respuesta
      console.log('No se recibió respuesta:', error.request);
    } else {
      // Error en configurar la petición
      console.log('Error configuración petición:', error.message);
    }
    return null;
  }
}

/* export const asignarUsuarioCliente = (usuario) =>
  axios.post(baseUrl + usercli, usuario).then((response) => {
    const roles = response.data.roles || [];
    console.log('Rol(es) asignado(s) al usuario:', roles.map((r) => r.nombre).join(', '));
    return response;
  }); */

export async function buscarUsuariosPorNombreBase(nombreBase) {
  try {
    const response = await axios.get(`${baseUrl}/usuario/buscar-por-nombrebase/${nombreBase}`);
    return response.data; // Debería ser un array de usuarios
  } catch (error) {
    console.error('Error al buscar usuarios por nombre base:', error);
    return [];
  }
}

export async function contarUsuariosPorNombreBase(nombreBase) {
  try {
    const response = await axios.get(`${baseUrl}/usuario/count-por-nombrebase/${nombreBase}`);
    return response.data; // número entero
  } catch (error) {
    console.error('Error al contar usuarios por nombre base:', error);
    return 0;
  }
}

export const obtenerNombreUsuarioDisponible = async (nombreBase) => {
  const response = await axios.get(`${baseUrl}${sugerirNombre}?base=${nombreBase}`);
  return response.data;
};

export const asignarUsuarioClientes = async ({ usuario, password, idCliente, roles }) => {
  try {
    // Convertimos a IDs simples según lo que espera el backend
    const payload = {
      usuario,
      password,
      idCliente, // Solo el ID del cliente
      rolesIds: roles.map((r) => r.idRol), // Array de IDs de roles
    };

    console.log('Payload que vamos a enviar:', payload);

    const response = await axios.post(`${baseUrl}${userclien}`, payload);

    // Mostrar roles asignados (si el backend los retorna)
    if (response.data.roles) {
      const rolesAsignados = response.data.roles.map((r) => r.nombre).join(', ');
      console.log('Rol(es) asignado(s) al usuario:', rolesAsignados);
    }

    return response.data;
  } catch (error) {
    console.error('Error al asignar usuario a cliente:', error);
    if (error.response) {
      console.log('Respuesta del servidor:', error.response.data);
      console.log('Status:', error.response.status);
    }
    return null;
  }
};
