import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  InputAdornment,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import IconButton from '@mui/material/IconButton';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import {
  getlistacli,
  agregarCliente,
  eliminarCliente,
  verificarCarnet,
  eliminarClienteConCotizaciones,
} from '../service/clienteservice';
import ModificarCli from './modificli';
import {
  getListaRoles,
  asignarUsuarioClientes,
  buscarUsuariosPorNombreBase,
  obtenerNombreUsuarioDisponible,
} from '../service/usuarioservice';
import escudo from '../escudo.png';

const TABLE_HEAD = [
  { id: 'N°', label: 'N°' },
  { id: 'nombre', label: 'Nombre' },
  { id: 'apellido', label: 'Apellido' },
  { id: 'carnet', label: 'Carnet' },
  { id: 'email', label: 'Correo' },
  { id: 'telefono', label: 'Telefono' },
  { id: 'nit', label: 'Nit' },
  { id: 'acciones', label: 'Acciones' },
];

export default function UserPage() {
  const [clientes, setClientes] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [modalUsuarioAbierto, setModalUsuarioAbierto] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [roles, setRoles] = useState([]);
  const [rolSeleccionado, setRolSeleccionado] = useState([]);
  // Para el Snackbar
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [mensajeSnack, setMensajeSnack] = useState('');
  const [tipoSnack, setTipoSnack] = useState('success');
  const [openSnackbarEliminar, setOpenSnackbarEliminar] = useState(false);

  // Estado para el diálogo de confirmación
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [clienteAEliminar, setClienteAEliminar] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // regresar a la primera página
  };

  // Lista filtrada según el buscador
  const clientesFiltrados = clientes.filter((cliente) => {
    const busqueda = filtro.toLowerCase();
    return (
      cliente.nombre.toLowerCase().includes(busqueda) ||
      cliente.apellido.toLowerCase().includes(busqueda) ||
      cliente.carnet.toLowerCase().includes(busqueda)
    );
  });

  const fetchClientes = async () => {
    try {
      const lista = await getlistacli();
      const clientesConEstado = lista.map((c) => ({
        ...c,
        tieneUsuarioCliente: c.usuario?.roles?.some((r) => r.idRol === 4) || false,
      }));
      console.log(
        'Clientes con estado:',
        clientesConEstado.map((c) => ({
          id: c.idCliente,
          nombre: c.nombre,
          tieneUsuarioCliente: c.tieneUsuarioCliente,
          roles: c.usuario?.roles || [],
        }))
      );
      setClientes(clientesConEstado);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleCloseSnackbar = () => setOpenSnackbar(false);

  const handleOpenDialog = () => {
    formik.resetForm();
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  // Manejo cierre snackbar eliminación
  const handleCloseSnackbarEliminar = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpenSnackbarEliminar(false);
  };

  // Abrir modal asignar usuario y cargar roles (solo Cliente)
  const abrirModalUsuario = async (cliente) => {
    try {
      // Solo necesitamos el rol CLIENTE
      const rolCliente = { idRol: 4, nombre: 'CLIENTE' };
      setRoles([rolCliente]);
      setRolSeleccionado([rolCliente.idRol]);

      // Generar nombre de usuario único
      const usuarioGenerado = await generarNombreUsuarioCliente(cliente.nombre);

      setUsuarioSeleccionado({
        ...cliente,
        usuarioGenerado,
        passwordGenerada: cliente.carnet,
      });

      setModalUsuarioAbierto(true);
    } catch (error) {
      console.error('Error al abrir modal usuario:', error);
    }
  };

  const generarNombreUsuarioCliente = async (nombreCliente) => {
    const base = nombreCliente.toUpperCase().replace(/\s/g, '');

    try {
      // Intentar obtener sugerencia desde backend
      const sugerencia = await obtenerNombreUsuarioDisponible(base);
      return sugerencia;
    } catch {
      // Fallback local: buscar usuarios existentes
      const usuariosExistentes = await buscarUsuariosPorNombreBase(base);
      const numeros = usuariosExistentes
        .map((u) => {
          const match = u.usuario?.match(new RegExp(`^${base}(\\d+)$`));
          return match ? parseInt(match[1], 10) : null;
        })
        .filter((n) => n !== null);
      const siguienteNumero = numeros.length > 0 ? Math.max(...numeros) + 1 : 1;
      return `${base}${siguienteNumero}`;
    }
  };

  const handleGuardarUsuarioCliente = async () => {
    if (!usuarioSeleccionado || rolSeleccionado.length === 0) return;

    try {
      const usuarioPayload = {
        usuario: usuarioSeleccionado.usuarioGenerado,
        password: usuarioSeleccionado.passwordGenerada,
        idCliente: usuarioSeleccionado.idCliente,
        roles: rolSeleccionado.map((idRol) => ({ idRol })), // array de objetos {idRol}
      };

      const result = await asignarUsuarioClientes(usuarioPayload);

      if (result) {
        // 🔹 Actualizamos la lista localmente
        setClientes((prev) =>
          prev.map((c) =>
            c.idCliente === usuarioSeleccionado.idCliente
              ? { ...c, tieneUsuarioCliente: true, roles: [...(c.roles || []), { nombre: 'CLIENTE' }] }
              : c
          )
        );

        setMensajeSnack('Usuario creado y rol CLIENTE asignado correctamente');
        setTipoSnack('success');
        setOpenSnackbar(true);
        setModalUsuarioAbierto(false);
      } else {
        setMensajeSnack('Error al asignar usuario');
        setTipoSnack('error');
        setOpenSnackbar(true);
      }
    } catch (err) {
      console.error(err);
      setMensajeSnack('Error al asignar usuario');
      setTipoSnack('error');
      setOpenSnackbar(true);
    }
  };

  const handleAsignarUsuario = async (cliente) => {
    try {
      const nuevoUsuario = {
        usuario: cliente.nombre,
        password: cliente.carnet,
        roles: [{ idRol: 4 }], // CLIENTE
        idCliente: cliente.idCliente,
      };

      await asignarUsuarioClientes(nuevoUsuario);
      await fetchClientes();

      // ✅ Mostrar Snackbar en vez de alert
      setMensajeSnack('Usuario creado y rol CLIENTE asignado correctamente');
      setTipoSnack('success');
      setOpenSnackbar(true);
    } catch (error) {
      console.error(error);

      // ✅ Snackbar de error
      setMensajeSnack('Error al asignar usuario');
      setTipoSnack('error');
      setOpenSnackbar(true);
    }
  };

  const formik = useFormik({
    initialValues: {
      nombre: '',
      apellido: '',
      carnet: '',
      email: '',
      telefono: '',
      nit: '',
    },
    validationSchema: Yup.object({
      nombre: Yup.string().min(3).max(50).required('Campo requerido.'),
      apellido: Yup.string().max(50).required('Campo requerido.'),
      carnet: Yup.string().min(3).max(50).required('Campo requerido.'),
      email: Yup.string()
        .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/, 'Correo inválido. Debe contener @ y terminar en .com')
        .required('Campo requerido.'),
      telefono: Yup.string()
        .required('Campo requerido.')
        .matches(/^\d+$/, 'Solo se permiten números') // solo dígitos
        .length(8, 'El teléfono debe tener exactamente 8 dígitos'),
      nit: Yup.string().required('Campo requerido.'),
    }),
    onSubmit: async (values, helpers) => {
      try {
        const existe = await verificarCarnet(values.carnet); // servicio que retorna true/false
        if (existe) {
          helpers.setFieldError('carnet', 'Este carnet ya está registrado');
          helpers.setSubmitting(false);
          return;
        }
        const valoresFinales = {
          nombre: values.nombre.toUpperCase(),
          apellido: values.apellido.toUpperCase(),
          carnet: values.carnet,
          email: values.email,
          telefono: values.telefono,
          nit: values.nit,
        };

        await agregarCliente(valoresFinales);
        await fetchClientes();
        setOpenDialog(false);

        // Mostrar Snackbar
        setMensajeSnack('Se registró el cliente correctamente');
        setTipoSnack('success');
        setOpenSnackbar(true);
      } catch (err) {
        helpers.setErrors({ submit: err.message });

        // Mostrar Snackbar de error
        setMensajeSnack('Error al guardar el cliente');
        setTipoSnack('error');
        setOpenSnackbar(true);
      }
    },
  });

  const BackgroundImage = styled('img')({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'contain', // 🔹 Muestra toda la imagen (aunque deje bordes)
    opacity: 0.3,
    zIndex: 0,
    pointerEvents: 'none',
  });

  return (
    <>
      <Helmet>
        <title>Clientes</title>
      </Helmet>

      <Container>
        <Typography variant="h4" sx={{ mb: 5 }}>
          Clientes
        </Typography>

        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <Button variant="contained" onClick={handleOpenDialog}>
            Nuevo Cliente
          </Button>
        </Stack>

        {/* Dialog para agregar cliente */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <BackgroundImage src={escudo} alt="fondo" />

            <DialogTitle
              sx={{
                textAlign: 'center',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <span
                style={{
                  backgroundColor: '#e3f2fd', // Celeste clarito detrás del texto
                  color: '#0d47a1', // Azul oscuro para contraste
                  padding: '4px 12px', // Espaciado interior
                  borderRadius: '8px', // Bordes redondeados suaves
                  fontWeight: 'bold',
                  fontSize: '1.25rem',
                  display: 'inline-block', // Permite que el fondo solo rodee el texto
                }}
              >
                Agregar Cliente
              </span>
            </DialogTitle>

            {/* FORMULARIO */}
            <form onSubmit={formik.handleSubmit}>
              <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                  <TextField
                    label="Nombre"
                    name="nombre"
                    value={formik.values.nombre}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={!!(formik.touched.nombre && formik.errors.nombre)}
                    helperText={formik.touched.nombre && formik.errors.nombre}
                    fullWidth
                    onKeyPress={(e) => {
                      if (/\d/.test(e.key)) e.preventDefault();
                    }}
                  />
                  <TextField
                    label="Apellido"
                    name="apellido"
                    value={formik.values.apellido}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={!!(formik.touched.apellido && formik.errors.apellido)}
                    helperText={formik.touched.apellido && formik.errors.apellido}
                    fullWidth
                    onKeyPress={(e) => {
                      if (/\d/.test(e.key)) e.preventDefault();
                    }}
                  />
                  <TextField
                    label="Carnet"
                    name="carnet"
                    type="number"
                    value={formik.values.carnet}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={!!(formik.touched.carnet && formik.errors.carnet)}
                    helperText={formik.touched.carnet && formik.errors.carnet}
                    fullWidth
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) e.preventDefault();
                    }}
                  />
                  <TextField
                    label="Correo"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={!!(formik.touched.email && formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                    fullWidth
                  />
                  <TextField
                    fullWidth
                    name="telefono"
                    label="Teléfono"
                    value={formik.values.telefono}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Solo números y máximo 8 dígitos
                      if (/^\d{0,8}$/.test(value)) {
                        formik.setFieldValue('telefono', value);
                      }
                    }}
                    onBlur={formik.handleBlur}
                    error={formik.touched.telefono && Boolean(formik.errors.telefono)}
                    helperText={formik.touched.telefono && formik.errors.telefono}
                    inputProps={{ maxLength: 8 }}
                  />
                  <TextField
                    label="Nit"
                    name="nit"
                    type="number"
                    value={formik.values.nit}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={!!(formik.touched.nit && formik.errors.nit)}
                    helperText={formik.touched.nit && formik.errors.nit}
                    fullWidth
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) e.preventDefault();
                    }}
                  />
                </Stack>

                {formik.errors.submit && (
                  <Typography color="error" sx={{ mt: 2 }}>
                    {formik.errors.submit}
                  </Typography>
                )}
              </DialogContent>

              <DialogActions>
                <Button onClick={handleCloseDialog}>Cancelar</Button>
                <Button
                  type="submit" // importante
                  variant="contained"
                  color="primary"
                  disabled={!(formik.isValid && formik.dirty)}
                >
                  Guardar
                </Button>
              </DialogActions>
            </form>
          </div>
        </Dialog>

        {/* 🔹 Dialogo de confirmación de eliminación */}
        <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>Confirmar eliminación</DialogTitle>
          <DialogContent sx={{ textAlign: 'center' }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {clienteAEliminar?.nombre
                ? `¿Desea eliminar al cliente ${clienteAEliminar.nombre} ${clienteAEliminar.apellido} junto con todos sus vehículos y cotizaciones asociados?`
                : '¿Desea eliminar este cliente?'}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
            <Button variant="outlined" color="primary" onClick={() => setOpenConfirmDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={async () => {
                if (!clienteAEliminar) return;

                try {
                  // Eliminar cliente en cascada (vehículos + cotizaciones)
                  await eliminarClienteConCotizaciones(clienteAEliminar.idCliente);

                  // Actualizar la lista local
                  await fetchClientes();

                  // Mostrar snackbar de éxito
                  setMensajeSnack('Cliente eliminado correctamente');
                  setTipoSnack('success');
                  setOpenSnackbar(true);
                } catch (error) {
                  console.error('Error al eliminar cliente:', error);

                  // Snackbar de error
                  setMensajeSnack('Error al eliminar cliente y sus registros asociados');
                  setTipoSnack('error');
                  setOpenSnackbar(true);
                } finally {
                  setOpenConfirmDialog(false);
                }
              }}
            >
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar de confirmación guardado */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <MuiAlert
            onClose={handleCloseSnackbar}
            severity={tipoSnack}
            sx={{ width: '100%' }}
            elevation={6}
            variant="filled"
          >
            {mensajeSnack}
          </MuiAlert>
        </Snackbar>

        {/* Snackbar de confirmación eliminación */}
        <Snackbar
          open={openSnackbarEliminar}
          autoHideDuration={3000}
          onClose={handleCloseSnackbarEliminar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <MuiAlert
            onClose={handleCloseSnackbarEliminar}
            severity="success"
            sx={{ width: '100%' }}
            elevation={6}
            variant="filled"
          >
            Se eliminó correctamente el cliente
          </MuiAlert>
        </Snackbar>

        {/* Snackbar de usuario y rol */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <MuiAlert
            onClose={handleCloseSnackbar}
            severity={tipoSnack} // 👈 dinámico según success/error
            sx={{ width: '100%' }}
            elevation={6}
            variant="filled"
          >
            {mensajeSnack}
          </MuiAlert>
        </Snackbar>

        {/* Modal para mostrar usuario asignado */}
        <Dialog open={modalUsuarioAbierto} onClose={() => setModalUsuarioAbierto(false)} fullWidth maxWidth="sm">
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <BackgroundImage src={escudo} alt="fondo" />

            <DialogTitle
              sx={{
                textAlign: 'center',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <span
                style={{
                  backgroundColor: '#e3f2fd', // Celeste clarito detrás del texto
                  color: '#0d47a1', // Azul oscuro para contraste
                  padding: '4px 12px', // Espaciado interior
                  borderRadius: '8px', // Bordes redondeados suaves
                  fontWeight: 'bold',
                  fontSize: '1.25rem',
                  display: 'inline-block', // Permite que el fondo solo rodee el texto
                }}
              >
                Usuario generado
              </span>
            </DialogTitle>
            <DialogContent>
              <TextField
                margin="dense"
                label="Usuario"
                fullWidth
                value={usuarioSeleccionado?.usuarioGenerado || ''}
                InputProps={{ readOnly: true }}
                sx={{ pointerEvents: 'none' }}
              />
              <TextField
                margin="dense"
                label="Contraseña"
                fullWidth
                type="text"
                value={usuarioSeleccionado?.passwordGenerada || ''}
                InputProps={{ readOnly: true }}
                sx={{ pointerEvents: 'none' }}
              />
              <TextField
                margin="dense"
                label="Rol"
                fullWidth
                value={roles.find((r) => r.idRol === 4)?.nombre || 'CLIENTE'} // siempre CLIENTE
                InputProps={{ readOnly: true }}
                sx={{ pointerEvents: 'none' }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setModalUsuarioAbierto(false)} color="secondary">
                Cerrar
              </Button>
              <Button onClick={handleGuardarUsuarioCliente} color="primary" variant="contained">
                Guardar
              </Button>
            </DialogActions>
          </div>
        </Dialog>

        <Autocomplete
          freeSolo
          disableClearable
          options={[]} // como queremos filtrar por texto libre, no necesitamos opciones
          inputValue={filtro}
          onInputChange={(e, newInputValue) => setFiltro(newInputValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Buscar cliente..."
              placeholder="Nombre, Apellido, Carnet"
              variant="outlined"
              size="small"
              fullWidth
              sx={{ mb: 2 }}
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        {/* Tabla de clientes */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {TABLE_HEAD.map((head) => (
                  <TableCell key={head.id} align="center">
                    {head.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {clientesFiltrados
                .sort((a, b) => a.nombre.localeCompare(b.nombre))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((cliente, index) => (
                  <TableRow key={cliente.idCliente}>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{cliente.nombre}</TableCell>
                    <TableCell>{cliente.apellido}</TableCell>
                    <TableCell>{cliente.carnet}</TableCell>
                    <TableCell>{cliente.email}</TableCell>
                    <TableCell>{cliente.telefono}</TableCell>
                    <TableCell>{cliente.nit}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                        <ModificarCli cliente={cliente} onClienteActualizado={fetchClientes}>
                          <IconButton
                            aria-label="Modificar"
                            size="small"
                            title="Modificar"
                            sx={{ border: 'none', p: 0 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </ModificarCli>

                        <IconButton
                          color="error"
                          size="small"
                          aria-label="Eliminar"
                          title="Eliminar"
                          onClick={() => {
                            setClienteAEliminar(cliente); // Guarda el cliente seleccionado
                            setOpenConfirmDialog(true); // Abre el modal de confirmación
                          }}
                          sx={{ p: 0 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                          color="secondary"
                          size="small"
                          aria-label="Asignar Usuario"
                          title="Asignar Usuario"
                          onClick={() => abrirModalUsuario(cliente)}
                          sx={{ border: 'none', p: 0 }}
                          disabled={cliente.tieneUsuarioCliente}
                        >
                          <PersonIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={clientesFiltrados.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Filas por página"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        />
      </Container>
    </>
  );
}
