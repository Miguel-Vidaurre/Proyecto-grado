import React, { useState } from 'react';
import { Modal, Box, Button, TextField, Typography, Stack } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { modificarServicio } from '../service/serviciosservice';

export default function Modifiserv({ servicio, actualizarLista }) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    formik.setValues({
      tipoServicio: servicio.tipoServicio,
      costo: servicio.costo,
    });
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const formik = useFormik({
    initialValues: {
      tipoServicio: '',
      costo: '',
    },
    validationSchema: Yup.object({
      tipoServicio: Yup.string().required('Campo requerido'),
      costo: Yup.number().min(0, 'Debe ser mayor o igual a 0').required('Campo requerido'),
    }),
    onSubmit: async (valores, helpers) => {
      try {
        const servicioModificado = {
          idServicio: servicio.idServicio,
          tipoServicio: valores.tipoServicio,
          costo: valores.costo,
        };

        await modificarServicio(servicioModificado);
        if (typeof actualizarLista === 'function') {
          await actualizarLista(); // refrescar lista
        }
        handleClose();
      } catch (error) {
        console.error('❌ Error al modificar servicio:', error);
        helpers.setErrors({ submit: 'Error al modificar el servicio' });
      }
    },
  });

  const estiloModal = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
  };

  return (
    <>
      <Button variant="outlined" size="small" onClick={handleOpen}>
        Modificar
      </Button>
      <Modal open={open} onClose={handleClose}>
        <Box sx={estiloModal}>
          <Typography variant="h6" gutterBottom>
            Modificar Servicio no funcional
          </Typography>
          <form onSubmit={formik.handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Tipo de Servicio"
                name="tipoServicio"
                value={formik.values.tipoServicio}
                onChange={formik.handleChange}
                error={formik.touched.tipoServicio && Boolean(formik.errors.tipoServicio)}
                helperText={formik.touched.tipoServicio && formik.errors.tipoServicio}
                fullWidth
              />
              <TextField
                label="Costo"
                name="costo"
                type="number"
                value={formik.values.costo}
                onChange={formik.handleChange}
                error={formik.touched.costo && Boolean(formik.errors.costo)}
                helperText={formik.touched.costo && formik.errors.costo}
                fullWidth
              />

              {formik.errors.submit && <Typography color="error">{formik.errors.submit}</Typography>}

              <Button type="submit" variant="contained">
                Guardar Cambios
              </Button>
              <Button onClick={handleClose}>Cancelar</Button>
            </Stack>
          </form>
        </Box>
      </Modal>
    </>
  );
}
