import { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Stack,
  Button,
  Grid,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  Autocomplete,
  InputAdornment,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { Helmet } from 'react-helmet-async';

import { getlistaper } from '../service/personalservice';
import { getlistavehi } from '../service/vehiculoservice';
import { getServicios } from '../service/serviciosservice';
import FacturaBoliviaPDF from './Facturaa';
import { agregarHistorial, getlistahis } from '../service/historialservice';
import { getListaRepuestos } from '../service/repuestoservice';
import { UserContext } from './UserContext';
import escudo from '../escudo.png';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function HistorialServicios() {
  const [data, setData] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [repuestos, setRepuestos] = useState([]);
  const [open, setOpen] = useState(false);

  const [usuario, setUsuario] = useState(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // 'success' | 'error'

  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroVehiculo, setFiltroVehiculo] = useState(null);
  const [filtroTexto, setFiltroTexto] = useState('');

  const [facturaOpen, setFacturaOpen] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState(null);

  const hoy = new Date();
  const dd = String(hoy.getDate()).padStart(2, '0');
  const mm = String(hoy.getMonth() + 1).padStart(2, '0');
  const yyyy = hoy.getFullYear();

  const fechaLocalDDMMYYYY = `${dd}/${mm}/${yyyy}`;
  const fechaLocalYYYYMMDD = `${yyyy}-${mm}-${dd}`;

  const rolesConAcceso = ['ADMINISTRADOR', 'SECRETARIA'];
  const mostrarBotonNuevo = rolesConAcceso.includes(usuario?.rolActivo);

  const [page, setPage] = useState(0); // página actual
  const [rowsPerPage, setRowsPerPage] = useState(10); // filas por página

  const [ordenFecha, setOrdenFecha] = useState('desc');

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // resetear a la primera página
  };

  // Cargar usuario desde localStorage
  useEffect(() => {
    try {
      const usuarioLS = localStorage.getItem('usuario');
      if (usuarioLS && usuarioLS !== 'undefined') {
        setUsuario(JSON.parse(usuarioLS));
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  // Cargar datos de backend
  const loadData = async () => {
    setData(await getlistahis());
    setVehiculos(await getlistavehi());
    setEmpleados(await getlistaper());
    setServicios(await getServicios());
    setRepuestos(await getListaRepuestos());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Convierte de YYYY-MM-DD a DD/MM/YYYY para mostrar
  const formatFechaDDMMYYYY = (fecha) => {
    if (!fecha) return '';
    const soloFecha = fecha.includes('T') ? fecha.split('T')[0] : fecha; // elimina hora
    const [year, month, day] = soloFecha.split('-');
    return `${day}/${month}/${year}`;
  };

  // Convierte de DD/MM/YYYY a YYYY-MM-DD para enviar al backend
  const formatFechaYYYYMMDD = (fecha) => {
    if (!fecha) return '';
    const [day, month, year] = fecha.split('/');
    return `${year}-${month}-${day}`;
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      idVehiculo: '',
      idEmpleado: '',
      fecha: fechaLocalDDMMYYYY,
      total: 0,
      descuento: 0,
      detalles: [],
      detallesServicios: [],
      detallesRepuestos: [],
    },
    validationSchema: Yup.object({
      idVehiculo: Yup.string().required('Requerido'),
      idEmpleado: Yup.string().required('Requerido'),
      fecha: Yup.string().required('Requerido'),
      total: Yup.number().required('Requerido'),
      descuento: Yup.number().min(0, 'No puede ser negativo'),
      detalles: Yup.array().of(
        Yup.object({
          servicioId: Yup.number().required('Requerido'),
          cantidadServicios: Yup.number().min(1, 'Mínimo 1').required('Requerido'),
        })
      ),
      detallesRepuestos: Yup.array().of(
        Yup.object({
          idRepuesto: Yup.number().required('Requerido'),
          cantidad: Yup.number().min(1, 'Mínimo 1').required('Requerido'),
          precio: Yup.number().min(0, 'Debe ser mayor o igual a 0').required('Requerido'),
        })
      ),
    }),
    onSubmit: async (values, helpers) => {
      helpers.setSubmitting(true);
      try {
        // Buscar vehiculo y empleado seleccionados
        const vehiculoSeleccionado = vehiculos.find((v) => v.idVehiculo === Number(values.idVehiculo));
        const empleadoSeleccionado = usuario?.empleado;

        // Calcular subtotal de servicios
        const totalServicios = values.detalles.reduce((acc, s) => {
          const cantidad = s.cantidadServicios || 0;
          const costo = s.costoUnitarioServ || 0;
          return acc + cantidad * costo;
        }, 0);

        // Construir payload
        const payload = {
          vehiculo: {
            idVehiculo: values.idVehiculo,
            placa: vehiculoSeleccionado?.placa || '',
          },
          empleado: {
            idEmpleado: values.idEmpleado,
            nombre: empleadoSeleccionado?.nombre || '',
            apellido: empleadoSeleccionado?.apellido || '',
          },
          fecha: formik.values.fecha.split('/').reverse().join('-'), // DD/MM/YYYY → YYYY-MM-DD
          total: values.total,
          descuento: values.descuento || 0,
          subtotalServicios: totalServicios,

          // ⚡ Corrección clave: servicio debe ser un objeto con idServicio
          detallesServicios: values.detalles
            .filter((s) => (s.servicioId || s.servicio?.idServicio) && s.cantidadServicios > 0)
            .map((s) => ({
              servicio: {
                idServicio: s.servicio?.idServicio ?? s.servicioId,
                nombre: s.servicio?.tipoServicio || '', // 🔹 aquí va el nombre del servicio seleccionado
              },
              cantidad: s.cantidadServicios,
              subtotal: s.subtotal ?? s.cantidadServicios * (s.costoUnitarioServ || 0),
            })),

          detallesRepuestos: values.detallesRepuestos
            .filter((r) => r.idRepuesto && r.cantidad > 0)
            .map((r) => ({
              repuesto: { idRepuesto: r.idRepuesto },
              cantidad: r.cantidad,
              precio: r.precio,
              subtotal: r.subtotal,
            })),
        };

        console.log('📦 Payload final a enviar:', payload);

        // Enviar al backend
        await agregarHistorial(payload);
        await loadData();
        setOpen(false);

        // Mostrar mensaje de éxito
        setSnackbarMessage('Se registró el servicio realizado correctamente');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);

        // Limpiar formulario
        formik.resetForm();
      } catch (error) {
        helpers.setSubmitting(false);
        helpers.setErrors({ submit: 'Error al guardar' });

        const mensajeBackend = error.response?.data?.message || error.response?.data || error.message;

        setSnackbarMessage('Error al registrar el servicio');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        console.error(error);
      }
    },
  });

  useEffect(() => {
    console.log('🧪 Errores actuales:', formik.errors);
  }, [formik.errors]);

  useEffect(() => {
    const totalServicios = formik.values.detalles.reduce((acc, item) => acc + (item.subtotal || 0), 0);
    const totalRepuestos = formik.values.detallesRepuestos.reduce((acc, item) => acc + (item.subtotal || 0), 0);
    const total = totalServicios + totalRepuestos - (formik.values.descuento || 0); // ✅ Aplicar descuento
    formik.setFieldValue('total', total >= 0 ? total : 0); // no permitir negativo
  }, [formik.values.detalles, formik.values.detallesRepuestos, formik.values.descuento]);

  const actualizarTotal = () => {
    const totalServicios = formik.values.detalles.reduce((sum, item) => sum + item.subtotal, 0);
    const totalRepuestos = formik.values.detallesRepuestos.reduce((sum, item) => sum + item.subtotal, 0);
    const total = totalServicios + totalRepuestos;
    formik.setFieldValue('total', total);
  };

  const handleDetalleChange = (index, field, value) => {
    const updated = [...formik.values.detalles];

    if (field === 'servicioId') {
      const servicioSeleccionado = servicios.find((s) => s.idServicio === Number(value));
      if (servicioSeleccionado) {
        updated[index].servicioId = servicioSeleccionado.idServicio;
        updated[index].costoUnitarioServ = servicioSeleccionado.costo || 0;
        updated[index].servicio = servicioSeleccionado; // 🔹 importante que tenga el nombre
        if (!updated[index].cantidadServicios) updated[index].cantidadServicios = 1;
        updated[index].subtotal = updated[index].cantidadServicios * updated[index].costoUnitarioServ;
      }
    } else {
      updated[index][field] = value;
      const cantidad = Number(updated[index].cantidadServicios) || 0;
      const costo = Number(updated[index].costoUnitarioServ) || 0;
      updated[index].subtotal = cantidad * costo;
    }

    formik.setFieldValue('detalles', updated);
    actualizarTotal();
  };

  const handleRepuestoChange = (index, field, value) => {
    const updated = [...formik.values.detallesRepuestos];
    const detalle = { ...updated[index] };

    if (field === 'idRepuesto') {
      const repuestoSeleccionado = repuestos.find((r) => r.idRepuesto === Number(value));
      if (repuestoSeleccionado) {
        detalle.idRepuesto = repuestoSeleccionado.idRepuesto;
        detalle.repuesto = { idRepuesto: repuestoSeleccionado.idRepuesto, nombre: repuestoSeleccionado.nombre };
        detalle.precio = repuestoSeleccionado.precio;
        detalle.stockDisponible = repuestoSeleccionado.cantidad; // stock disponible
        detalle.cantidad = 1;
        detalle.subtotal = detalle.precio * detalle.cantidad;
      }
    } else if (field === 'cantidad') {
      // Limitar cantidad al stock disponible
      const cantidad = Math.min(value, detalle.stockDisponible || value);
      detalle.cantidad = cantidad;
      detalle.subtotal = detalle.precio * cantidad;
    }

    updated[index] = detalle;
    formik.setFieldValue('detallesRepuestos', updated);
    actualizarTotal();
  };

  const handleRepuestoSeleccionado = (index, selectedId) => {
    const repuestoSeleccionado = repuestos.find((r) => r.id === Number(selectedId));
    if (repuestoSeleccionado) {
      const updatedDetalles = [...formik.values.detallesRepuestos];
      updatedDetalles[index] = {
        ...updatedDetalles[index],
        repuesto: {
          ...repuestoSeleccionado,
          idRepuesto: repuestoSeleccionado.id, // 👈 Esto es clave
        },
      };
      formik.setFieldValue('detallesRepuestos', updatedDetalles);
    }
  };

  const [mostrarPreview, setMostrarPreview] = useState(false);

  const dataFiltrada = data.filter((item) => {
    console.log('🧪 Item completo:', item);
    console.log('   detallesServicios:', item.detallesServicios);
    console.log('   detallesRepuestos:', item.detallesRepuestos);

    const fechaOK = filtroFecha ? item.fecha.split('T')[0] === filtroFecha : true;
    const vehiculoOK = filtroVehiculo ? item.vehiculo?.placa === filtroVehiculo.placa : true;
    const normalize = (str) => str?.toLowerCase().replace(/[-\s]/g, '');

    const serviciosText = item.detallesServicios?.map((d) => d.tipoDeServicioRealizado).join(', ') || '';
    const textoBuscado = [item.vehiculo?.placa, item.empleado?.nombre, item.empleado?.apellido, serviciosText]
      .map(normalize)
      .join(' ');

    const textoOK = filtroTexto ? textoBuscado.includes(normalize(filtroTexto)) : true;

    return fechaOK && vehiculoOK && textoOK;
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
        <title>Historial de Servicios</title>
      </Helmet>

      <Container>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Historial de Servicios
        </Typography>

        <Stack direction="row" spacing={2} mb={3}>
          {mostrarBotonNuevo && (
            <Button variant="contained" onClick={() => setOpen(true)}>
              Nuevo Historial
            </Button>
          )}
        </Stack>

        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField
            type="date"
            label="Filtrar por Fecha"
            InputLabelProps={{ shrink: true }}
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            size="small"
            inputProps={{
              max: new Date().toISOString().split('T')[0], // fecha actual
            }}
          />

          <Autocomplete
            freeSolo
            disableClearable
            options={[]}
            inputValue={filtroTexto}
            onInputChange={(e, newInputValue) => setFiltroTexto(newInputValue)}
            sx={{ flex: 1 }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Buscar..."
                placeholder="Placa, Empleado o Descripción"
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

          <TextField
            select
            label="Ordenar por fecha"
            size="small"
            value={ordenFecha}
            onChange={(e) => setOrdenFecha(e.target.value)}
            sx={{ width: 200 }}
          >
            <MenuItem value="asc">Más antiguas</MenuItem>
            <MenuItem value="desc">Más recientes</MenuItem>
          </TextField>
        </Stack>

        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
          <div style={{ position: 'relative' }}>
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
                  backgroundColor: '#e3f2fd',
                  color: '#0d47a1',
                  padding: '4px 12px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '1.25rem',
                  display: 'inline-block',
                }}
              >
                Registrar Servicio Realizado
              </span>
            </DialogTitle>
            <DialogContent>
              <FormikProvider value={formik}>
                <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 2 }}>
                  <Stack spacing={2}>
                    <Autocomplete
                      options={vehiculos} // lista de vehículos
                      getOptionLabel={(option) => option.placa || ''} // texto visible en la lista
                      value={vehiculos.find((v) => v.idVehiculo === formik.values.idVehiculo) || null}
                      onChange={(_, newValue) => {
                        formik.setFieldValue('idVehiculo', newValue ? newValue.idVehiculo : '');
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Vehículo (Placa)"
                          fullWidth
                          error={formik.touched.idVehiculo && Boolean(formik.errors.idVehiculo)}
                          helperText={formik.touched.idVehiculo && formik.errors.idVehiculo}
                        />
                      )}
                      isOptionEqualToValue={(option, value) => option.idVehiculo === value.idVehiculo}
                    />

                    <Autocomplete
                      options={empleados.filter((e) => e.roles?.some((r) => r.nombre === 'MECANICO'))} // solo mecánicos
                      getOptionLabel={(option) => `${option.nombre} ${option.apellido}`}
                      value={empleados.find((e) => e.idEmpleado === formik.values.idEmpleado) || null} // ⚡ inicia vacío
                      onChange={(_, newValue) => {
                        formik.setFieldValue('idEmpleado', newValue ? newValue.idEmpleado : '');
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Empleado (Mecánico)"
                          fullWidth
                          error={formik.touched.idEmpleado && Boolean(formik.errors.idEmpleado)}
                          helperText={formik.touched.idEmpleado && formik.errors.idEmpleado}
                        />
                      )}
                      isOptionEqualToValue={(option, value) => option.idEmpleado === value.idEmpleado}
                    />

                    {/* Servicios dinámicos */}
                    <Typography variant="h6">Servicios</Typography>

                    {formik.values.detalles.map((detalle, index) => (
                      <Grid
                        container
                        spacing={2}
                        key={detalle.servicioId ?? detalle.idTemp ?? index}
                        alignItems="center"
                      >
                        {/* Selector de Servicio */}
                        <Grid item xs={5}>
                          <TextField
                            select
                            fullWidth
                            label="Servicio"
                            value={detalle.servicioId || ''}
                            onChange={(e) => handleDetalleChange(index, 'servicioId', e.target.value)}
                          >
                            <MenuItem value="">
                              <em>Seleccione servicio</em>
                            </MenuItem>
                            {servicios
                              .slice() // para no modificar el array original
                              .sort((a, b) => a.tipoServicio.localeCompare(b.tipoServicio))
                              .map((serv) => (
                                <MenuItem key={serv.idServicio} value={serv.idServicio}>
                                  {serv.tipoServicio}
                                </MenuItem>
                              ))}
                          </TextField>
                        </Grid>

                        {/* Cantidad */}
                        <Grid item xs={2}>
                          <TextField
                            type="number"
                            label="Cantidad"
                            value={detalle.cantidadServicios}
                            onChange={(e) => handleDetalleChange(index, 'cantidadServicios', Number(e.target.value))}
                            fullWidth
                          />
                        </Grid>

                        {/* Costo Unitario */}
                        <Grid item xs={2}>
                          <TextField
                            type="number"
                            label="Costo Unitario"
                            value={detalle.costoUnitarioServ || 0}
                            fullWidth
                            InputProps={{
                              readOnly: true,
                            }}
                          />
                        </Grid>

                        {/* Subtotal (solo lectura) */}
                        <Grid item xs={2}>
                          <TextField
                            type="number"
                            label="Subtotal"
                            value={
                              detalle.subtotal || (detalle.cantidadServicios || 0) * (detalle.costoUnitarioServ || 0)
                            }
                            fullWidth
                            InputProps={{ readOnly: true }}
                          />
                        </Grid>

                        {/* Botón eliminar */}
                        <Grid item xs={1}>
                          <IconButton
                            onClick={() => {
                              const updated = [...formik.values.detalles];
                              updated.splice(index, 1);
                              formik.setFieldValue('detalles', updated);
                              actualizarTotal();
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    ))}

                    {/* Botón Agregar Servicio */}
                    <Button
                      startIcon={<AddIcon />}
                      onClick={() =>
                        formik.setFieldValue('detalles', [
                          ...formik.values.detalles,
                          {
                            servicioId: '',
                            cantidadServicios: 1,
                            costoUnitarioServ: 0,
                            subtotal: 0,
                            idTemp: Date.now(),
                          },
                        ])
                      }
                    >
                      Agregar Servicio
                    </Button>

                    <Typography variant="h6" sx={{ mt: 2 }}>
                      Repuestos
                    </Typography>

                    {formik.values.detallesRepuestos.map((detalle, index) => (
                      <Grid container spacing={2} key={detalle.idTemp} alignItems="center">
                        <Grid item xs={5}>
                          <TextField
                            select
                            label="Repuesto"
                            value={detalle.idRepuesto ?? ''} // ✅ Nunca undefined
                            onChange={(e) => handleRepuestoChange(index, 'idRepuesto', e.target.value)}
                            fullWidth
                          >
                            <MenuItem value="">
                              <em>Seleccione repuesto</em>
                            </MenuItem>
                            {repuestos
                              .filter((r) => r.estado) // <-- solo los activos
                              .slice() // crear copia para no mutar el original
                              .sort((a, b) => a.nombre.localeCompare(b.nombre)) // ordenar alfabéticamente
                              .map((r) => (
                                <MenuItem key={r.idRepuesto} value={r.idRepuesto}>
                                  {r.nombre}
                                </MenuItem>
                              ))}
                          </TextField>
                        </Grid>

                        <Grid item xs={2}>
                          <TextField
                            type="number"
                            label={`Cantidad (Disponible: ${detalle.stockDisponible ?? 0})`}
                            value={detalle.cantidad}
                            onChange={(e) => handleRepuestoChange(index, 'cantidad', Number(e.target.value))}
                            fullWidth
                            inputProps={{ min: 1, max: detalle.stockDisponible ?? 999 }}
                          />
                        </Grid>

                        <Grid item xs={2}>
                          <TextField
                            label="Precio Unitario"
                            value={detalle.precio}
                            InputProps={{ readOnly: true }}
                            fullWidth
                          />
                        </Grid>

                        <Grid item xs={2}>
                          <TextField
                            label="Subtotal"
                            value={detalle.subtotal}
                            InputProps={{ readOnly: true }}
                            fullWidth
                          />
                        </Grid>

                        <Grid item xs={1}>
                          <IconButton
                            onClick={() => {
                              const updated = [...formik.values.detallesRepuestos];
                              updated.splice(index, 1); // usar index, no "detalle"
                              formik.setFieldValue('detallesRepuestos', updated);
                              actualizarTotal();
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    ))}

                    <Button
                      startIcon={<AddIcon />}
                      sx={{ mt: 2 }}
                      onClick={() =>
                        formik.setFieldValue('detallesRepuestos', [
                          ...formik.values.detallesRepuestos,
                          { idRepuesto: '', cantidad: 1, precio: 0, subtotal: 0, idTemp: Date.now() },
                        ])
                      }
                    >
                      Agregar Repuesto
                    </Button>

                    <TextField
                      fullWidth
                      label="Fecha"
                      name="fecha"
                      type="text"
                      value={formik.values.fecha} // ahora en DD/MM/YYYY
                      InputProps={{ readOnly: true }}
                      disabled
                    />

                    <TextField
                      fullWidth
                      label="Descuento (Bs.)"
                      name="descuento"
                      type="number"
                      value={formik.values.descuento || 0}
                      onChange={(e) => formik.setFieldValue('descuento', Number(e.target.value) || 0)}
                      InputProps={{
                        inputProps: { min: 0 },
                        startAdornment: <InputAdornment position="start">Bs.</InputAdornment>, // opcional, para mostrar Bs.
                      }}
                    />

                    <Typography variant="h6" sx={{ mt: 2 }}>
                      Total: Bs. {Number(formik.values.total || 0).toFixed(2)}
                    </Typography>

                    <DialogActions sx={{ justifyContent: 'flex-end' }}>
                      <Button
                        onClick={() => {
                          formik.resetForm(); // Resetea todos los valores a los iniciales
                          setOpen(false); // Cierra el modal
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={!(formik.isValid && formik.dirty) || formik.isSubmitting} // 🔹 deshabilitado mientras se envía
                      >
                        Guardar
                      </Button>
                    </DialogActions>
                  </Stack>
                </Box>
              </FormikProvider>
            </DialogContent>
          </div>
        </Dialog>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nº</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Vehículo</TableCell>
                <TableCell>Empleado</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...dataFiltrada]
                .sort((a, b) => {
                  const fechaA = new Date(a.fecha);
                  const fechaB = new Date(b.fecha);
                  return ordenFecha === 'asc' ? fechaA - fechaB : fechaB - fechaA;
                })
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item, index) => {
                  const repuestosEnFila =
                    item.detallesRepuestos?.map((r) => {
                      const repuestoCompleto = repuestos.find((rep) => rep.idRepuesto === r.repuesto?.idRepuesto);
                      const nombre = repuestoCompleto ? repuestoCompleto.nombre : 'Desconocido';
                      return { ...r, nombre };
                    }) || [];

                  return (
                    <TableRow key={item.idServiciosRealizados ?? `${item.fecha}-${item.vehiculo?.placa}-${index}`}>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>{formatFechaDDMMYYYY(item.fecha)}</TableCell>
                      <TableCell>{item.vehiculo?.placa}</TableCell>
                      <TableCell>{`${item.empleado?.nombre} ${item.empleado?.apellido}`}</TableCell>
                      <TableCell>
                        {[
                          ...(item.detallesServicios?.map(
                            (d) => `Servicio: ${d.servicio?.tipoServicio || 'Servicio sin nombre'}`
                          ) || []),
                          ...(repuestosEnFila?.map((r) => `Repuesto: ${r.nombre} x${r.cantidad}`) || []),
                        ].join(', ')}
                      </TableCell>
                      <TableCell>{item.total} Bs</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Ver factura">
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => {
                              setItemSeleccionado(item);
                              setFacturaOpen(true);
                            }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={dataFiltrada.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </TableContainer>
      </Container>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Dialog open={facturaOpen} onClose={() => setFacturaOpen(false)} maxWidth="md" fullWidth>
        <DialogContent>
          {itemSeleccionado && (
            <FacturaBoliviaPDF item={itemSeleccionado} numeroFactura={itemSeleccionado.idServiciosRealizados} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
