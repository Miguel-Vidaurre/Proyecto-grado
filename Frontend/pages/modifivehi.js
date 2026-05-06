import { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import {
  Stack,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import Autocomplete from '@mui/material/Autocomplete';
// service
import { modificarVehiculo } from '../service/vehiculoservice';
import { getlistacli } from '../service/clienteservice';
import escudo from '../escudo.png';

export default function ModificarVehi({ vehiculo, actualizarLista }) {
  const [open, setOpen] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // 🔹 Cargar clientes al abrir el modal
  useEffect(() => {
    getlistacli().then(setClientes).catch(console.error);
  }, []);

  const formatFechaDDMMYYYY = (fecha) => {
    if (!fecha) return '';
    const [year, month, day] = fecha.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatFechaYYYYMMDD = (fecha) => {
    if (!fecha) return '';
    const [day, month, year] = fecha.split('/');
    return `${year}-${month}-${day}`;
  };

  const handleClickOpen = () => {
    formik.handleReset();
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      cliente: vehiculo.cliente || null,
      placa: vehiculo.placa,
      marca: vehiculo.marca,
      modelo: vehiculo.modelo,
      tipo: vehiculo.tipo,
      fechaRegistro: formatFechaDDMMYYYY(vehiculo.fechaRegistro),
      submit: null,
    },
    validationSchema: Yup.object({
      cliente: Yup.object().nullable().required('Debe seleccionar un cliente.'),
      marca: Yup.string().min(3).max(50).required('Campo requerido.'),
      modelo: Yup.string().max(50).required('Campo requerido.'),
      tipo: Yup.string().min(3).max(50).required('Campo requerido.'),
      fechaRegistro: Yup.string().matches(/^\d{2}\/\d{2}\/\d{4}$/, 'Formato DD/MM/YYYY'),
    }),
    onSubmit: async (valores, helpers) => {
      try {
        const vehiculoParaEnviar = {
          idVehiculo: vehiculo.idVehiculo,
          cliente: valores.cliente ? { idCliente: valores.cliente.idCliente } : null,
          placa: valores.placa.toUpperCase(),
          marca: valores.marca.toUpperCase(),
          modelo: valores.modelo.toUpperCase(),
          tipo: valores.tipo.toUpperCase(),
          fechaRegistro: formatFechaYYYYMMDD(valores.fechaRegistro),
        };

        console.log('📤 Enviando al backend:', vehiculoParaEnviar);

        await modificarVehiculo(vehiculoParaEnviar);

        if (typeof actualizarLista === 'function') {
          await actualizarLista();
        }

        setSnackbar({
          open: true,
          message: 'Se actualizó el registro del vehículo correctamente',
          severity: 'success',
        });
        handleClose();
      } catch (err) {
        console.error('❌ Error al modificar:', err);
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: err.message });
        helpers.setSubmitting(false);

        setSnackbar({ open: true, message: '❌ Error al modificar vehículo', severity: 'error' });
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
        aria-label="Modificar Vehículo"
        size="small"
      >
        <EditIcon />
      </IconButton>

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
              Modificar Vehículo
            </span>
          </DialogTitle>
          <DialogContent dividers>
            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={3} sx={{ mt: 1 }}>
                {/* 🔹 Cliente con Autocomplete */}
                <Autocomplete
                  options={clientes}
                  getOptionLabel={(option) => `${option.nombre} ${option.apellido}`}
                  value={formik.values.cliente || null}
                  onChange={(event, newValue) => formik.setFieldValue('cliente', newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Cliente"
                      error={formik.touched.cliente && Boolean(formik.errors.cliente)}
                      helperText={formik.touched.cliente && formik.errors.cliente}
                    />
                  )}
                />

                {/* ❌ Campos bloqueados */}
                <TextField
                  label="Placa"
                  fullWidth
                  value={formik.values.placa}
                  InputProps={{ readOnly: true }}
                  disabled
                />
                <TextField
                  label="Marca"
                  fullWidth
                  value={formik.values.marca}
                  InputProps={{ readOnly: true }}
                  disabled
                />
                <TextField
                  label="Modelo"
                  fullWidth
                  value={formik.values.modelo}
                  InputProps={{ readOnly: true }}
                  disabled
                />
                <TextField label="Tipo" fullWidth value={formik.values.tipo} InputProps={{ readOnly: true }} disabled />
                <TextField
                  label="Fecha de Registro"
                  fullWidth
                  value={formik.values.fechaRegistro}
                  InputProps={{ readOnly: true }}
                  disabled
                />
              </Stack>
            </form>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button
              type="submit"
              onClick={formik.handleSubmit}
              variant="contained"
              disabled={!(formik.isValid && formik.dirty)}
            >
              Guardar
            </Button>
          </DialogActions>
        </div>
      </Dialog>

      {/* 🔹 Snackbar para notificaciones */}
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
    </>
  );
}
