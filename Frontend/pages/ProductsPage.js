import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useContext } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
// MUI
import {
  Container,
  Typography,
  Stack,
  Box,
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
  Snackbar,
  Alert,
  Autocomplete,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';

import { getServicios, agregarServicio, eliminarServicio, verificarDescripcion } from '../service/serviciosservice';
import ModificarRep from './modifirep';
import { UserContext } from './UserContext';
import escudo from '../escudo.png';

// ----------------------------------------------------------------------
const TABLE_HEAD = [
  { id: 'numero', label: 'N°', alignRight: false },
  { id: 'tipoServicio', label: 'Descripción', alignRight: false },
  { id: 'costo', label: 'Costo', alignRight: false },
];

export default function UserPage() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [filtro, setFiltro] = useState('');
  const { usuario } = useContext(UserContext);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // volver a la primera página al cambiar filas
  };

  // Roles permitidos para ver acciones
  const rolesConAcceso = ['ADMINISTRADOR', 'SECRETARIA'];
  const mostrarAcciones = rolesConAcceso.includes(usuario?.rolActivo);

  // Estado para el diálogo de confirmación
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [servicioAEliminar, setServicioAEliminar] = useState(null);

  // Filtrado en tiempo real
  const serviciosFiltrados = data.filter(
    (serv) => serv.tipoServicio.toLowerCase().includes(filtro.toLowerCase()) || serv.costo.toString().includes(filtro)
  );

  // Estado para Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  // ------------------------------------------
  // Actualizar lista de servicios desde backend
  const actualizarServicios = async () => {
    try {
      const response = await getServicios();
      setData(response);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    actualizarServicios();
  }, []);

  // ------------------------------------------
  // Formik para agregar servicio
  const formik = useFormik({
    initialValues: { tipoServicio: '', costo: '', submit: null },
    validationSchema: Yup.object({
      tipoServicio: Yup.string().required('Campo requerido.'),
      costo: Yup.string().required('Campo requerido.'),
    }),
    onSubmit: async (values, helpers) => {
      try {
        const existe = await verificarDescripcion(values.tipoServicio.toUpperCase());
        if (existe) {
          helpers.setFieldError('tipoServicio', 'Esta descripción ya está registrada');
          helpers.setSubmitting(false);
          return;
        }

        const nuevoServicio = {
          tipoServicio: values.tipoServicio.toUpperCase(),
          costo: values.costo,
        };
        await agregarServicio(nuevoServicio);
        await actualizarServicios();
        handleClose();
        setSnackbar({ open: true, message: 'Se registró el servicio correctamente', severity: 'success' });
      } catch (err) {
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: err.message });
        helpers.setSubmitting(false);
      }
    },
  });

  const handleClickOpen = () => {
    formik.resetForm();
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

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

  // ----------------------------------------------------------------------
  return (
    <>
      <Helmet>
        <title>Servicios</title>
      </Helmet>

      <Container>
        <Typography variant="h4" sx={{ mb: 5 }}>
          Servicios
        </Typography>

        <Stack direction="row" justifyContent="flex-start" sx={{ mb: 3 }}>
          {mostrarAcciones && (
            <Button variant="contained" onClick={handleClickOpen}>
              Nuevo Servicio
            </Button>
          )}
        </Stack>

        <Autocomplete
          freeSolo
          disableClearable
          options={[]} // dejamos vacío porque filtramos en tiempo real
          inputValue={filtro}
          onInputChange={(e, newValue) => setFiltro(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Buscar..."
              placeholder="Descripción o Costo"
              variant="outlined"
              size="small"
              fullWidth
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

        {/* Dialog para agregar servicio */}
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
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
                Agregar Servicio
              </span>
            </DialogTitle>
            <DialogContent>
              <form noValidate onSubmit={formik.handleSubmit}>
                <Stack spacing={3} sx={{ mt: 1 }}>
                  <TextField
                    fullWidth
                    label="Descripción"
                    name="tipoServicio"
                    value={formik.values.tipoServicio}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={!!(formik.touched.tipoServicio && formik.errors.tipoServicio)}
                    helperText={formik.touched.tipoServicio && formik.errors.tipoServicio}
                    onKeyPress={(e) => {
                      if (/\d/.test(e.key)) e.preventDefault(); // bloquea números
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Costo"
                    name="costo"
                    value={formik.values.costo}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={!!(formik.touched.costo && formik.errors.costo)}
                    helperText={formik.touched.costo && formik.errors.costo}
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) e.preventDefault(); // solo números
                    }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">Bs</InputAdornment>,
                    }}
                  />
                  {formik.errors.submit && (
                    <Typography color="error" variant="body2">
                      {formik.errors.submit}
                    </Typography>
                  )}
                </Stack>
                <DialogActions sx={{ mt: 2, justifyContent: 'flex-end' }}>
                  <Button onClick={handleClose}>Cancelar</Button>
                  <Button type="submit" variant="contained" disabled={!(formik.isValid && formik.dirty)}>
                    Guardar
                  </Button>
                </DialogActions>
              </form>
            </DialogContent>
          </div>
        </Dialog>

        {/* Dialog de confirmación */}
        <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>Confirmar eliminación</DialogTitle>
          <DialogContent sx={{ textAlign: 'center' }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              ¿Desea eliminar el servicio <strong>{servicioAEliminar?.tipoServicio}</strong>?
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
                await eliminarServicio(servicioAEliminar.idServicio);
                await actualizarServicios();
                setOpenConfirmDialog(false);
                setSnackbar({
                  open: true,
                  message: 'Se eliminó el servicio correctamente',
                  severity: 'success',
                });
              }}
            >
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Tabla de servicios */}
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                {TABLE_HEAD.map((headCell) => (
                  <TableCell key={headCell.id}>{headCell.label}</TableCell>
                ))}

                {/* Solo mostrar columna Acciones si tiene permiso */}
                {mostrarAcciones && <TableCell align="center">Acciones</TableCell>}
              </TableRow>
            </TableHead>

            <TableBody>
              {[...serviciosFiltrados]
                .sort((a, b) => a.tipoServicio.localeCompare(b.tipoServicio))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) // 🔹 solo filas de la página actual
                .map((reparacion, index) => (
                  <TableRow key={reparacion.idServicio}>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{reparacion.tipoServicio}</TableCell>
                    <TableCell>{reparacion.costo} Bs.</TableCell>

                    {mostrarAcciones && (
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                          <ModificarRep
                            reparacion={reparacion}
                            actualizarServicios={actualizarServicios}
                            setSnackbar={setSnackbar}
                          >
                            <IconButton aria-label="Modificar" size="small" title="Modificar" sx={{ p: 0 }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </ModificarRep>

                          <IconButton
                            color="error"
                            size="small"
                            aria-label="Eliminar"
                            title="Eliminar"
                            onClick={() => {
                              setServicioAEliminar(reparacion);
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
          <TablePagination
            component="div"
            count={serviciosFiltrados.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Filas por página"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
          />
        </TableContainer>
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
