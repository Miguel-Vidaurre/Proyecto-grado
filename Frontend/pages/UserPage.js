import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useContext } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import {
  Table,
  Stack,
  Paper,
  Button,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TableHead,
  TextField,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Autocomplete from '@mui/material/Autocomplete';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';

// Servicios
import ModificarVehi from './modifivehi';
import { getlistavehi, agregarVehiculo, eliminarVehiculo, verificarPlaca } from '../service/vehiculoservice';
import { getlistacli } from '../service/clienteservice';
import { UserContext } from './UserContext';
import escudo from '../escudo.png';

// -------------------
// Constantes
// -------------------
const TABLE_HEAD = [
  { id: 'N°', label: 'N°', alignRight: false },
  { id: 'idCliente', label: 'Cliente', alignRight: false },
  { id: 'placa', label: 'Placa', alignRight: false },
  { id: 'marca', label: 'Marca', alignRight: false },
  { id: 'modelo', label: 'Modelo', alignRight: false },
  { id: 'tipo', label: 'Tipo', alignRight: false },
  { id: 'fechaRegistro', label: 'Fecha de Registro', alignRight: false },
];

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

// -------------------
// Componente principal
// -------------------
export default function VehiculosPage() {
  const [open, setOpen] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [data, setData] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [clienteBusqueda, setClienteBusqueda] = useState('');
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // dentro de tu componente
  const { usuario } = useContext(UserContext);

  // Roles que pueden ver acciones
  const rolesConAcceso = ['ADMINISTRADOR', 'SECRETARIA'];
  const mostrarAcciones = rolesConAcceso.includes(usuario?.rolActivo);

  // Determinar si el usuario es cliente
  const esCliente = usuario?.rolActivo === 'CLIENTE';

  // Estado para el diálogo de confirmación
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [vehiculoAEliminar, setVehiculoAEliminar] = useState(null);

  // Convierte de yyyy-MM-dd a dd/MM/yyyy
  const formatFechaDDMMYYYY = (fecha) => {
    if (!fecha) return '';
    const [year, month, day] = fecha.split('-');
    return `${day}/${month}/${year}`;
  };

  // Convierte de dd/MM/yyyy a yyyy-MM-dd para enviar al backend
  const formatFechaYYYYMMDD = (fecha) => {
    if (!fecha) return '';
    const [day, month, year] = fecha.split('/');
    return `${year}-${month}-${day}`;
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleAgregarVehiculo = () => {
    // aquí va tu lógica de guardar
    setSnackbarMessage('Se registró el vehículo correctamente');
    setSnackbarSeverity('success');
    setOpenSnackbar(true);
  };

  const handleEliminarVehiculo = () => {
    // aquí va tu lógica de eliminar
    setSnackbarMessage('Se eliminó el vehículo correctamente');
    setSnackbarSeverity('success');
    setOpenSnackbar(true);
  };

  const hoyLocal = new Date();
  const dia = String(hoyLocal.getDate()).padStart(2, '0');
  const mes = String(hoyLocal.getMonth() + 1).padStart(2, '0');
  const anio = hoyLocal.getFullYear();
  // -------------------
  // Formik
  // -------------------
  const formik = useFormik({
    initialValues: {
      idCliente: '',
      placa: '',
      marca: '',
      modelo: '',
      tipo: '',
      fechaRegistro: `${dia}/${mes}/${anio}`, // DD/MM/YYYY
      submit: null,
    },
    validationSchema: Yup.object({
      idCliente: Yup.number().typeError('Debe seleccionar un cliente válido.').required('Debe seleccionar un cliente.'),
      placa: Yup.string()
        .matches(/^[0-9]+-[A-Z]+$/, 'Formato: números-guion-letras en mayúsculas. Ej: 1234-ABC')
        .required('Campo requerido.'),
      marca: Yup.string().min(3).max(50).required('Campo requerido.'),
      modelo: Yup.string().max(50).required('Campo requerido.'),
      tipo: Yup.string().min(3).max(50).required('Campo requerido.'),
      fechaRegistro: Yup.string()
        .matches(/^\d{2}\/\d{2}\/\d{4}$/, 'Formato: DD/MM/YYYY')
        .required('Campo requerido.'),
    }),
    onSubmit: async (values, helpers) => {
      try {
        // Verificar placa
        const placaExiste = await verificarPlaca(values.placa.toUpperCase());
        if (placaExiste) {
          helpers.setFieldError('placa', 'Esta placa ya está registrada');
          helpers.setSubmitting(false);
          return;
        }

        // Preparar objeto para enviar al backend
        const vehiculoParaEnviar = {
          cliente: { idCliente: values.idCliente },
          placa: values.placa.toUpperCase(),
          marca: values.marca.toUpperCase(),
          modelo: values.modelo.toUpperCase(),
          tipo: values.tipo.toUpperCase(),
          fechaRegistro: formatFechaYYYYMMDD(values.fechaRegistro),
        };

        await agregarVehiculo(vehiculoParaEnviar);

        // Actualizar lista
        const lista = await getlistavehi();
        setData(lista);

        // Mensaje de éxito: llamamos al Snackbar
        handleAgregarVehiculo(); // ✅ aquí

        helpers.resetForm();
        setClienteSeleccionado('');
        setClienteBusqueda('');
        handleClose();
      } catch (error) {
        console.error(error);
        setMensaje('Error al guardar el vehículo.');
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: error.message });
        helpers.setSubmitting(false);
      }
    },
  });

  // -------------------
  // Efectos
  // -------------------
  useEffect(() => {
    getlistavehi().then(setData).catch(console.error);
    getlistacli().then(setClientes).catch(console.error);
  }, []);

  useEffect(() => {
    actualizarLista();
    getlistacli().then(setClientes).catch(console.error);
  }, []);

  // -------------------
  // Funciones
  // -------------------
  const actualizarLista = async () => {
    const lista = await getlistavehi();
    setData(lista);
  };

  const handleClickOpen = () => {
    formik.handleReset();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setClienteBusqueda('');
    setClienteSeleccionado('');
    setClientesFiltrados([]);
  };

  const vehiculosFiltrados = data.filter((vehiculo) => {
    const texto = filtro.toLowerCase();
    return (
      vehiculo.placa.toLowerCase().includes(texto) ||
      vehiculo.marca.toLowerCase().includes(texto) ||
      vehiculo.modelo.toLowerCase().includes(texto) ||
      vehiculo.tipo.toLowerCase().includes(texto) ||
      (vehiculo.cliente && `${vehiculo.cliente.nombre} ${vehiculo.cliente.apellido}`.toLowerCase().includes(texto))
    );
  });

  // Filtrar vehículos según rol
  const vehiculosFiltradosPorRol = esCliente
    ? vehiculosFiltrados.filter((vehiculo) => vehiculo.cliente?.idCliente === usuario.cliente?.idCliente)
    : vehiculosFiltrados;

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
        <title> Vehículos </title>
      </Helmet>

      <Container>
        <Typography variant="h4" sx={{ mb: 5 }}>
          Vehículos
        </Typography>

        {/* Botón nuevo vehículo */}
        {mostrarAcciones && (
          <Stack direction="row" justifyContent="flex-start" sx={{ mb: 3 }}>
            <Button variant="contained" onClick={handleClickOpen}>
              Nuevo Vehículo
            </Button>
          </Stack>
        )}

        {/* Modal agregar vehículo */}
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
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
                Agregar Vehículo
              </span>
            </DialogTitle>
            <DialogContent>
              <form onSubmit={formik.handleSubmit}>
                <Stack spacing={3}>
                  {/* Campo oculto idCliente */}
                  <input
                    type="hidden"
                    name="idCliente"
                    value={formik.values.idCliente}
                    onChange={formik.handleChange}
                  />

                  {/* Buscador de clientes */}
                  <TextField
                    label="Buscar Cliente"
                    fullWidth
                    value={clienteBusqueda}
                    onChange={(e) => {
                      const input = e.target.value.toLowerCase();
                      setClienteBusqueda(input);
                      const coincidencias = clientes.filter((c) =>
                        `${c.nombre} ${c.apellido}`.toLowerCase().includes(input)
                      );
                      setClientesFiltrados(coincidencias);
                    }}
                    sx={{ mb: 2 }}
                  />

                  {/* Lista de coincidencias */}
                  {clientesFiltrados.length > 0 && (
                    <Box sx={{ maxHeight: 120, overflowY: 'auto', mb: 2 }}>
                      {clientesFiltrados.map((cliente) => (
                        <Box
                          key={cliente.idCliente}
                          onClick={() => {
                            formik.setFieldValue('idCliente', Number(cliente.idCliente));
                            setClienteSeleccionado(`${cliente.nombre} ${cliente.apellido}`);
                            setClientesFiltrados([]);
                            setClienteBusqueda('');
                          }}
                          sx={{
                            cursor: 'pointer',
                            p: 1,
                            backgroundColor: '#f0f0f0',
                            borderBottom: '1px solid #ccc',
                            '&:hover': { backgroundColor: '#e0e0e0' },
                          }}
                        >
                          {cliente.nombre} {cliente.apellido} – {cliente.carnet}
                        </Box>
                      ))}
                    </Box>
                  )}

                  {/* Cliente seleccionado */}
                  {clienteSeleccionado && (
                    <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                      Cliente seleccionado: {clienteSeleccionado}
                    </Typography>
                  )}

                  {/* Campos vehículo */}
                  <TextField
                    label="Placa: 1234-ABC"
                    name="placa"
                    fullWidth
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.placa}
                    error={formik.touched.placa && Boolean(formik.errors.placa)}
                    helperText={formik.touched.placa && formik.errors.placa}
                  />

                  <TextField
                    label="Marca"
                    name="marca"
                    fullWidth
                    value={formik.values.marca}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.marca && Boolean(formik.errors.marca)}
                    helperText={formik.touched.marca && formik.errors.marca}
                    onKeyPress={(e) => {
                      if (/\d/.test(e.key)) e.preventDefault();
                    }}
                  />

                  <TextField
                    label="Modelo"
                    name="modelo"
                    fullWidth
                    value={formik.values.modelo}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.modelo && Boolean(formik.errors.modelo)}
                    helperText={formik.touched.modelo && formik.errors.modelo}
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) e.preventDefault();
                    }}
                  />

                  <TextField
                    label="Tipo"
                    name="tipo"
                    fullWidth
                    value={formik.values.tipo}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.tipo && Boolean(formik.errors.tipo)}
                    helperText={formik.touched.tipo && formik.errors.tipo}
                    onKeyPress={(e) => {
                      if (/\d/.test(e.key)) e.preventDefault();
                    }}
                  />

                  <TextField
                    label="Fecha de Registro"
                    name="fechaRegistro"
                    fullWidth
                    value={formik.values.fechaRegistro} // Mostrar DD/MM/YYYY
                    InputProps={{ readOnly: true }}
                    disabled
                  />
                </Stack>
              </form>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} variant="outlined">
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                onClick={formik.handleSubmit}
                disabled={!formik.isValid || !formik.dirty || formik.isSubmitting}
              >
                Guardar
              </Button>
            </DialogActions>
          </div>
        </Dialog>

        {/* Snackbar genérico */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <MuiAlert
            onClose={handleCloseSnackbar}
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
            elevation={6}
            variant="filled"
          >
            {snackbarMessage}
          </MuiAlert>
        </Snackbar>

        {/* Diálogo de confirmación de eliminación */}
        <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>Confirmar eliminación</DialogTitle>
          <DialogContent sx={{ textAlign: 'center' }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              ¿Desea eliminar el vehículo <strong>{vehiculoAEliminar?.placa}</strong> perteneciente a{' '}
              <strong>
                {vehiculoAEliminar?.cliente
                  ? `${vehiculoAEliminar.cliente.nombre} ${vehiculoAEliminar.cliente.apellido}`
                  : 'cliente desconocido'}
              </strong>
              ?
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
                try {
                  await eliminarVehiculo(vehiculoAEliminar.idVehiculo);
                  const lista = await getlistavehi();
                  setData(lista);
                  handleEliminarVehiculo(); // ✅ usa tu Snackbar existente
                } catch (error) {
                  console.error('Error al eliminar:', error);
                } finally {
                  setOpenConfirmDialog(false);
                }
              }}
            >
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Buscador en tabla */}
        <Autocomplete
          freeSolo
          disableClearable
          options={[]}
          inputValue={filtro}
          onInputChange={(e, newInputValue) => setFiltro(newInputValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Buscar..."
              placeholder="Cliente, Placa, Marca, Modelo o Tipo"
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

        {/* Tabla */}
        {esCliente && vehiculosFiltradosPorRol.length === 0 ? (
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 2 }}>
            No tiene vehículos registrados.
          </Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  {TABLE_HEAD.map((headCell) => (
                    <TableCell key={headCell.id}>{headCell.label}</TableCell>
                  ))}
                  {mostrarAcciones && <TableCell>Acciones</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {[...vehiculosFiltradosPorRol]
                  .sort((a, b) => {
                    const nombreA = a.cliente ? a.cliente.nombre : '';
                    const nombreB = b.cliente ? b.cliente.nombre : '';
                    return nombreA.localeCompare(nombreB);
                  })
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) // 🔹 solo filas de la página actual
                  .map((vehiculo, index) => (
                    <TableRow key={vehiculo.idVehiculo}>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>
                        {vehiculo.cliente ? `${vehiculo.cliente.nombre} ${vehiculo.cliente.apellido}` : 'Sin cliente'}
                      </TableCell>
                      <TableCell>{vehiculo.placa}</TableCell>
                      <TableCell>{vehiculo.marca}</TableCell>
                      <TableCell>{vehiculo.modelo}</TableCell>
                      <TableCell>{vehiculo.tipo}</TableCell>
                      <TableCell>{vehiculo.fechaRegistro ? formatFechaDDMMYYYY(vehiculo.fechaRegistro) : ''}</TableCell>
                      {mostrarAcciones && (
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                            <ModificarVehi vehiculo={vehiculo} actualizarLista={actualizarLista}>
                              <IconButton aria-label="Modificar" size="small" title="Modificar" sx={{ p: 0 }}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </ModificarVehi>
                            <IconButton
                              color="error"
                              size="small"
                              aria-label="Eliminar"
                              title="Eliminar"
                              onClick={() => {
                                setVehiculoAEliminar(vehiculo);
                                setOpenConfirmDialog(true);
                              }}
                              sx={{ p: 0 }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <TablePagination
          component="div"
          count={vehiculosFiltradosPorRol.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Filas por página"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        />
      </Container>
    </>
  );
}
