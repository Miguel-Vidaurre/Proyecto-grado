import React from 'react';
import { TextField, IconButton, Grid } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export default function DetalleServicio({ detalle, index, servicios, handleChange, handleRemove }) {
  return (
    <Grid container spacing={2} alignItems="center" key={index}>
      <Grid item xs={4}>
        <TextField
          select
          fullWidth
          label="Servicio"
          name="servicio"
          value={detalle.servicio?.idServicio || ''}
          onChange={(e) => handleChange(index, 'servicio', parseInt(e.target.value, 10))}
          SelectProps={{ native: true }}
        >
          <option value="">Seleccione un servicio</option>
          {servicios.map((serv) => (
            <option key={serv.idServicio} value={serv.idServicio}>
              {serv.tipoServicio}
            </option>
          ))}
        </TextField>
      </Grid>

      <Grid item xs={2}>
        <TextField
          type="number"
          label="Cantidad"
          value={detalle.cantidadServicios}
          onChange={(e) => handleChange(index, 'cantidadServicios', parseInt(e.target.value, 10))}
          fullWidth
        />
      </Grid>

      <Grid item xs={2}>
        <TextField
          type="number"
          label="Costo U."
          value={detalle.costoUnitarioServ}
          onChange={(e) => handleChange(index, 'costoUnitarioServ', parseFloat(e.target.value))}
          fullWidth
        />
      </Grid>

      <Grid item xs={2}>
        <TextField type="number" label="Subtotal" value={detalle.subtotal} InputProps={{ readOnly: true }} fullWidth />
      </Grid>

      <Grid item xs={2}>
        <IconButton onClick={() => handleRemove(index)} color="error">
          <DeleteIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
}
