import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Stack,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TextField,
  InputAdornment,
  Box,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GenerarPDF from './pdf';

// Importar tus servicios
import { getlistacli } from '../service/clienteservice';
import { getlistavehi } from '../service/vehiculoservice';
import { getlistacot } from '../service/cotizacionservice';
import { getListaCompras } from '../service/compraservice';
import { getListaRepuestos } from '../service/repuestoservice';
import { getlistahis } from '../service/historialservice';
import { getMarcas } from '../service/marcaservice';
import { getProveedor } from '../service/proveedorservice';

export default function ReportesPage() {
  const reportes = [
    { id: 'clientes', label: 'Clientes' },
    { id: 'vehiculos', label: 'Vehículos' },
    { id: 'cotizaciones', label: 'Cotizaciones' },
    { id: 'compras', label: 'Compras' },
    { id: 'repuestos', label: 'Repuestos' },
    { id: 'historial', label: 'Historial de Servicios' },
    { id: 'marcasProveedores', label: 'Marcas y Proveedores' },
  ];

  const TABLE_HEAD_MAP = {
    clientes: [
      { id: 'nombre', label: 'Nombre' },
      { id: 'nit', label: 'NIT' },
      { id: 'telefono', label: 'Teléfono' },
    ],
    vehiculos: [
      { id: 'placa', label: 'Placa' },
      { id: 'cliente', label: 'Cliente' },
      { id: 'modelo', label: 'Modelo' },
    ],
    cotizaciones: [
      { id: 'cliente', label: 'Cliente' },
      { id: 'fecha', label: 'Fecha' },
      { id: 'total', label: 'Total' },
    ],
    compras: [
      { id: 'proveedor', label: 'Proveedor' },
      { id: 'fecha', label: 'Fecha' },
      { id: 'total', label: 'Total' },
    ],
    repuestos: [
      { id: 'nombre', label: 'Nombre' },
      { id: 'marca', label: 'Marca' },
      { id: 'precio', label: 'Precio' },
    ],
    historial: [
      { id: 'vehiculo', label: 'Vehículo' },
      { id: 'empleado', label: 'Empleado' },
      { id: 'servicio', label: 'Servicio' },
      { id: 'fecha', label: 'Fecha' },
    ],
    marcasProveedores: [
      { id: 'marca', label: 'Marca' },
      { id: 'proveedor', label: 'Proveedor' },
      { id: 'estado', label: 'Estado' },
    ],
  };

  const [reporteSeleccionado, setReporteSeleccionado] = useState('clientes');
  const [data, setData] = useState([]);
  const [filtro, setFiltro] = useState('');

  // Traer datos según el reporte seleccionado
  useEffect(() => {
    const fetchData = async () => {
      try {
        let response = [];
        switch (reporteSeleccionado) {
          case 'ehiculos':
            response = await getlistavehi();
            break;
          case 'Compras':
            response = await getListaCompras();
            break;
          case 'Repuestos':
            response = await getListaRepuestos();
            break;
          case 'Servicios Realizados':
            response = await getlistahis();
            break;
          default:
            response = [];
        }
        setData(response);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [reporteSeleccionado]);

  const TABLE_HEAD = TABLE_HEAD_MAP[reporteSeleccionado] || [];

  // Filtro dinámico: busca en todos los campos visibles
  const dataFiltrada = data.filter((row) =>
    TABLE_HEAD.some((col) => {
      const valor = row[col.id];
      return valor && valor.toString().toLowerCase().includes(filtro.toLowerCase());
    })
  );

  return (
    <>
      <Helmet>
        <title>Reportes</title>
      </Helmet>
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Reportes
        </Typography>
        <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
          {/* Panel lateral */}
          <Stack direction="column" spacing={1} sx={{ width: 200 }}>
            {reportes.map((r) => (
              <Button
                key={r.id}
                variant={reporteSeleccionado === r.id ? 'contained' : 'outlined'}
                onClick={() => setReporteSeleccionado(r.id)}
              >
                {r.label}
              </Button>
            ))}
          </Stack>

          {/* Área principal */}
          <Box sx={{ flex: 1 }}>
            {/* Buscador */}
            <TextField
              fullWidth
              placeholder="Buscar..."
              size="small"
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />

            {/* Tabla */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    {TABLE_HEAD.map((headCell) => (
                      <TableCell key={headCell.id}>{headCell.label}</TableCell>
                    ))}
                    <TableCell>PDF</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataFiltrada.map((row, index) => (
                    <TableRow key={index}>
                      {TABLE_HEAD.map((col) => (
                        <TableCell key={col.id}>{row[col.id] !== undefined ? row[col.id] : '-'}</TableCell>
                      ))}
                      <TableCell>
                        <GenerarPDF pdf={row} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Stack>
      </Container>
    </>
  );
}
