import { useState, useEffect, useContext } from 'react';
import {
  Container,
  Paper,
  Typography,
  Stack,
  Button,
  TextField,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  Grid,
  TableRow,
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { UserContext } from './UserContext';
import { generarPDFRepuestos } from './generarPDFRepuestos';
import { getListaRepuestos } from '../service/repuestoservice';

export default function RepuestosReporte() {
  const { usuario } = useContext(UserContext);
  const [repuestos, setRepuestos] = useState([]);
  const [repuestosFiltrados, setRepuestosFiltrados] = useState([]);
  const [listaGenerada, setListaGenerada] = useState(false); // Estado para mostrar botón PDF

  const [marcas, setMarcas] = useState([]);
  const [filtroMarca, setFiltroMarca] = useState(null);
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [cantidadMin, setCantidadMin] = useState('');
  const [cantidadMax, setCantidadMax] = useState('');

  useEffect(() => {
    getListaRepuestos()
      .then((data) => {
        console.log('✅ Repuestos obtenidos:', data);
        setRepuestos(data);

        // Obtener marcas únicas
        const marcasUnicas = Array.from(new Set(data.map((r) => r.marca?.nombre).filter(Boolean))).map((nombre) => ({
          nombre,
        }));
        setMarcas(marcasUnicas);
      })
      .catch(console.error);
  }, []);

  const aplicarFiltros = () => {
    const filtrados = repuestos.filter((r) => {
      const cumpleMarca = !filtroMarca || r.marca?.nombre === filtroMarca.nombre;
      const cumplePrecioMin = precioMin === '' || r.precio >= parseFloat(precioMin);
      const cumplePrecioMax = precioMax === '' || r.precio <= parseFloat(precioMax);
      const cumpleCantidadMin = cantidadMin === '' || r.cantidad >= parseInt(cantidadMin, 10);
      const cumpleCantidadMax = cantidadMax === '' || r.cantidad <= parseInt(cantidadMax, 10);
      return cumpleMarca && cumplePrecioMin && cumplePrecioMax && cumpleCantidadMin && cumpleCantidadMax;
    });

    setRepuestosFiltrados(filtrados);
    setListaGenerada(true); // Marcamos que ya se generó la lista
  };

  const limpiarFiltros = () => {
    setFiltroMarca(null);
    setPrecioMin('');
    setPrecioMax('');
    setCantidadMin('');
    setCantidadMax('');
    setRepuestosFiltrados([]);
    setListaGenerada(false); // Reiniciamos
  };

  return (
    <Container>
      <Helmet>
        <title>Reporte de Repuestos</title>
      </Helmet>

      <Typography variant="h4" sx={{ mb: 3 }}>
        Reporte de Repuestos
      </Typography>

      {/* Panel de filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack spacing={2} direction="row" flexWrap="wrap" alignItems="center" justifyContent="center" gap={1}>
          <Autocomplete
            options={marcas}
            value={filtroMarca}
            onChange={(e, newValue) => setFiltroMarca(newValue)}
            getOptionLabel={(option) => option.nombre || ''}
            renderInput={(params) => (
              <TextField {...params} label="Marca" size="small" sx={{ width: 150, fontSize: 11 }} />
            )}
          />
          <TextField
            label="Precio mínimo"
            size="small"
            type="number"
            value={precioMin}
            onChange={(e) => setPrecioMin(e.target.value)}
            sx={{ width: 120, fontSize: 11 }}
          />
          <TextField
            label="Precio máximo"
            size="small"
            type="number"
            value={precioMax}
            onChange={(e) => setPrecioMax(e.target.value)}
            sx={{ width: 120, fontSize: 11 }}
          />
          <TextField
            label="Cantidad mínima"
            size="small"
            type="number"
            value={cantidadMin}
            onChange={(e) => setCantidadMin(e.target.value)}
            sx={{ width: 140, fontSize: 11 }}
          />
          <TextField
            label="Cantidad máxima"
            size="small"
            type="number"
            value={cantidadMax}
            onChange={(e) => setCantidadMax(e.target.value)}
            sx={{ width: 140, fontSize: 11 }}
          />
        </Stack>

        <Stack direction="row" justifyContent="center" spacing={2} sx={{ mt: 1 }}>
          <Button variant="contained" size="small" onClick={aplicarFiltros}>
            Generar
          </Button>
          <Button variant="outlined" size="small" onClick={limpiarFiltros}>
            Limpiar
          </Button>
        </Stack>
      </Paper>

      {/* Tabla */}
      {repuestosFiltrados.length > 0 ? (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nº</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Marca</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Precio</TableCell>
                <TableCell>Cantidad</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {repuestosFiltrados.map((r, index) => (
                <TableRow key={r.idRepuesto}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{r.nombre || '—'}</TableCell>
                  <TableCell>{r.marca?.nombre || 'Sin marca'}</TableCell>
                  <TableCell>{r.descripcion || '—'}</TableCell>
                  <TableCell>{r.precio != null ? r.precio : '—'} Bs</TableCell>
                  <TableCell>
                    {r.cantidad != null ? `${r.cantidad} ${r.cantidad === 1 ? 'unidad' : 'unidades'}` : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          {repuestos.length === 0 ? 'Cargando datos...' : 'No se encontraron resultados con los filtros aplicados.'}
        </Typography>
      )}

      {/* BOTÓN GENERAR PDF */}
      {listaGenerada && repuestosFiltrados.length > 0 && usuario && (
        <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
          <Button
            variant="contained"
            onClick={() => {
              const nombreEmpleado = usuario.empleado
                ? `${usuario.empleado.nombre} ${usuario.empleado.apellido}`
                : usuario.usuario;

              generarPDFRepuestos(repuestosFiltrados, nombreEmpleado, {
                Marca: filtroMarca ? filtroMarca.nombre : null,
                'Precio mínimo': precioMin || null,
                'Precio máximo': precioMax || null,
                'Cantidad mínima': cantidadMin || null,
                'Cantidad máxima': cantidadMax || null,
              });
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
