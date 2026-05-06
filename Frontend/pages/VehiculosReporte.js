import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useContext } from 'react';
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TableContainer,
  TextField,
  Stack,
  Grid,
  Autocomplete,
  Button,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { getlistavehi } from '../service/vehiculoservice';
import { generarPDFVehiculos } from './generarPDFVehiculos';
import { UserContext } from './UserContext';

export default function VehiculosReporte() {
  const { usuario } = useContext(UserContext);
  const [vehiculos, setVehiculos] = useState([]);
  const [vehiculosFiltrados, setVehiculosFiltrados] = useState([]);
  const [filtroCliente, setFiltroCliente] = useState(null);
  const [filtroPlaca, setFiltroPlaca] = useState(null);
  const [filtroMarca, setFiltroMarca] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState(null);
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);

  useEffect(() => {
    getlistavehi().then(setVehiculos).catch(console.error);
  }, []);

  const formatFechaDDMMYYYY = (fecha) => {
    if (!fecha) return '';
    const [year, month, day] = fecha.split('-');
    return `${day}/${month}/${year}`;
  };

  // Listas únicas para Autocomplete
  const clientes = [
    ...new Set(vehiculos.map((v) => (v.cliente ? `${v.cliente.nombre} ${v.cliente.apellido}` : 'Sin cliente'))),
  ];
  const placas = [...new Set(vehiculos.map((v) => v.placa))];
  const marcas = [...new Set(vehiculos.map((v) => v.marca))];
  const tipos = [...new Set(vehiculos.map((v) => v.tipo))];

  const aplicarFiltros = () => {
    const filtrados = vehiculos.filter((v) => {
      const clienteNombre = `${v.cliente?.nombre || ''} ${v.cliente?.apellido || ''}`.trim() || 'Sin cliente';
      const cumpleCliente = !filtroCliente || clienteNombre === filtroCliente;
      const cumplePlaca = !filtroPlaca || v.placa === filtroPlaca;
      const cumpleMarca = !filtroMarca || v.marca === filtroMarca;
      const cumpleTipo = !filtroTipo || v.tipo === filtroTipo;
      const cumpleFecha =
        (!fechaInicio || new Date(v.fechaRegistro) >= fechaInicio) &&
        (!fechaFin || new Date(v.fechaRegistro) <= fechaFin);

      return cumpleCliente && cumplePlaca && cumpleMarca && cumpleTipo && cumpleFecha;
    });

    setVehiculosFiltrados(filtrados);
  };

  const limpiarFiltros = () => {
    setFiltroCliente(null);
    setFiltroPlaca(null);
    setFiltroMarca(null);
    setFiltroTipo(null);
    setFechaInicio(null);
    setFechaFin(null);
    setVehiculosFiltrados([]);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container>
        <Helmet>
          <title>Reporte de Vehículos</title>
        </Helmet>

        <Typography variant="h4" sx={{ mb: 3 }}>
          Reporte de Vehículos
        </Typography>

        {/* Panel de Filtros */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack spacing={1} direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2, width: '100%' }}>
            <Autocomplete
              options={clientes}
              value={filtroCliente}
              onChange={(e, newValue) => setFiltroCliente(newValue)}
              sx={{ flex: 2, minWidth: 140 }}
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
                  }}
                />
              )}
            />

            <Autocomplete
              options={placas}
              value={filtroPlaca}
              onChange={(e, newValue) => setFiltroPlaca(newValue)}
              sx={{ flex: 1, minWidth: 80 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Placa"
                  size="small"
                  sx={{
                    width: 120,
                    height: 36,
                    fontSize: 11,
                    '& .MuiOutlinedInput-root': { borderRadius: 1.5, height: '100%', fontSize: 10 },
                    '& .MuiInputLabel-root': { fontSize: 10 },
                  }}
                />
              )}
            />

            <Autocomplete
              options={marcas}
              value={filtroMarca}
              onChange={(e, newValue) => setFiltroMarca(newValue)}
              sx={{ flex: 1, minWidth: 80 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Marca"
                  size="small"
                  sx={{
                    width: '100%',
                    height: 36,
                    fontSize: 11,
                    '& .MuiOutlinedInput-root': { borderRadius: 1.5, height: '100%', fontSize: 10 },
                    '& .MuiInputLabel-root': { fontSize: 10 },
                  }}
                />
              )}
            />

            <Autocomplete
              options={tipos}
              value={filtroTipo}
              onChange={(e, newValue) => setFiltroTipo(newValue)}
              sx={{ flex: 2, minWidth: 50 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tipo"
                  size="small"
                  sx={{
                    width: '100%',
                    height: 36,
                    fontSize: 11,
                    '& .MuiOutlinedInput-root': { borderRadius: 1.5, height: '100%', fontSize: 10 },
                    '& .MuiInputLabel-root': { fontSize: 10 },
                  }}
                />
              )}
            />

            <DatePicker
              label="Fecha inicio"
              value={fechaInicio}
              onChange={(newValue) => setFechaInicio(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  sx={{
                    width: 120,
                    height: 36,
                    fontSize: 11,
                    '& .MuiOutlinedInput-root': { borderRadius: 1.5, height: '100%', fontSize: 10 },
                    '& .MuiInputLabel-root': { fontSize: 10 },
                    '& .MuiInputBase-input': { padding: '4px 8px', fontSize: 10 },
                  }}
                />
              )}
            />

            <DatePicker
              label="Fecha fin"
              value={fechaFin}
              onChange={(newValue) => setFechaFin(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  sx={{
                    width: 120,
                    height: 36,
                    fontSize: 11,
                    '& .MuiOutlinedInput-root': { borderRadius: 1.5, height: '100%', fontSize: 10 },
                    '& .MuiInputLabel-root': { fontSize: 10 },
                    '& .MuiInputBase-input': { padding: '4px 8px', fontSize: 10 },
                  }}
                />
              )}
            />
          </Stack>

          <Stack spacing={2} direction="row" justifyContent="center" sx={{ mt: 2 }}>
            <Button
              variant="contained"
              onClick={aplicarFiltros}
              sx={{ borderRadius: 2, height: 32, textTransform: 'none', fontSize: 13 }}
            >
              Generar
            </Button>
            <Button
              variant="outlined"
              onClick={limpiarFiltros}
              sx={{ borderRadius: 2, height: 32, textTransform: 'none', fontSize: 13 }}
            >
              Limpiar
            </Button>
          </Stack>
        </Paper>

        {/* Tabla */}
        {vehiculosFiltrados.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nº</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Placa</TableCell>
                  <TableCell>Marca</TableCell>
                  <TableCell>Modelo</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Fecha de Registro</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vehiculosFiltrados.map((v, index) => (
                  <TableRow key={v.idVehiculo}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{v.cliente ? `${v.cliente.nombre} ${v.cliente.apellido}` : 'Sin cliente'}</TableCell>
                    <TableCell>{v.placa}</TableCell>
                    <TableCell>{v.marca}</TableCell>
                    <TableCell>{v.modelo}</TableCell>
                    <TableCell>{v.tipo}</TableCell>
                    <TableCell>{formatFechaDDMMYYYY(v.fechaRegistro)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            {vehiculosFiltrados.length === 0 &&
            (filtroCliente || filtroPlaca || filtroMarca || filtroTipo || fechaInicio || fechaFin)
              ? 'Datos no encontrados'
              : 'Seleccione filtros y pulse Generar'}
          </Typography>
        )}
        {vehiculosFiltrados.length > 0 && usuario && (
          <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button
              variant="contained"
              onClick={() => {
                const nombreUsuario = usuario?.empleado
                  ? `${usuario.empleado.nombre} ${usuario.empleado.apellido}`
                  : usuario.usuario || 'Usuario';

                const filtros = {
                  Cliente: filtroCliente,
                  Placa: filtroPlaca,
                  Marca: filtroMarca,
                  Tipo: filtroTipo,
                  'Fecha Inicio': fechaInicio, // objeto Date
                  'Fecha Fin': fechaFin, // sin formatear
                };

                // 🔹 Verificar valores antes de generar PDF
                console.log('Vehículos filtrados:', vehiculosFiltrados);
                console.log('Filtros aplicados:', filtros);

                if (!vehiculosFiltrados.length) {
                  alert('No hay vehículos para generar el PDF');
                  return;
                }

                generarPDFVehiculos(vehiculosFiltrados, nombreUsuario, filtros);
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
