import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
  IconButton,
  Autocomplete,
  InputAdornment,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Helmet } from 'react-helmet-async';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { getMarcas, agregarMarca, modificarMarca, eliminarMarca } from '../service/marcaservice';
import escudo from '../escudo.png';

export default function MarcaPage() {
  const [marcas, setMarcas] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [filtro, setFiltro] = useState('');

  const [openDelete, setOpenDelete] = useState(false);
  const [marcaAEliminar, setMarcaAEliminar] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Resetear a la primera página
  };

  const handleOpenDelete = (marca) => {
    setMarcaAEliminar(marca);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setMarcaAEliminar(null);
    setOpenDelete(false);
  };

  const handleConfirmDelete = async () => {
    if (marcaAEliminar?.id) {
      try {
        await eliminarMarca(marcaAEliminar.id);
        showMessage('Se eliminó la marca correctamente');
        fetchMarcas();
      } catch (error) {
        showMessage('Ocurrió un error al eliminar', 'error');
      }
    }
    handleCloseDelete();
  };

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const showMessage = (message, severity = 'success') => setSnackbar({ open: true, message, severity });
  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const formik = useFormik({
    initialValues: { id: '', nombre: '', estado: true },
    validationSchema: Yup.object({ nombre: Yup.string().required('Campo requerido') }),
    onSubmit: async (values, { resetForm }) => {
      const dataToSend = {
        ...values,
        nombre: values.nombre.toUpperCase(),
        estado: values.estado ? 'Activo' : 'Inactivo',
      };
      try {
        if (editMode) {
          await modificarMarca(dataToSend);
          showMessage('Se actualizó el registro de la marca correctamente');
        } else {
          await agregarMarca(dataToSend);
          showMessage('Se guardó la marca correctamente');
        }
        fetchMarcas();
        handleClose();
        resetForm();
      } catch (error) {
        showMessage('Ocurrió un error', 'error');
      }
    },
  });

  const fetchMarcas = async () => {
    const data = await getMarcas();
    const dataWithBooleanEstado = data.map((marca) => ({
      ...marca,
      estado: marca.estado === 'Activo',
    }));
    setMarcas(dataWithBooleanEstado);
  };

  useEffect(() => {
    fetchMarcas();
  }, []);

  const handleOpen = (marca = null) => {
    if (marca) {
      setEditMode(true);
      formik.setValues(marca);
    } else {
      setEditMode(false);
      formik.resetForm();
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    formik.resetForm();
  };

  const handleDelete = async (id) => {
    try {
      await eliminarMarca(id);
      showMessage('Se eliminó la marca correctamente');
      fetchMarcas();
    } catch (error) {
      showMessage('Ocurrió un error al eliminar', 'error');
    }
  };

  // Filtrar marcas según el nombre
  const marcasFiltradas = marcas.filter((marca) => marca.nombre.toLowerCase().includes(filtro.toLowerCase()));

  const marcasMostradas = marcasFiltradas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
    <div>
      <Helmet>
        <title>Marca</title>
      </Helmet>

      <Typography variant="h4" gutterBottom>
        Marca
      </Typography>

      <Button variant="contained" onClick={() => handleOpen()}>
        Nueva Marca
      </Button>

      {/* Autocomplete para filtrar marcas por nombre */}
      <Autocomplete
        freeSolo
        disableClearable
        options={[]} // filtramos manualmente
        inputValue={filtro}
        onInputChange={(e, newValue) => setFiltro(newValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Buscar Marca..."
            placeholder="Nombre de la marca"
            variant="outlined"
            size="small"
            fullWidth
            sx={{ mt: 2, mb: 2 }}
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

      <Table sx={{ mt: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell>Nº</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {marcasMostradas
            .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''))
            .map((marca, index) => (
              <TableRow key={marca.id}>
                <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                <TableCell>{marca.nombre}</TableCell>
                <TableCell>{marca.estado ? 'Activo' : 'Inactivo'}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleOpen(marca)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleOpenDelete(marca)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={marcasFiltradas.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      />

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
              {editMode ? 'Editar Marca' : 'Agregar Marca'}
            </span>
          </DialogTitle>

          <form onSubmit={formik.handleSubmit}>
            <DialogContent sx={{ position: 'relative', zIndex: 1 }}>
              <TextField
                fullWidth
                margin="dense"
                label="Nombre"
                name="nombre"
                value={formik.values.nombre}
                onChange={(e) => formik.setFieldValue('nombre', e.target.value.toUpperCase())}
                error={formik.touched.nombre && Boolean(formik.errors.nombre)}
                helperText={formik.touched.nombre && formik.errors.nombre}
                onKeyPress={(e) => {
                  if (/\d/.test(e.key)) e.preventDefault();
                }}
              />

              <FormControlLabel
                control={
                  <Switch
                    name="estado"
                    checked={formik.values.estado}
                    onChange={(e) => {
                      formik.setFieldValue('estado', e.target.checked, true);
                      formik.setFieldTouched('estado', true, true);
                    }}
                  />
                }
                label={formik.values.estado ? 'Activo' : 'Inactivo'}
              />
            </DialogContent>

            <DialogActions sx={{ position: 'relative', zIndex: 1 }}>
              <Button onClick={handleClose}>Cancelar</Button>
              <Button type="submit" variant="contained" disabled={!formik.isValid || !formik.dirty}>
                {editMode ? 'Guardar Cambios' : 'Guardar'}
              </Button>
            </DialogActions>
          </form>
        </div>
      </Dialog>

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

      <Dialog open={openDelete} onClose={handleCloseDelete} maxWidth="xs" fullWidth>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Desea eliminar la marca <strong>{marcaAEliminar?.nombre}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
