import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useContext } from 'react';
import {
  Container,
  Paper,
  Typography,
  Stack,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Autocomplete,
  Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { UserContext } from './UserContext';
import { getListaCompras } from '../service/compraservice';
import { getProveedor } from '../service/proveedorservice';
import { getlistaper } from '../service/personalservice';
import { getListaRepuestos } from '../service/repuestoservice';
import { generarPDFCompras } from './generarPDFCompras';

export default function ComprasReporte() {
  const { usuario } = useContext(UserContext);

  const [compras, setCompras] = useState([]);
  const [comprasFiltradas, setComprasFiltradas] = useState([]);
  const [listaGenerada, setListaGenerada] = useState(false); // Para mostrar botón PDF

  const [proveedores, setProveedores] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [repuestos, setRepuestos] = useState([]);

  const [filtroProveedor, setFiltroProveedor] = useState(null);
  const [filtroEmpleado, setFiltroEmpleado] = useState(null);
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);

  useEffect(() => {
    getListaCompras().then(setCompras).catch(console.error);
    getProveedor().then(setProveedores).catch(console.error);
    getlistaper().then(setEmpleados).catch(console.error);
    getListaRepuestos().then(setRepuestos).catch(console.error);
  }, []);

  const aplicarFiltros = () => {
    const fechaIni = fechaInicio ? new Date(fechaInicio) : null;
    const fechaFi = fechaFin ? new Date(fechaFin) : null;

    const filtradas = compras.filter((c) => {
      const cumpleProveedor = !filtroProveedor || c.proveedorId === filtroProveedor.idProveedor;
      const cumpleEmpleado = !filtroEmpleado || c.empleadoId === filtroEmpleado.idEmpleado;

      const fechaCompra = new Date(c.fecha);

      const cumpleFecha = (!fechaIni || fechaCompra >= fechaIni) && (!fechaFi || fechaCompra <= fechaFi);

      return cumpleProveedor && cumpleEmpleado && cumpleFecha;
    });

    setComprasFiltradas(filtradas);
    setListaGenerada(true);
  };

  const limpiarFiltros = () => {
    setFiltroProveedor(null);
    setFiltroEmpleado(null);
    setFechaInicio('');
    setFechaFin('');
    setComprasFiltradas([]);
    setListaGenerada(false); // Ocultar botón PDF
  };

  const formatFechaDDMMYYYY = (fecha) => {
    if (!fecha) return '';
    const d = new Date(fecha);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container>
        <Helmet>
          <title>Reporte de Compras</title>
        </Helmet>

        <Typography variant="h4" sx={{ mb: 3 }}>
          Reporte de Compras
        </Typography>

        {/* Panel de filtros */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack
            spacing={1}
            direction="row"
            flexWrap="wrap"
            justifyContent="center"
            alignItems="center"
            gap={2}
            sx={{ mb: 2 }}
          >
            <Autocomplete
              options={proveedores}
              value={filtroProveedor}
              onChange={(e, newValue) => setFiltroProveedor(newValue)}
              getOptionLabel={(option) => option.nombre || ''}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Proveedor"
                  size="small"
                  sx={{ width: 160, '& input': { fontSize: 11 }, '& .MuiInputLabel-root': { fontSize: 11 } }}
                />
              )}
            />

            <Autocomplete
              options={empleados}
              value={filtroEmpleado}
              onChange={(e, newValue) => setFiltroEmpleado(newValue)}
              getOptionLabel={(option) => `${option.nombre} ${option.apellido}` || ''}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Empleado"
                  size="small"
                  sx={{ width: 160, '& input': { fontSize: 11 }, '& .MuiInputLabel-root': { fontSize: 11 } }}
                />
              )}
            />

            <TextField
              label="Fecha inicio"
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              inputProps={{
                max: new Date().toISOString().split('T')[0], // evitar fechas futuras
              }}
              onKeyDown={(e) => e.preventDefault()}
              onPaste={(e) => e.preventDefault()}
              sx={{
                width: 130,
                height: 36,
                fontSize: 11,
                '& .MuiOutlinedInput-root': { borderRadius: 1.5, height: '100%', fontSize: 10 },
                '& .MuiInputLabel-root': { fontSize: 11 },
                '& .MuiInputBase-input': { padding: '4px 8px', fontSize: 11 },
              }}
            />

            <TextField
              label="Fecha fin"
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              inputProps={{
                min: fechaInicio || '', // no permite antes de inicio
                max: new Date().toISOString().split('T')[0], // no permite futuro
              }}
              onKeyDown={(e) => e.preventDefault()}
              onPaste={(e) => e.preventDefault()}
              sx={{
                width: 130,
                height: 36,
                fontSize: 11,
                '& .MuiOutlinedInput-root': { borderRadius: 1.5, height: '100%', fontSize: 10 },
                '& .MuiInputLabel-root': { fontSize: 11 },
                '& .MuiInputBase-input': { padding: '4px 8px', fontSize: 11 },
              }}
            />
          </Stack>

          <Stack direction="row" justifyContent="center" spacing={2}>
            <Button variant="contained" size="small" onClick={aplicarFiltros}>
              Generar
            </Button>
            <Button variant="outlined" size="small" onClick={limpiarFiltros}>
              Limpiar
            </Button>
          </Stack>
        </Paper>

        {/* Tabla */}
        {comprasFiltradas.length > 0 ? (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nº</TableCell>
                  <TableCell>Proveedor</TableCell>
                  <TableCell>Empleado</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Detalles</TableCell>
                  <TableCell>Total Bs</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {comprasFiltradas.map((c, index) => (
                  <TableRow key={c.idCompra}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{c.proveedorNombre || 'Sin proveedor'}</TableCell>
                    <TableCell>{c.empleadoNombre || 'Sin empleado'}</TableCell>
                    <TableCell>{formatFechaDDMMYYYY(c.fecha)}</TableCell>
                    <TableCell>
                      <ul style={{ paddingLeft: '1rem', margin: 0 }}>
                        {c.detalles?.map((d, i) => {
                          const repuesto = repuestos.find((r) => r.idRepuesto === d.repuestoId);
                          const subTotal = (d.cantidad * d.precioUnitario).toFixed(2);
                          return (
                            <li key={i}>
                              {repuesto ? repuesto.nombre : '—'} — Cant: {d.cantidad} — Precio: {d.precioUnitario} Bs —
                              Subtotal: {subTotal} Bs
                            </li>
                          );
                        })}
                      </ul>
                    </TableCell>
                    <TableCell>{c.total} Bs</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Datos no encontrados
          </Typography>
        )}

        {/* BOTÓN GENERAR PDF */}
        {listaGenerada && comprasFiltradas.length > 0 && usuario && (
          <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button
              variant="contained"
              onClick={() => {
                const nombreEmpleado = usuario.empleado
                  ? `${usuario.empleado.nombre} ${usuario.empleado.apellido}`
                  : usuario.usuario;

                const filtros = {
                  Proveedor: filtroProveedor ? filtroProveedor.nombre : null,
                  Empleado: filtroEmpleado ? `${filtroEmpleado.nombre} ${filtroEmpleado.apellido}` : null,
                  'Fecha Inicio': fechaInicio ? formatFechaDDMMYYYY(fechaInicio) : null,
                  'Fecha Fin': fechaFin ? formatFechaDDMMYYYY(fechaFin) : null,
                };

                generarPDFCompras(comprasFiltradas, nombreEmpleado, repuestos, filtros);
              }}
              sx={{ borderRadius: 2, height: 36, textTransform: 'none', fontSize: 13 }}
            >
              Generar PDF
            </Button>
          </Grid>
        )}
      </Container>
    </LocalizationProvider>
  );
}
