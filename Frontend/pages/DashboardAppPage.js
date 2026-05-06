import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';

// MUI
import { Container, Typography, Grid, Card, CardContent, Box } from '@mui/material';

// Recharts
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Servicios Backend
import { getServicios } from '../service/serviciosservice';
import { getListaRepuestos } from '../service/repuestoservice';
import { getListaCompras } from '../service/compraservice';
import { getlistavehi } from '../service/vehiculoservice';
import { getlistahis } from '../service/historialservice'; // 👈 IMPORTANTE

// ----------------------------------------------------------------------

export default function DashboardAppPage() {
  const [usuario, setUsuario] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [repuestos, setRepuestos] = useState([]);
  const [compras, setCompras] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [historial, setHistorial] = useState([]); // 👈 NUEVO

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('usuario'));
    if (data) setUsuario(data);

    getServicios().then(setServicios);
    getListaRepuestos().then(setRepuestos);
    getListaCompras().then(setCompras);
    getlistavehi().then(setVehiculos);

    // Cargar historial y mostrar en consola
    getlistahis().then((data) => {
      console.log('📌 Historial recibido en el frontend:', data);
      setHistorial(data || []);
    });
  }, []);

  // Nombres de meses
  const meses = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  // ================================
  // CALCULAR INGRESOS POR MES
  // ================================
  const ingresosPorMes = historial.reduce((acc, item) => {
    if (!item.fecha) return acc;

    const mes = new Date(item.fecha).getMonth(); // 0-11

    // CALCULAR TOTAL DEL HISTORIAL
    let totalServicios = 0;
    let totalRepuestos = 0;

    if (item.detallesServicios?.length) {
      totalServicios = item.detallesServicios.reduce((sum, d) => sum + (d.subtotal || 0), 0);
    }

    if (item.detallesRepuestos?.length) {
      totalRepuestos = item.detallesRepuestos.reduce(
        (sum, r) => sum + (r.repuesto?.precio || 0) * (r.cantidad || 1),
        0
      );
    }

    const totalMes = totalServicios + totalRepuestos;

    acc[mes] = (acc[mes] || 0) + totalMes;
    return acc;
  }, {});

  // Convertir a formato para grafico
  const graficoIngresos = Object.keys(ingresosPorMes)
    .sort((a, b) => a - b)
    .map((mesIndex) => ({
      mes: meses[mesIndex],
      total: ingresosPorMes[mesIndex],
    }));

  return (
    <>
      <Helmet>
        <title>Página Inicial | Mec. Vedia</title>
      </Helmet>

      <Container maxWidth="xl">
        {/* SALUDO */}
        <Typography variant="h4" sx={{ mb: 3 }}>
          HOLA{' '}
          {usuario?.empleado
            ? `${usuario.empleado.nombre} ${usuario.empleado.apellido}`
            : usuario?.cliente
            ? `${usuario.cliente.nombre} ${usuario.cliente.apellido}`
            : usuario?.usuario || 'Invitado'}
          , BIENVENIDO.
        </Typography>

        {/* CARDS RESUMEN */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, p: 1, textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h6">Servicios</Typography>
                <Typography variant="h4" color="primary">
                  {servicios.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, p: 1, textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h6">Repuestos</Typography>
                <Typography variant="h4" color="primary">
                  {repuestos.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, p: 1, textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h6">Compras</Typography>
                <Typography variant="h4" color="primary">
                  {compras.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, p: 1, textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h6">Vehículos</Typography>
                <Typography variant="h4" color="primary">
                  {vehiculos.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* GRÁFICO INGRESOS POR MES */}
        <Box sx={{ mt: 5 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Ingresos por Mes
          </Typography>

          <Card sx={{ p: 2, borderRadius: 3 }}>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={graficoIngresos}>
                  <XAxis dataKey="mes" />
                  <YAxis width={70} tickFormatter={(value) => `Bs ${value}`} />
                  <Tooltip formatter={(value) => `Bs ${value}`} />
                  <Bar dataKey="total" fill="#81D4FA" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Box>
      </Container>
    </>
  );
}
