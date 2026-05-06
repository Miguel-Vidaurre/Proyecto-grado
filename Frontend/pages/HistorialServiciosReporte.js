// src/pages/reportes/HistorialServiciosReporte.jsx
import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useContext } from 'react';
import {
  Autocomplete,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  Grid,
  Button,
} from '@mui/material';
import { UserContext } from './UserContext';
import { getlistahis } from '../service/historialservice';
import { getlistacli } from '../service/clienteservice';
import { getlistaper } from '../service/personalservice';
import { getServicios } from '../service/serviciosservice';
import { generarPDFHistorial } from './generarPDFHistorial';

export default function HistorialServiciosReporte() {
  const { usuario } = useContext(UserContext);
  const [historial, setHistorial] = useState([]); // datos que llegan después de generar
  const [cargando, setCargando] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);

  // Filtros
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [clienteFiltro, setClienteFiltro] = useState('');
  const [vehiculoFiltro, setVehiculoFiltro] = useState('');
  const [empleadoFiltro, setEmpleadoFiltro] = useState('');
  const [tipoServicioFiltro, setTipoServicioFiltro] = useState('');
  const [montoMin, setMontoMin] = useState('');
  const [montoMax, setMontoMax] = useState('');
  const [servicios, setServicios] = useState([]);

  // Cargar clientes y empleados para los filtros
  useEffect(() => {
    // Cargar clientes
    getlistacli().then((data) => {
      setClientes(data);

      // Extraer vehículos de los clientes
      const vehiculosSet = [];
      data.forEach((c) => c.vehiculos?.forEach((v) => vehiculosSet.push(v)));
      setVehiculos(vehiculosSet);
    });

    // Cargar empleados directamente del backend REAL
    getlistaper().then((data) => {
      setEmpleados(data);
      console.log('Empleados cargados desde backend:', data);
    });

    getServicios().then((data) => {
      setServicios(data);
      console.log('Servicios cargados:', data);
    });
  }, []);

  // Función "Generar"
  const aplicarFiltros = async () => {
    setCargando(true);
    try {
      const data = await getlistahis();

      // aplicar filtros sobre los datos recibidos
      const filtrados = data.filter((h) => {
        if (fechaInicio && new Date(h.fecha) < new Date(fechaInicio)) return false;
        if (fechaFin && new Date(h.fecha) > new Date(fechaFin)) return false;

        const clienteNombre = h.vehiculo?.cliente ? `${h.vehiculo.cliente.nombre} ${h.vehiculo.cliente.apellido}` : '';
        if (clienteFiltro && clienteNombre !== clienteFiltro) return false;

        if (vehiculoFiltro && h.vehiculo?.placa !== vehiculoFiltro) return false;

        const empleadoNombre = h.empleado ? `${h.empleado.nombre} ${h.empleado.apellido}` : '';
        if (empleadoFiltro && empleadoNombre !== empleadoFiltro) return false;

        if (tipoServicioFiltro) {
          const encontrado = h.detallesServicios?.some((d) =>
            d.servicio?.tipoServicio?.toLowerCase().includes(tipoServicioFiltro.toLowerCase())
          );
          if (!encontrado) return false;
        }

        if (montoMin && h.total < parseFloat(montoMin)) return false;
        if (montoMax && h.total > parseFloat(montoMax)) return false;

        return true;
      });

      setHistorial(filtrados);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    const d = new Date(fecha);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Limpiar filtros y también vaciar la tabla
  const limpiarFiltros = () => {
    setFechaInicio('');
    setFechaFin('');
    setClienteFiltro('');
    setVehiculoFiltro('');
    setEmpleadoFiltro('');
    setTipoServicioFiltro('');
    setMontoMin('');
    setMontoMax('');
    setHistorial([]); // vaciar tabla
  };

  console.log('Datos de historial recibidos:', historial);

  return (
    <Container>
      <Helmet>
        <title>Reporte Historial de Servicios</title>
      </Helmet>

      <Typography variant="h4" sx={{ mb: 3 }}>
        Historial de Servicios
      </Typography>

      {/* ======= FILTROS ======= */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={1} alignItems="center" wrap="nowrap" sx={{ overflowX: 'auto' }}>
          {/* Fecha inicio */}
          <Grid item>
            <TextField
              label="Fecha inicio"
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              inputProps={{
                max: new Date().toISOString().split('T')[0], // <-- evita fechas futuras
              }}
              onKeyDown={(e) => e.preventDefault()}
              onPaste={(e) => e.preventDefault()}
              sx={{
                width: 120,
                height: 36,
                fontSize: 11,
                '& .MuiOutlinedInput-root': { borderRadius: 1.5, height: '100%', fontSize: 10 },
                '& .MuiInputLabel-root': { fontSize: 10 },
                '& .MuiInputBase-input': { padding: '4px 8px', fontSize: 10 },
              }}
            />
          </Grid>

          <Grid item>
            <TextField
              label="Fecha fin"
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              inputProps={{
                min: fechaInicio || '',
                max: new Date().toISOString().split('T')[0], // <-- evita fechas futuras
              }}
              onKeyDown={(e) => e.preventDefault()}
              onPaste={(e) => e.preventDefault()}
              sx={{
                width: 120,
                height: 36,
                fontSize: 11,
                '& .MuiOutlinedInput-root': { borderRadius: 1.5, height: '100%', fontSize: 10 },
                '& .MuiInputLabel-root': { fontSize: 10 },
                '& .MuiInputBase-input': { padding: '4px 8px', fontSize: 10 },
              }}
            />
          </Grid>

          {/* Cliente */}
          <Grid item sx={{ minWidth: 160, flex: 1 }}>
            <Autocomplete
              freeSolo
              options={clientes.map((c) => `${c.nombre} ${c.apellido}`)}
              value={clienteFiltro}
              onChange={(event, newValue) => setClienteFiltro(newValue || '')}
              onInputChange={(event, newInputValue) => setClienteFiltro(newInputValue)}
              sx={{ flex: 1, minWidth: 120 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Cliente"
                  size="small"
                  sx={{
                    width: '100%',
                    height: 36,
                    fontSize: 11,
                    '& .MuiOutlinedInput-root': { borderRadius: 1.5, height: '100%', fontSize: 10 },
                    '& .MuiInputLabel-root': { fontSize: 10 },
                    '& .MuiInputBase-input': { padding: '4px 8px', fontSize: 10 },
                  }}
                />
              )}
            />
          </Grid>

          {/* Empleado */}
          <Grid item sx={{ minWidth: 160, flex: 1 }}>
            <Autocomplete
              freeSolo
              options={empleados
                .filter((e) => e.roles.some((r) => r.nombre === 'MECANICO')) // solo mecánicos
                .map((e) => `${e.nombre} ${e.apellido}`)}
              inputValue={empleadoFiltro}
              onInputChange={(event, newInputValue) => setEmpleadoFiltro(newInputValue)}
              sx={{ width: '100%' }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Mecánico"
                  size="small"
                  sx={{
                    width: '100%',
                    height: 36,
                    fontSize: 11,
                    '& .MuiOutlinedInput-root': { borderRadius: 1.5, height: '100%', fontSize: 10 },
                    '& .MuiInputLabel-root': { fontSize: 10 },
                    '& .MuiInputBase-input': { padding: '4px 8px', fontSize: 10 },
                  }}
                />
              )}
            />
          </Grid>

          {/* Tipo servicio */}
          <Grid item sx={{ minWidth: 150, flex: 1 }}>
            <Autocomplete
              freeSolo
              options={servicios.map((s) => s.tipoServicio)}
              value={tipoServicioFiltro}
              onChange={(event, newValue) => setTipoServicioFiltro(newValue || '')}
              onInputChange={(event, newInputValue) => setTipoServicioFiltro(newInputValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tipo servicio"
                  size="small"
                  sx={{
                    width: '100%',
                    height: 36,
                    fontSize: 11,
                    '& .MuiOutlinedInput-root': { borderRadius: 1.5, height: '100%', fontSize: 10 },
                    '& .MuiInputLabel-root': { fontSize: 10 },
                    '& .MuiInputBase-input': { padding: '4px 8px', fontSize: 10 },
                  }}
                />
              )}
            />
          </Grid>

          {/* Monto max */}
          <Grid item sx={{ flex: 1, minWidth: 120 }}>
            <TextField
              label="Monto max"
              type="number"
              value={montoMax}
              onChange={(e) => setMontoMax(e.target.value)}
              size="small"
              sx={{
                width: '100%',
                height: 36,
                fontSize: 11,
                '& .MuiOutlinedInput-root': { borderRadius: 1.5, height: '100%', fontSize: 10 },
                '& .MuiInputLabel-root': { fontSize: 10 },
                '& .MuiInputBase-input': { padding: '4px 8px', fontSize: 10 },
              }}
            />
          </Grid>

          {/* Monto min */}
          <Grid item sx={{ flex: 1, minWidth: 120 }}>
            <TextField
              label="Monto min"
              type="number"
              value={montoMin}
              onChange={(e) => setMontoMin(e.target.value)}
              size="small"
              sx={{
                width: '100%',
                height: 36,
                fontSize: 11,
                '& .MuiOutlinedInput-root': { borderRadius: 1.5, height: '100%', fontSize: 10 },
                '& .MuiInputLabel-root': { fontSize: 10 },
                '& .MuiInputBase-input': { padding: '4px 8px', fontSize: 10 },
              }}
            />
          </Grid>
        </Grid>

        {/* BOTONES ABAJO */}
        <Grid container justifyContent="center" spacing={2} sx={{ mt: 2 }}>
          <Grid item>
            <Button
              variant="contained"
              onClick={aplicarFiltros}
              disabled={cargando}
              sx={{ borderRadius: 2, height: 32, textTransform: 'none', fontSize: 13 }}
            >
              Generar
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              onClick={limpiarFiltros}
              sx={{ borderRadius: 2, height: 32, textTransform: 'none', fontSize: 13 }}
            >
              Limpiar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* ======= TABLA ======= */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nº</TableCell>
              <TableCell>Vehículo</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Servicio</TableCell>
              <TableCell>Empleado</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {historial.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  {cargando ? 'Cargando...' : 'No hay datos, use los filtros y pulse Generar'}
                </TableCell>
              </TableRow>
            ) : (
              historial.map((h, index) => (
                <TableRow key={`${h.idServicioRealizado}-${index}`}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{h.vehiculo?.placa || 'Sin vehículo'}</TableCell>
                  <TableCell>
                    {h.vehiculo?.cliente
                      ? `${h.vehiculo.cliente.nombre} ${h.vehiculo.cliente.apellido}`
                      : 'Sin cliente'}
                  </TableCell>
                  <TableCell>
                    {h.detallesServicios && h.detallesServicios.length > 0
                      ? h.detallesServicios.map((d, i) => (
                          <div key={i}>
                            {d.servicio?.tipoServicio || '—'} ({d.cantidad} {d.cantidad === 1 ? 'unidad' : 'unidades'})
                          </div>
                        ))
                      : 'Sin servicios'}
                  </TableCell>
                  <TableCell>{h.empleado ? `${h.empleado.nombre} ${h.empleado.apellido}` : 'Sin empleado'}</TableCell>
                  <TableCell>{formatearFecha(h.fecha)}</TableCell>
                  <TableCell>{h.total != null ? `${h.total} Bs` : '—'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* ======= BOTÓN GENERAR PDF ======= */}
      {historial.length > 0 && usuario && (
        <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
          <Button
            variant="contained"
            onClick={() => {
              const filtrosActivos = {
                'Fecha inicio': fechaInicio || '',
                'Fecha fin': fechaFin || '',
                Cliente: clienteFiltro || '',
                Vehículo: vehiculoFiltro || '',
                Empleado: empleadoFiltro || '',
                'Tipo servicio': tipoServicioFiltro || '',
                'Monto mínimo': montoMin || '',
                'Monto máximo': montoMax || '',
              };

              generarPDFHistorial(
                historial,
                usuario.empleado ? `${usuario.empleado.nombre} ${usuario.empleado.apellido}` : usuario.usuario,
                filtrosActivos
              );
            }}
            sx={{ borderRadius: 2, height: 36, textTransform: 'none', fontSize: 13 }}
          >
            Generar PDF
          </Button>
        </Grid>
      )}
    </Container>
  );
}
