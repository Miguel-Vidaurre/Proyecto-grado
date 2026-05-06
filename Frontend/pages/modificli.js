import { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import {
  Stack,
  Button,
  Typography,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert as MuiAlert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { modificarCliente, verificarCarnet } from '../service/clienteservice';
import escudo from '../escudo.png';

export default function ModificarCli({ cliente, onClienteActualizado }) {
  const [open, setOpen] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleClickOpen = () => {
    formik.handleReset();
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const formik = useFormik({
    initialValues: {
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      carnet: cliente.carnet,
      email: cliente.email,
      telefono: cliente.telefono,
      nit: cliente.nit,
      submit: null,
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      nombre: Yup.string().min(3).max(50).required('Campo requerido.'),
      apellido: Yup.string().max(50).required('Campo requerido.'),
      carnet: Yup.string().min(3).max(50).required('Campo requerido.'),
      email: Yup.string()
        .email('Correo inválido')
        .matches(/^[\w.%+-]+@[\w.-]+\.com$/, 'Debe contener @ y terminar en .com')
        .required('Campo requerido.'),
      telefono: Yup.string().required('Campo requerido.'),
      nit: Yup.string().required('Campo requerido.'),
    }),
    validateOnMount: true,
    onSubmit: async (valores, helpers) => {
      try {
        if (valores.carnet !== cliente.carnet) {
          const existe = await verificarCarnet(valores.carnet);
          if (existe) {
            helpers.setFieldError('carnet', 'Este carnet ya está registrado');
            helpers.setSubmitting(false);
            return; // detenemos el envío
          }
        }

        const cliente1 = {
          idCliente: cliente.idCliente,
          nombre: valores.nombre.toUpperCase(),
          apellido: valores.apellido.toUpperCase(),
          carnet: valores.carnet,
          email: valores.email,
          telefono: valores.telefono,
          nit: valores.nit,
        };

        await modificarCliente(cliente1);
        if (onClienteActualizado) await onClienteActualizado();
        setOpenSnackbar(true); // ✅ mostrar mensaje de éxito
        handleClose(); // cerrar el dialog
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
    objectFit: 'contain', // 🔹 Muestra toda la imagen (aunque deje bordes)
    opacity: 0.3,
    zIndex: 0,
    pointerEvents: 'none',
  });

  return (
    <>
      <IconButton
        onClick={handleClickOpen}
        title="Modificar"
        color="primary"
        aria-label="Modificar cliente"
        size="small"
      >
        <EditIcon />
      </IconButton>

      {/* ✅ Cambiamos Modal por Dialog */}
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
              Modificar Cliente
            </span>
          </DialogTitle>
          <DialogContent>
            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={3} sx={{ mt: 1 }}>
                <TextField
                  error={!!(formik.touched.nombre && formik.errors.nombre)}
                  fullWidth
                  helperText={formik.touched.nombre && formik.errors.nombre}
                  label="Nombre"
                  name="nombre"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.nombre}
                  onKeyPress={(e) => {
                    if (/\d/.test(e.key)) e.preventDefault();
                  }}
                />
                <TextField
                  error={!!(formik.touched.apellido && formik.errors.apellido)}
                  fullWidth
                  helperText={formik.touched.apellido && formik.errors.apellido}
                  label="Apellido"
                  name="apellido"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.apellido}
                  onKeyPress={(e) => {
                    if (/\d/.test(e.key)) e.preventDefault();
                  }}
                />
                <TextField
                  error={!!(formik.touched.carnet && formik.errors.carnet)}
                  fullWidth
                  helperText={formik.touched.carnet && formik.errors.carnet}
                  label="Carnet"
                  name="carnet"
                  type="number"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.carnet}
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
                <TextField
                  error={!!(formik.touched.email && formik.errors.email)}
                  fullWidth
                  helperText={formik.touched.email && formik.errors.email}
                  label="Correo"
                  name="email"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.email}
                />
                <TextField
                  error={!!(formik.touched.telefono && formik.errors.telefono)}
                  fullWidth
                  helperText={formik.touched.telefono && formik.errors.telefono}
                  label="Celular"
                  name="telefono"
                  type="number"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.telefono}
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
                <TextField
                  error={!!(formik.touched.nit && formik.errors.nit)}
                  fullWidth
                  helperText={formik.touched.nit && formik.errors.nit}
                  label="Nit"
                  name="nit"
                  type="number"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.nit}
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
                {formik.errors.submit && (
                  <Typography color="error" variant="body2">
                    {formik.errors.submit}
                  </Typography>
                )}
              </Stack>
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
            </form>
          </DialogContent>
        </div>
      </Dialog>

      {/* ✅ Snackbar de éxito */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: '100%' }}
          elevation={6}
          variant="filled"
        >
          Se modificó el cliente correctamente
        </MuiAlert>
      </Snackbar>
    </>
  );
}
