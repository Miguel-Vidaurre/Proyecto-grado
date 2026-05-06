import { useEffect, useState, useContext } from 'react';
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
  MenuItem,
  Autocomplete,
  InputAdornment,
  Snackbar,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { Helmet } from 'react-helmet-async';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  getListaRepuestos,
  crearRepuesto,
  actualizarRepuesto,
  eliminarRepuestoPorId,
} from '../service/repuestoservice';
import { getMarcas } from '../service/marcaservice';
import { UserContext } from './UserContext';
import escudo from '../escudo.png';

export default function RepuestoPage() {
  const [repuestos, setRepuestos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [open, setOpen] = useState(false);
  const [filtro, setFiltro] = useState('');

  const [openDelete, setOpenDelete] = useState(false);
  const [repuestoAEliminar, setRepuestoAEliminar] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDelete = (rep) => {
    setRepuestoAEliminar(rep);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setRepuestoAEliminar(null);
    setOpenDelete(false);
  };

  const handleConfirmDelete = async () => {
    if (repuestoAEliminar?.idRepuesto) {
      await eliminarRepuestoPorId(repuestoAEliminar.idRepuesto);
      showMessage('Se eliminó el repuesto correctamente');
      fetchRepuestos();
    }
    handleCloseDelete();
  };

  // dentro de tu componente
  const { usuario } = useContext(UserContext);

  // Roles que pueden ver acciones
  const rolesConAcceso = ['ADMINISTRADOR', 'SECRETARIA'];
  const mostrarAcciones = rolesConAcceso.includes(usuario?.rolActivo);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success', // puede ser 'success', 'error', 'warning', 'info'
  });

  const showMessage = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const repuestosFiltrados = repuestos.filter(
    (rep) =>
      rep.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      rep.marca?.nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  const repuestosPaginados = repuestosFiltrados
    .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''))
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const formik = useFormik({
    enableReinitialize: true, // <-- importante
    initialValues: {
      idRepuesto: '',
      nombre: '',
      descripcion: '',
      precio: '',
      cantidad: '',
      estado: true,
      marca: { id: '' },
    },
    validationSchema: Yup.object({
      nombre: Yup.string().required('Campo requerido'),
      descripcion: Yup.string().required('Campo requerido'),
      precio: Yup.number().required('Campo requerido').min(0),
      cantidad: Yup.number().required('Campo requerido').min(0),
      marca: Yup.object().shape({
        id: Yup.string().required('Seleccione una marca'),
      }),
    }),
    onSubmit: async (values, { resetForm }) => {
      console.log('Valores del formik:', values);
      const dataToSend = {
        nombre: values.nombre,
        descripcion: values.descripcion,
        precio: values.precio,
        cantidad: values.cantidad,
        estado: values.estado,
        marca: { id: values.marca.id },
      };

      if (values.idRepuesto) {
        console.log('ACTUALIZANDO...', values.idRepuesto);
        await actualizarRepuesto({
          ...dataToSend,
          idRepuesto: values.idRepuesto,
        });
        showMessage('Se actualizó el registro del repuesto correctamente');
      } else {
        console.log('CREANDO NUEVO...');
        await crearRepuesto(dataToSend);
        showMessage('Se registró el repuesto correctamente');
      }

      fetchRepuestos();
      handleClose();
      resetForm();
    },
  });

  const fetchRepuestos = async () => {
    const data = await getListaRepuestos();
    console.log('Repuestos crudos desde backend:', data);

    const processed = data.map((rep) => ({
      ...rep,
      idRepuesto: rep.idRepuesto ?? rep.id, // si backend devuelve 'id' o 'idRepuesto'
      estado: rep.estado === 'ACTIVO' || rep.estado === true || rep.estado === 'true',
      marca: rep.marca
        ? { id: rep.marca.idMarca.toString(), nombre: rep.marca.nombre } // <-- aquí mapeas idMarca a id
        : { id: '', nombre: '' },
    }));

    console.log('Repuestos procesados con estado:', processed);
    setRepuestos(processed);
  };

  const fetchMarcas = async () => {
    const data = await getMarcas();
    console.log('Marcas crudas desde backend:', data);

    const processed = data
      .map((marca) => ({
        id: marca.id?.toString() ?? marca.idMarca?.toString(),
        nombre: marca.nombre,
        estado: marca.estado?.toLowerCase() === 'activo', // <-- true si es 'Activo'
      }))
      .filter((marca) => marca.estado); // <-- solo activas

    setMarcas(processed);
  };

  useEffect(() => {
    fetchRepuestos();
    fetchMarcas();
  }, []);

  const handleOpen = (rep = null) => {
    if (rep) {
      // Si la marca del repuesto no está activa, la agregamos temporalmente para que se vea en el select
      const marcaActual = rep.marca
        ? { id: rep.marca.id?.toString(), nombre: rep.marca.nombre }
        : { id: '', nombre: '' };
      if (!marcas.find((m) => m.id === marcaActual.id)) {
        setMarcas((prev) => [...prev, marcaActual]);
      }

      formik.setValues({
        idRepuesto: rep?.idRepuesto ?? null,
        nombre: rep.nombre || '',
        descripcion: rep.descripcion || '',
        precio: rep.precio || '',
        cantidad: rep.cantidad || '',
        estado: rep.estado === 'ACTIVO' || rep.estado === true || rep.estado === 'true',
        marca: marcaActual,
      });
    } else {
      formik.resetForm();
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    formik.resetForm();
  };

  const handleDelete = async (id) => {
    await eliminarRepuestoPorId(id);
    showMessage('Se eliminó el repuesto correctamente');
    fetchRepuestos();
  };

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
        <title>Repuesto</title>
      </Helmet>

      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 2,
          backgroundColor: 'rgba(255, 235, 59, 0.8)', // amarillo suave
          color: '#000',
          textAlign: 'center',
          padding: '6px 0',
          fontWeight: 'bold',
          borderBottom: '2px solid #fbc02d',
          backdropFilter: 'blur(2px)',
        }}
      >
        ⚠️ Zona administrativa: Los cambios en repuestos afectan directamente el inventario del sistema.
      </div>

      <Typography variant="h4" gutterBottom>
        Repuestos
      </Typography>

      {mostrarAcciones && (
        <Button variant="contained" onClick={() => handleOpen()}>
          Nuevo Repuesto
        </Button>
      )}

      <Autocomplete
        freeSolo
        disableClearable
        options={[]} // no usamos opciones porque filtramos manualmente
        inputValue={filtro}
        onInputChange={(e, newInputValue) => setFiltro(newInputValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Buscar..."
            placeholder="Nombre o Marca"
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
            <TableCell>Marca</TableCell>
            <TableCell>Categoría</TableCell>
            <TableCell>Descripción</TableCell>
            <TableCell>Precio</TableCell>
            <TableCell>Cantidad</TableCell>
            <TableCell>Estado</TableCell>
            {mostrarAcciones && <TableCell>Acciones</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {repuestosPaginados.map((rep, index) => (
            <TableRow key={rep.idRepuesto || `temp-${index}`}>
              <TableCell>{page * rowsPerPage + index + 1}</TableCell>
              <TableCell>{rep.nombre}</TableCell>
              <TableCell>{rep.marca?.nombre}</TableCell>
              <TableCell>{rep.categoria || '—'}</TableCell>
              <TableCell>{rep.descripcion}</TableCell>
              <TableCell>{rep.precio} Bs</TableCell>
              <TableCell>
                {rep.cantidad} {rep.cantidad === 1 ? 'und.' : 'unds.'}
              </TableCell>
              <TableCell>{rep.estado ? 'Activo' : 'Inactivo'}</TableCell>
              {mostrarAcciones && (
                <TableCell sx={{ width: '150px' }}>
                  <IconButton color="primary" onClick={() => handleOpen(rep)} disabled={!rep.estado}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleOpenDelete(rep)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={repuestosFiltrados.length}
        rowsPerPage={rowsPerPage}
        page={page}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
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
              {formik.values.idRepuesto ? 'Modificar Repuesto' : 'Agregar Repuesto'}
            </span>
          </DialogTitle>
          <form onSubmit={formik.handleSubmit}>
            <DialogContent>
              <TextField
                fullWidth
                margin="dense"
                label="Nombre"
                name="nombre"
                value={formik.values.nombre}
                onChange={formik.handleChange}
                error={formik.touched.nombre && Boolean(formik.errors.nombre)}
                helperText={formik.touched.nombre && formik.errors.nombre}
                onKeyPress={(e) => {
                  if (/\d/.test(e.key)) e.preventDefault();
                }}
              />
              <TextField
                fullWidth
                margin="dense"
                label="Descripción"
                name="descripcion"
                value={formik.values.descripcion}
                onChange={formik.handleChange}
                error={formik.touched.descripcion && Boolean(formik.errors.descripcion)}
                helperText={formik.touched.descripcion && formik.errors.descripcion}
                onKeyPress={(e) => {
                  if (/\d/.test(e.key)) e.preventDefault();
                }}
              />
              <TextField
                fullWidth
                margin="dense"
                label="Precio"
                type="number"
                name="precio"
                value={formik.values.precio}
                onChange={formik.handleChange}
                error={formik.touched.precio && Boolean(formik.errors.precio)}
                helperText={formik.touched.precio && formik.errors.precio}
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) e.preventDefault();
                }}
              />
              <TextField
                fullWidth
                margin="dense"
                label="Cantidad"
                type="number"
                name="cantidad"
                value={formik.values.cantidad}
                onChange={formik.handleChange}
                error={formik.touched.cantidad && Boolean(formik.errors.cantidad)}
                helperText={formik.touched.cantidad && formik.errors.cantidad}
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) e.preventDefault();
                }}
              />
              <TextField
                fullWidth
                select
                margin="dense"
                label="Marca"
                name="marca.id"
                value={formik.values.marca.id}
                onChange={(e) => formik.setFieldValue('marca.id', e.target.value)}
                error={formik.touched.marca?.id && Boolean(formik.errors.marca?.id)}
                helperText={formik.touched.marca?.id && formik.errors.marca?.id}
              >
                {marcas.map((marca) => (
                  <MenuItem key={marca.id} value={marca.id.toString()}>
                    {marca.nombre}
                  </MenuItem>
                ))}
              </TextField>
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
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancelar</Button>
              <Button type="submit" variant="contained" disabled={!(formik.isValid && formik.dirty)}>
                {formik.values.idRepuesto ? 'Guardar Cambios' : 'Guardar'}
              </Button>
            </DialogActions>
          </form>
        </div>
      </Dialog>

      <Dialog open={openDelete} onClose={handleCloseDelete} maxWidth="xs" fullWidth>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Desea eliminar el repuesto <strong>{repuestoAEliminar?.nombre}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000} // 3 segundos
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
    </div>
  );
}
