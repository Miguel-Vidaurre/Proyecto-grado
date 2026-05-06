import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  TablePagination,
  TextField,
  Switch,
  FormControlLabel,
  InputAdornment,
  Autocomplete,
  Snackbar,
  Alert,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { getProveedor, agregarProveedor, modificarProveedor, eliminarProveedor } from '../service/proveedorservice';
import escudo from '../escudo.png';

const TABLE_HEAD = [
  { id: 'Nº', label: 'Nº', alignRight: false },
  { id: 'nombre', label: 'Nombre', alignRight: false },
  { id: 'telefono', label: 'Teléfono', alignRight: false },
  { id: 'email', label: 'Email', alignRight: false },
  { id: 'estado', label: 'Estado', alignRight: false },
  { id: 'direccion', label: 'Dirección', alignRight: false },
  { id: 'acciones', label: 'Acciones', alignRight: false },
];

export default function UserPage() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [openDelete, setOpenDelete] = useState(false);
  const [proveedorAEliminar, setProveedorAEliminar] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Volver a la primera página
  };

  const handleOpenDelete = (prov) => {
    setProveedorAEliminar(prov);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setProveedorAEliminar(null);
    setOpenDelete(false);
  };

  const handleConfirmDelete = async () => {
    if (proveedorAEliminar?.idProveedor) {
      try {
        await eliminarProveedor(proveedorAEliminar.idProveedor);
        showMessage('Proveedor eliminado', 'success');
        const nuevos = await getProveedor();
        setData(nuevos);
      } catch (error) {
        showMessage('Ocurrió un error al eliminar', 'error');
      }
    }
    handleCloseDelete();
  };

  const showMessage = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const formik = useFormik({
    initialValues: {
      nombre: '',
      telefono: '',
      email: '',
      estado: true,
      direccion: '',
    },
    validationSchema: Yup.object({
      nombre: Yup.string().required('Campo requerido'),
      telefono: Yup.number().required('Campo requerido'),
      email: Yup.string()
        .email('Correo inválido')
        .matches(/^[\w.%+-]+@[\w.-]+\.com$/, 'Debe contener @ y terminar en .com')
        .required('Campo requerido.'),
      direccion: Yup.string().required('Campo requerido'),
    }),
    onSubmit: async (valores, helpers) => {
      try {
        const dataToSend = {
          ...valores,
          nombre: valores.nombre.toUpperCase(),
          direccion: valores.direccion.toUpperCase(),
        };

        if (valores.idProveedor) {
          await modificarProveedor(dataToSend);
          showMessage('Se actualizó el registro del proveedor correctamente', 'success');
        } else {
          await agregarProveedor(dataToSend);
          showMessage('Se registró el proveedor correctamente', 'success');
        }

        const nuevos = await getProveedor();
        setData(nuevos);
        setOpen(false);
        formik.resetForm();
      } catch (error) {
        helpers.setErrors({ submit: error.message });
        showMessage(error.message, 'error');
      }
    },
  });

  const handleEdit = (prov) => {
    formik.setValues({
      nombre: prov.nombre,
      telefono: prov.telefono,
      email: prov.email,
      direccion: prov.direccion,
      estado: prov.estado,
      idProveedor: prov.idProveedor,
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    await eliminarProveedor(id);
    const nuevos = await getProveedor();
    setData(nuevos);
    showMessage('Proveedor eliminado', 'success');
  };

  useEffect(() => {
    const fetchProveedores = async () => {
      const lista = await getProveedor();
      setData(lista);

      console.log('Proveedores obtenidos del backend:', lista);
    };
    fetchProveedores();
  }, []);

  const proveedoresFiltrados = data.filter((prov) => prov.nombre.toLowerCase().includes(filtro.toLowerCase()));

  const proveedoresMostrados = proveedoresFiltrados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
        <title> Proveedores </title>
      </Helmet>

      <Container>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Proveedores
        </Typography>

        <Stack direction="column" spacing={2} sx={{ mb: 2, alignItems: 'flex-start' }}>
          <Button
            variant="contained"
            onClick={() => {
              formik.resetForm();
              setOpen(true);
            }}
          >
            Nuevo Proveedor
          </Button>
        </Stack>

        <Autocomplete
          freeSolo
          options={[]}
          inputValue={filtro}
          onInputChange={(e, newValue) => setFiltro(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Buscar por nombre"
              size="small"
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

        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
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
                {formik.values.idProveedor ? 'Editar Proveedor' : 'Agregar Proveedor'}
              </span>
            </DialogTitle>
            <DialogContent>
              <form noValidate onSubmit={formik.handleSubmit}>
                <Stack spacing={2} mt={1}>
                  <TextField
                    label="Nombre"
                    name="nombre"
                    value={formik.values.nombre}
                    onChange={formik.handleChange}
                    error={formik.touched.nombre && Boolean(formik.errors.nombre)}
                    helperText={formik.touched.nombre && formik.errors.nombre}
                    fullWidth
                    onKeyPress={(e) => {
                      if (/\d/.test(e.key)) e.preventDefault();
                    }}
                  />
                  <TextField
                    label="Teléfono"
                    name="telefono"
                    value={formik.values.telefono}
                    onChange={formik.handleChange}
                    error={formik.touched.telefono && Boolean(formik.errors.telefono)}
                    helperText={formik.touched.telefono && formik.errors.telefono}
                    fullWidth
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) e.preventDefault();
                    }}
                  />
                  <TextField
                    label="Email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                    fullWidth
                  />
                  <TextField
                    label="Dirección"
                    name="direccion"
                    value={formik.values.direccion}
                    onChange={formik.handleChange}
                    error={formik.touched.direccion && Boolean(formik.errors.direccion)}
                    helperText={formik.touched.direccion && formik.errors.direccion}
                    fullWidth
                    onKeyPress={(e) => {
                      if (/\d/.test(e.key)) e.preventDefault();
                    }}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        name="estado"
                        checked={formik.values.estado}
                        onChange={(e) => formik.setFieldValue('estado', e.target.checked)}
                      />
                    }
                    label={formik.values.estado ? 'Activo' : 'Inactivo'}
                  />
                </Stack>
              </form>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'flex-end', pb: 2 }}>
              <Button variant="outlined" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button variant="contained" onClick={formik.handleSubmit} disabled={!(formik.dirty && formik.isValid)}>
                Guardar
              </Button>
            </DialogActions>
          </div>
        </Dialog>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {TABLE_HEAD.map((headCell) => (
                  <TableCell key={headCell.id}>{headCell.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[...proveedoresMostrados]
                .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''))
                .map((prov, index) => (
                  <TableRow key={prov.idProveedor}>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{prov.nombre}</TableCell>
                    <TableCell>{prov.telefono}</TableCell>
                    <TableCell>{prov.email}</TableCell>
                    <TableCell>{prov.estado ? 'Activo' : 'Inactivo'}</TableCell>
                    <TableCell>{prov.direccion}</TableCell>
                    <TableCell sx={{ width: '150px' }}>
                      <IconButton color="primary" onClick={() => handleEdit(prov)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleOpenDelete(prov)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={proveedoresFiltrados.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        <Dialog open={openDelete} onClose={handleCloseDelete} maxWidth="xs" fullWidth>
          <DialogTitle>Confirmar Eliminación</DialogTitle>
          <DialogContent>
            <Typography>
              ¿Desea eliminar el proveedor <strong>{proveedorAEliminar?.nombre}</strong>?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDelete}>Cancelar</Button>
            <Button color="error" variant="contained" onClick={handleConfirmDelete}>
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
