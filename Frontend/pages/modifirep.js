import { useState } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
// @mui
import {
  Stack,
  Button,
  IconButton,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import EditIcon from '@mui/icons-material/Edit';
// service
import { modificarServicio, verificarDescripcion } from '../service/serviciosservice';
import escudo from '../escudo.png';

export default function ModificarRep({ reparacion, actualizarServicios, setSnackbar }) {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    formik.resetForm();
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const formik = useFormik({
    initialValues: {
      tipoServicio: reparacion.tipoServicio,
      costo: reparacion.costo,
      submit: null,
    },
    validationSchema: Yup.object({
      tipoServicio: Yup.string().required('Campo requerido.'),
      costo: Yup.number().required('Campo requerido.'),
    }),
    onSubmit: async (valores, helpers) => {
      try {
        if (valores.tipoServicio.toUpperCase() !== reparacion.tipoServicio.toUpperCase()) {
          const existe = await verificarDescripcion(valores.tipoServicio);
          if (existe) {
            helpers.setFieldError('tipoServicio', 'Esta descripción ya existe');
            return;
          }
        }

        const reparacionActualizada = {
          idServicio: reparacion.idServicio,
          tipoServicio: valores.tipoServicio.toUpperCase(),
          costo: valores.costo,
        };

        await modificarServicio(reparacionActualizada);
        if (actualizarServicios) await actualizarServicios();
        handleClose();
        if (setSnackbar) {
          setSnackbar({
            open: true,
            message: 'Se actualizó el registro del servicio correctamente',
            severity: 'success',
          });
        }
      } catch (err) {
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
        aria-label="Modificar Servicio"
        size="small"
      >
        <EditIcon />
      </IconButton>

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
              Modificar Servicio
            </span>
          </DialogTitle>
          <DialogContent>
            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={2} sx={{ mt: 1 }}>
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
                  type="number"
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
              <DialogActions sx={{ mt: 2 }}>
                <Button onClick={handleClose}>Cancelar</Button>
                <Button type="submit" variant="contained" disabled={!(formik.isValid && formik.dirty)}>
                  Guardar
                </Button>
              </DialogActions>
            </form>
          </DialogContent>
        </div>
      </Dialog>
    </>
  );
}
