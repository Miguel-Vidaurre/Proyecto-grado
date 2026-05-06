import { useState, React } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import {
  Stack,
  Button,
  Typography,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import esLocale from 'date-fns/locale/es'; // para español, opcional
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import { modificarPersonal, verificarCarnet } from '../service/personalservice';
import escudo from '../escudo.png';

export default function ModificarPer({ personal, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleClickOpen = () => {
    formik.handleReset();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const formik = useFormik({
    initialValues: {
      nombre: personal.nombre,
      apellido: personal.apellido,
      carnet: personal.carnet,
      direccion: personal.direccion,
      telefono: personal.telefono,
      horaEntrada1: personal.horaEntrada1 ? personal.horaEntrada1.slice(0, 5) : '',
      horaSalida1: personal.horaSalida1 ? personal.horaSalida1.slice(0, 5) : '',
      horaEntrada2: personal.horaEntrada2 ? personal.horaEntrada2.slice(0, 5) : '',
      horaSalida2: personal.horaSalida2 ? personal.horaSalida2.slice(0, 5) : '',
      submit: null,
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      nombre: Yup.string().min(3).max(50).required('Campo requerido.'),
      apellido: Yup.string().max(50).required('Campo requerido.'),
      carnet: Yup.string().min(3).max(10).required('Campo requerido.'),
      direccion: Yup.string().max(50).required('Campo requerido.'),
      telefono: Yup.string().required('Campo requerido.'),
      horaEntrada1: Yup.string()
        .required('Hora de entrada (mañana) requerida')
        .matches(/^(0[6-9]|1[0-2]):[0-5][0-9]$/, 'Solo horario de mañana (06:00-12:00)'),
      horaSalida1: Yup.string()
        .required('Hora de salida (mañana) requerida')
        .matches(/^([05-9]|1[0-2]):[0-5][0-9]$/, 'Solo horario de mañana (06:00-12:50)'),
      horaEntrada2: Yup.string()
        .required('Hora de entrada (tarde) requerida')
        .matches(/^([1][3-9]|2[0]):[0-5][0-9]$/, 'Solo horario de tarde (13:00-20:00)'),
      horaSalida2: Yup.string()
        .required('Hora de salida (tarde) requerida')
        .matches(/^([1][3-9]|2[0]):[0-5][0-9]$/, 'Solo horario de tarde (13:00-20:00)'),
    }),
    validateOnMount: true,
    onSubmit: async (valores, helpers) => {
      try {
        // Paso 1: verificar carnet solo si se ha cambiado
        if (valores.carnet !== personal.carnet) {
          const existe = await verificarCarnet(valores.carnet);
          if (existe) {
            helpers.setFieldError('carnet', 'Este carnet ya está registrado');
            helpers.setSubmitting(false);
            return; // detenemos el envío
          }
        }

        // Paso 2: modificar
        const personal1 = {
          idEmpleado: personal.idEmpleado,
          nombre: valores.nombre.toUpperCase(),
          apellido: valores.apellido.toUpperCase(),
          carnet: valores.carnet,
          direccion: valores.direccion.toUpperCase(),
          telefono: valores.telefono,
          horaEntrada1: valores.horaEntrada1 || null,
          horaSalida1: valores.horaSalida1 || null,
          horaEntrada2: valores.horaEntrada2 || null,
          horaSalida2: valores.horaSalida2 || null,
        };

        await modificarPersonal(personal1);
        if (onUpdate) await onUpdate();
        handleClose();
        setOpenSnackbar(true);
      } catch (err) {
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: err.message });
        helpers.setSubmitting(false);
      }
    },
  });

  const BackgroundImage = styled('img')({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'contain', // muestra toda la imagen
    opacity: 0.3,
    zIndex: 0,
    pointerEvents: 'none',
    transition: 'opacity 0.3s ease', // suave si cambias opacidad
  });

  return (
    <>
      <IconButton
        onClick={handleClickOpen}
        title="Modificar"
        color="primary"
        aria-label="Modificar empleado"
        size="small"
      >
        <EditIcon />
      </IconButton>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <div style={{ position: 'relative', height: '100%' }}>
          <BackgroundImage src={escudo} alt="fondo" />
          <DialogTitle
            sx={{
              textAlign: 'center',
              position: 'relative',
              zIndex: 1,
              mt: 1,
            }}
          >
            <Box
              sx={{
                backgroundColor: '#e3f2fd',
                color: '#0d47a1',
                px: 2,
                py: 0.5,
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '1.25rem',
                display: 'inline-block',
              }}
            >
              {editMode ? 'Editar Empleado' : 'Modificar Empleado'}
            </Box>
          </DialogTitle>

          <DialogContent dividers>
            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField
                  fullWidth
                  name="nombre"
                  label="Nombre"
                  value={formik.values.nombre}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.nombre && Boolean(formik.errors.nombre)}
                  helperText={formik.touched.nombre && formik.errors.nombre}
                  onKeyPress={(e) => {
                    if (/\d/.test(e.key)) e.preventDefault();
                  }}
                />
                <TextField
                  fullWidth
                  name="apellido"
                  label="Apellido"
                  value={formik.values.apellido}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.apellido && Boolean(formik.errors.apellido)}
                  helperText={formik.touched.apellido && formik.errors.apellido}
                  onKeyPress={(e) => {
                    if (/\d/.test(e.key)) e.preventDefault();
                  }}
                />
                <TextField
                  fullWidth
                  name="carnet"
                  label="Carnet"
                  value={formik.values.carnet}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.carnet && Boolean(formik.errors.carnet)}
                  helperText={formik.touched.carnet && formik.errors.carnet}
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) e.preventDefault();
                  }}
                />
                <TextField
                  fullWidth
                  name="direccion"
                  label="Dirección"
                  value={formik.values.direccion}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.direccion && Boolean(formik.errors.direccion)}
                  helperText={formik.touched.direccion && formik.errors.direccion}
                />
                <TextField
                  fullWidth
                  name="telefono"
                  label="Teléfono"
                  value={formik.values.telefono}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.telefono && Boolean(formik.errors.telefono)}
                  helperText={formik.touched.telefono && formik.errors.telefono}
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) e.preventDefault();
                  }}
                />
                <Typography variant="subtitle2">Turno Mañana</Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={esLocale}>
                  <TimePicker
                    label="Entrada (mañana)"
                    value={formik.values.horaEntrada1 ? new Date(`1970-01-01T${formik.values.horaEntrada1}:00`) : null}
                    onChange={(newValue) => {
                      const timeString = newValue ? newValue.toTimeString().slice(0, 5) : '';
                      formik.setFieldValue('horaEntrada1', timeString);
                      // Opcional: limpiar salida si está antes o igual a la nueva entrada
                      if (formik.values.horaSalida1 && timeString >= formik.values.horaSalida1) {
                        formik.setFieldValue('horaSalida1', '');
                      }
                    }}
                    minTime={new Date(0, 0, 0, 6, 0)} // 06:00 AM
                    maxTime={new Date(0, 0, 0, 12, 0)} // 12:00 PM
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={formik.touched.horaEntrada1 && Boolean(formik.errors.horaEntrada1)}
                        helperText={formik.touched.horaEntrada1 && formik.errors.horaEntrada1}
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />

                  <TimePicker
                    label="Salida (mañana)"
                    value={formik.values.horaSalida1 ? new Date(`1970-01-01T${formik.values.horaSalida1}:00`) : null}
                    onChange={(newValue) => {
                      const timeString = newValue ? newValue.toTimeString().slice(0, 5) : '';
                      formik.setFieldValue('horaSalida1', timeString);
                    }}
                    minTime={
                      formik.values.horaEntrada1
                        ? new Date(`1970-01-01T${formik.values.horaEntrada1}:00`)
                        : new Date(0, 0, 0, 6, 0)
                    }
                    maxTime={new Date(0, 0, 0, 12, 0)}
                    shouldDisableTime={(timeValue, clockType) => {
                      // Deshabilitar la hora si es igual a horaEntrada1 en el reloj de horas
                      if (clockType === 'hours' && formik.values.horaEntrada1) {
                        const entradaHora = parseInt(formik.values.horaEntrada1.split(':')[0], 10);
                        return timeValue === entradaHora;
                      }
                      return false;
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={formik.touched.horaSalida1 && Boolean(formik.errors.horaSalida1)}
                        helperText={formik.touched.horaSalida1 && formik.errors.horaSalida1}
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                </LocalizationProvider>

                <Typography variant="subtitle2">Turno Tarde</Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={esLocale}>
                  <TimePicker
                    label="Entrada (tarde)"
                    value={formik.values.horaEntrada2 ? new Date(`1970-01-01T${formik.values.horaEntrada2}:00`) : null}
                    onChange={(newValue) => {
                      const timeString = newValue ? newValue.toTimeString().slice(0, 5) : '';
                      formik.setFieldValue('horaEntrada2', timeString);
                      if (formik.values.horaSalida2 && timeString >= formik.values.horaSalida2) {
                        formik.setFieldValue('horaSalida2', '');
                      }
                    }}
                    minTime={new Date(0, 0, 0, 13, 0)}
                    maxTime={new Date(0, 0, 0, 20, 0)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={formik.touched.horaEntrada2 && Boolean(formik.errors.horaEntrada2)}
                        helperText={formik.touched.horaEntrada2 && formik.errors.horaEntrada2}
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />

                  <TimePicker
                    label="Salida (tarde)"
                    value={formik.values.horaSalida2 ? new Date(`1970-01-01T${formik.values.horaSalida2}:00`) : null}
                    onChange={(newValue) => {
                      const timeString = newValue ? newValue.toTimeString().slice(0, 5) : '';
                      formik.setFieldValue('horaSalida2', timeString);
                    }}
                    minTime={
                      formik.values.horaEntrada2
                        ? new Date(`1970-01-01T${formik.values.horaEntrada2}:00`)
                        : new Date(0, 0, 0, 13, 0)
                    }
                    maxTime={new Date(0, 0, 0, 20, 0)}
                    shouldDisableTime={(timeValue, clockType) => {
                      if (clockType === 'hours' && formik.values.horaEntrada2) {
                        const entradaHora = parseInt(formik.values.horaEntrada2.split(':')[0], 10);
                        return timeValue === entradaHora;
                      }
                      return false;
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={formik.touched.horaSalida2 && Boolean(formik.errors.horaSalida2)}
                        helperText={formik.touched.horaSalida2 && formik.errors.horaSalida2}
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Stack>
            </form>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button
              onClick={formik.handleSubmit}
              variant="contained"
              disabled={!formik.isValid || !formik.dirty || formik.isSubmitting}
            >
              Guardar
            </Button>
          </DialogActions>
        </div>
      </Dialog>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert
          onClose={handleCloseSnackbar}
          severity="success"
          elevation={6}
          variant="filled"
          icon={<CheckCircleIcon fontSize="inherit" />}
          sx={{ width: '100%' }}
        >
          Se modificó el cliente correctamente
        </MuiAlert>
      </Snackbar>
    </>
  );
}
