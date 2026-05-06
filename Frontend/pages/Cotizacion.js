import { Helmet } from 'react-helmet-async';
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  Stack,
  IconButton,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';

import { agregarCotizacion, getlistacot } from '../service/cotizacionservice';
import { getlistacli } from '../service/clienteservice';
import { getServicios } from '../service/serviciosservice';
import { UserContext } from './UserContext';
import { generarPDFCotizacion } from './generarPDFCotizacion';
import escudo from '../escudo.png';

export default function CotizacionesModal() {
  const [open, setOpen] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [cotizaciones, setCotizaciones] = useState([]);
  const { usuario, actualizarUsuario } = useContext(UserContext);
  const [cargado, setCargado] = useState(false);

  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [busquedaFecha, setBusquedaFecha] = useState('');

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [mensajeSnackbar, setMensajeSnackbar] = useState('');

  const [pdfUrl, setPdfUrl] = useState(null);
  const [openPreview, setOpenPreview] = useState(false);

  const [rolActivo, setRolActivo] = useState(null);
  const rolesConAcceso = ['ADMINISTRADOR', 'SECRETARIA'];
  const mostrarBoton = rolesConAcceso.includes(usuario?.rolActivo);
  const [ordenFecha, setOrdenFecha] = useState('desc');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // volver a la primera página al cambiar filas
  };

  const cotizacionesFiltradas = cotizaciones.filter((cot) => {
    // Filtrar por cliente logueado si es CLIENTE
    if (usuario?.roles?.includes('CLIENTE') && usuario?.cliente) {
      if (cot.cliente?.idCliente !== usuario.cliente.idCliente) return false;
    }

    // Filtro por texto ingresado
    const clienteNombre = `${cot.cliente?.nombre || ''} ${cot.cliente?.apellido || ''}`.toLowerCase();
    const coincideCliente = clienteNombre.includes(busquedaCliente.toLowerCase());

    // Filtro por fecha
    const fechaBackend = cot.fechaCotizacion?.split('T')[0];
    const coincideFecha = busquedaFecha ? fechaBackend === busquedaFecha : true;

    return coincideCliente && coincideFecha;
  });

  // Convierte de yyyy-MM-dd a dd/MM/yyyy para mostrar
  const formatFechaDDMMYYYY = (fecha) => {
    if (!fecha) return '';
    const [year, month, day] = fecha.split('-');
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const storedUser = localStorage.getItem('usuario');
        const usuarioLS = storedUser && storedUser !== 'undefined' ? JSON.parse(storedUser) : null;
        if (usuarioLS) actualizarUsuario(usuarioLS);

        const cli = await getlistacli();
        const serv = await getServicios();
        const cotiz = await getlistacot();

        setClientes(cli);
        setServicios(serv);
        setCotizaciones(cotiz);
        setCargado(true);
      } catch (error) {
        console.error('Error cargando datos:', error);
        actualizarUsuario(null);
      }
    }
    fetchData();
  }, []); // ✅ agregamos dependencia

  const serviciosMap = React.useMemo(() => {
    const map = {};
    servicios.forEach((s) => {
      map[s.idServicio] = s.tipoServicio;
    });
    return map;
  }, [servicios]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      clienteId: '',
      fechaCotizacion: new Date().toISOString().slice(0, 10),
      detalles: [{ servicioId: '', cantidadServicios: 1, costoUnitarioServ: 0, subtotal: 0 }],
    },
    validationSchema: Yup.object().shape({
      clienteId: Yup.string().required('Seleccione un cliente'),
      detalles: Yup.array().of(
        Yup.object().shape({
          servicioId: Yup.string().required('Requerido'),
          cantidadServicios: Yup.number().min(1).required('Requerido'),
          costoUnitarioServ: Yup.number().min(0).required('Requerido'),
        })
      ),
    }),
    onSubmit: async (values, { resetForm }) => {
      if (!usuario || !usuario.empleado || !usuario.empleado.idEmpleado) {
        alert('Empleado no cargado correctamente');
        return;
      }

      const total = values.detalles.reduce((acc, d) => acc + d.subtotal, 0);

      const cotizacion = {
        cliente: { idCliente: values.clienteId },
        empleado: { idEmpleado: usuario.empleado.idEmpleado },
        fechaCotizacion: values.fechaCotizacion,
        totalCotizacion: total,
        detalles: values.detalles.map((d) => ({
          cantidad: d.cantidadServicios,
          precioUnitario: d.costoUnitarioServ,
          subtotal: d.subtotal,
          idServicio: d.servicioId,
        })),
      };

      try {
        await agregarCotizacion(cotizacion);
        setMensajeSnackbar('Se registró la cotización correctamente');
        setOpenSnackbar(true);
        resetForm();
        setOpen(false);
        const cotiz = await getlistacot();
        setCotizaciones(cotiz);
      } catch (error) {
        alert('Error al guardar la cotización');
        console.error(error);
      }
    },
  });

  const handleServicioSeleccionado = (index, servicioId) => {
    const selectedServicio = servicios.find((s) => s.idServicio === servicioId);
    formik.setFieldValue(`detalles[${index}].servicioId`, servicioId);
    formik.setFieldValue(`detalles[${index}].costoUnitarioServ`, selectedServicio ? Number(selectedServicio.costo) : 0);

    const cantidad = formik.values.detalles[index].cantidadServicios;
    const costoUnitario = selectedServicio ? Number(selectedServicio.costo) : 0;
    formik.setFieldValue(`detalles[${index}].subtotal`, cantidad * costoUnitario);
  };

  const handleDetalleChange = (index, field, value) => {
    formik.setFieldValue(`detalles[${index}].${field}`, value);

    const cantidad = field === 'cantidadServicios' ? value : formik.values.detalles[index].cantidadServicios;
    const costo = field === 'costoUnitarioServ' ? value : formik.values.detalles[index].costoUnitarioServ;

    formik.setFieldValue(`detalles[${index}].subtotal`, cantidad * costo);
  };

  const total = formik.values.detalles.reduce((acc, d) => acc + d.subtotal, 0);

  if (!cargado) return <CircularProgress />;

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
        <title> Cotizaciones </title>
      </Helmet>

      {mostrarBoton && (
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Nueva Cotización
        </Button>
      )}

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Lista de Cotizaciones
        </Typography>

        {/* 🔍 Buscadores */}
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField
            label="Buscar por cliente"
            variant="outlined"
            size="small"
            value={busquedaCliente}
            onChange={(e) => setBusquedaCliente(e.target.value)}
            placeholder="Nombre o apellido"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Buscar por fecha"
            type="date"
            size="small"
            value={busquedaFecha}
            onChange={(e) => setBusquedaFecha(e.target.value)}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            inputProps={{
              max: new Date().toISOString().split('T')[0],
            }}
            sx={{ width: 220 }} // 📏 aquí ajustas el ancho (ej. 220px)
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

        {cotizacionesFiltradas.length === 0 ? (
          <Typography>No hay cotizaciones registradas.</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>N°</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Empleado</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Total (Bs.)</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...cotizacionesFiltradas]
                .sort((a, b) => {
                  const fechaA = new Date(a.fechaCotizacion);
                  const fechaB = new Date(b.fechaCotizacion);
                  return ordenFecha === 'asc' ? fechaA - fechaB : fechaB - fechaA;
                })
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) // 🔹 solo filas de la página actual
                .map((cot, index) => (
                  <TableRow key={cot.idCotizacion}>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>
                      {cot.cliente ? `${cot.cliente.nombre} ${cot.cliente.apellido}` : 'Sin cliente'}
                    </TableCell>
                    <TableCell>
                      {cot.empleado ? `${cot.empleado.nombre} ${cot.empleado.apellido}` : 'Sin empleado'}
                    </TableCell>
                    <TableCell>
                      {(cot.detalles || []).map((d) => serviciosMap[d.idServicio] || 'Sin nombre').join(', ')}
                    </TableCell>
                    <TableCell>{formatFechaDDMMYYYY(cot.fechaCotizacion.split('T')[0])}</TableCell>
                    <TableCell>{cot.totalCotizacion.toFixed(2)} Bs</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={async () => {
                          const pdfBlob = await generarPDFCotizacion(cot, serviciosMap, formatFechaDDMMYYYY);
                          const url = URL.createObjectURL(pdfBlob);

                          setPdfUrl(url); // 👈 URL para visor
                          setOpenPreview(true); // 👈 abrir modal
                        }}
                        title="Previsualizar PDF"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
        <TablePagination
          component="div"
          count={cotizacionesFiltradas.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Filas por página"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        />
      </Box>

      {/* Modal con formulario */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <div style={{ position: 'relative' }}>
          <img
            src={escudo}
            alt="fondo"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              opacity: 0.2,
              zIndex: 0,
              pointerEvents: 'none',
            }}
          />

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
              Nueva Cotización
            </span>
          </DialogTitle>
          <DialogContent>
            <FormikProvider value={formik}>
              <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 2 }}>
                <Stack spacing={2}>
                  <TextField
                    select
                    label="Cliente"
                    value={formik.values.clienteId}
                    onChange={(e) => formik.setFieldValue('clienteId', e.target.value)}
                    error={formik.touched.clienteId && Boolean(formik.errors.clienteId)}
                    helperText={formik.touched.clienteId && formik.errors.clienteId}
                    fullWidth
                  >
                    <MenuItem value="">
                      <em>Seleccione cliente</em>
                    </MenuItem>
                    {clientes.map((c) => (
                      <MenuItem key={c.idCliente} value={c.idCliente}>
                        {c.nombre} {c.apellido}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label="Empleado"
                    value={
                      usuario?.empleado
                        ? `${usuario.empleado.nombre} ${usuario.empleado.apellido}`
                        : usuario?.cliente
                        ? 'Acceso como Cliente'
                        : ''
                    }
                    InputProps={{ readOnly: true }}
                    disabled
                    fullWidth
                  />

                  <TextField
                    type="date"
                    label="Fecha"
                    name="fechaCotizacion"
                    value={formik.values.fechaCotizacion}
                    InputProps={{ readOnly: true }}
                    disabled
                    fullWidth
                  />

                  <Typography variant="h6">Servicios</Typography>
                  {formik.values.detalles.map((detalle, index) => (
                    <Grid container spacing={2} key={index} alignItems="center">
                      <Grid item xs={3}>
                        <TextField
                          select
                          label="Servicio"
                          value={detalle.servicioId}
                          onChange={(e) => handleServicioSeleccionado(index, e.target.value)}
                          fullWidth
                        >
                          <MenuItem value="">
                            <em>Seleccione servicio</em>
                          </MenuItem>
                          {[...servicios]
                            .sort((a, b) => (a.tipoServicio || '').localeCompare(b.tipoServicio || ''))
                            .map((serv) => (
                              <MenuItem key={serv.idServicio} value={serv.idServicio}>
                                {serv.tipoServicio}
                              </MenuItem>
                            ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={2}>
                        <TextField
                          type="number"
                          label="Cantidad"
                          value={detalle.cantidadServicios}
                          onChange={(e) => handleDetalleChange(index, 'cantidadServicios', Number(e.target.value))}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <TextField
                          type="number"
                          label="Costo Unitario"
                          value={detalle.costoUnitarioServ}
                          onChange={(e) => handleDetalleChange(index, 'costoUnitarioServ', Number(e.target.value))}
                          fullWidth
                          InputProps={{
                            endAdornment: <InputAdornment position="end">Bs</InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <TextField
                          label="Subtotal"
                          value={detalle.subtotal}
                          InputProps={{
                            readOnly: true,
                            endAdornment: <InputAdornment position="end">Bs</InputAdornment>,
                          }}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={1}>
                        <IconButton
                          onClick={() => {
                            const updated = [...formik.values.detalles];
                            updated.splice(index, 1);
                            formik.setFieldValue('detalles', updated);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  ))}

                  <Button
                    startIcon={<AddIcon />}
                    onClick={() =>
                      formik.setFieldValue('detalles', [
                        ...formik.values.detalles,
                        { servicioId: '', cantidadServicios: 1, costoUnitarioServ: 0, subtotal: 0 },
                      ])
                    }
                  >
                    Agregar Servicio
                  </Button>

                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Total: Bs. {total.toFixed(2)}
                  </Typography>

                  <DialogActions>
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
                      disabled={!formik.values.clienteId || !formik.values.detalles.some((d) => d.servicioId)}
                    >
                      Guardar Cotización
                    </Button>
                  </DialogActions>
                </Stack>
              </Box>
            </FormikProvider>
          </DialogContent>
        </div>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
          {mensajeSnackbar}
        </Alert>
      </Snackbar>

      {/* Modal de vista previa PDF */}
      <Dialog open={openPreview} onClose={() => setOpenPreview(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Vista previa de Cotización</DialogTitle>
        <DialogContent dividers>
          {pdfUrl && (
            <iframe src={pdfUrl} title="Vista previa PDF" width="100%" height="700px" style={{ border: 'none' }} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreview(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
