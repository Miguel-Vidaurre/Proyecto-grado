import { Helmet } from 'react-helmet-async';
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  MenuItem,
  IconButton,
  Box,
  Snackbar,
  Alert,
  InputAdornment,
  Autocomplete,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useFormik, FieldArray, FormikProvider } from 'formik';
import * as Yup from 'yup';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

import { getListaCompras, agregarCompraService, eliminarCompraService } from '../service/compraservice';
import { getProveedor } from '../service/proveedorservice';
import { getlistaper } from '../service/personalservice';
import { getListaRepuestos } from '../service/repuestoservice';
import { generarPDFCompra } from './generarPDFCompra';
import escudo from '../escudo.png';

export default function CompraPage() {
  const [open, setOpen] = useState(false);
  const [proveedores, setProveedores] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [repuestos, setRepuestos] = useState([]);
  const [compras, setCompras] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [openConfirm, setOpenConfirm] = useState(false);
  const [compraAEliminar, setCompraAEliminar] = useState(null);
  const [repuestosFiltrados, setRepuestosFiltrados] = useState([]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [openPDF, setOpenPDF] = useState(false);
  const [pdfURL, setPdfURL] = useState('');

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // volver a la primera página al cambiar el número de filas
  };

  const categoriasPorProveedor = (nombreProveedor) => {
    if (!nombreProveedor) return [];
    const lower = nombreProveedor.toLowerCase();
    if (lower.includes('llanta') || lower.includes('neumático')) return ['Neumáticos y Llantas'];
    if (lower.includes('lubricante')) return ['Lubricantes'];
    if (lower.includes('filtro')) return ['Filtros'];
    if (lower.includes('tornillo')) return ['Tornillos'];
    if (lower.includes('repuesto')) return ['Neumáticos y Llantas', 'Lubricantes', 'Filtros', 'Baterías']; // genérico
    return [];
  };

  const handleOpenConfirm = (compra) => {
    setCompraAEliminar(compra);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (compraAEliminar) {
      const ok = await eliminarCompraService(compraAEliminar.idCompra);
      if (ok !== null) {
        fetchCompras();
        setSnackbar({
          open: true,
          message: 'Compra eliminada correctamente',
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Error al eliminar la compra',
          severity: 'error',
        });
      }
    }
    setOpenConfirm(false);
    setCompraAEliminar(null);
  };

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Luego useEffect
  useEffect(() => {
    let usuarioLS = null;
    try {
      const storedUser = localStorage.getItem('usuario');
      if (storedUser && storedUser !== 'undefined') {
        usuarioLS = JSON.parse(storedUser);
      }
    } catch (error) {
      console.error('Usuario en localStorage inválido:', error);
      localStorage.removeItem('usuario'); // limpiar si está corrupto
    }
    if (usuarioLS) setUsuario(usuarioLS);

    fetchProveedores();
    fetchEmpleados();
    fetchRepuestos();
    fetchCompras();
  }, []);

  // Filtrar proveedores activos
  const proveedoresActivos = proveedores.filter((prov) => prov.estado === true);

  const fetchEmpleados = async () => {
    const lista = await getlistaper();
    console.log('✅ Empleados obtenidos del backend:', lista); // <-- aquí
    setEmpleados(lista);
  };

  const fetchRepuestos = async () => {
    const lista = await getListaRepuestos();
    console.log('✅ Repuestos obtenidos del backend:', lista); // <-- aquí
    setRepuestos(lista);
  };

  const fetchCompras = async () => {
    const lista = await getListaCompras();
    console.log('✅ Compras obtenidas del backend:', lista); // <-- aquí
    setCompras(lista);
  };
  const fetchProveedores = async () => {
    const lista = await getProveedor();
    console.log('✅ Proveedores obtenidos del backend:', lista); // <-- aquí
    setProveedores(lista);
  };

  const handleProveedorChange = (event) => {
    const selected = proveedores.find((p) => p.idProveedor === event.target.value);
    formik.setFieldValue('proveedorId', selected?.idProveedor || '');
    formik.setFieldValue('proveedorNombre', selected?.nombre || '');

    if (selected) {
      // Por ejemplo, usar palabras clave para filtrar repuestos
      const keywords = ['llanta', 'neumático', 'lubricante', 'filtro', 'tornillo'];

      const filtrados = repuestos.filter((r) => keywords.some((k) => r.nombre.toLowerCase().includes(k)));

      setRepuestosFiltrados(filtrados);
    } else {
      setRepuestosFiltrados(repuestos);
    }
  };

  const parseFecha = (fechaString) => {
    if (!fechaString) return '';
    const [year, month, day] = fechaString.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleOpen = () => {
    formik.resetForm({
      values: {
        proveedorId: '',
        proveedorNombre: '',
        empleadoId: usuario?.empleado?.idEmpleado || '',
        empleadoNombre: usuario?.empleado?.nombre || '',
        empleadoApellido: usuario?.empleado?.apellido || '',
        fecha: new Date().toISOString().slice(0, 10),
        detalles: [{ repuestoId: '', cantidad: '', precioUnitario: '' }],
      },
    });
    setOpen(true);
  };

  const formik = useFormik({
    initialValues: {
      proveedorId: '',
      proveedorNombre: '',
      empleadoId: '',
      empleadoNombre: '',
      empleadoApellido: '',
      fecha: '',
      detalles: [{ repuestoId: '', cantidad: '', precioUnitario: '' }],
    },
    validationSchema: Yup.object({
      proveedorId: Yup.number().required('Seleccione un proveedor'),
      empleadoId: Yup.number().required('Seleccione un empleado'),
      fecha: Yup.date().required('Seleccione la fecha'),
      detalles: Yup.array()
        .of(
          Yup.object().shape({
            repuestoId: Yup.number().required('Seleccione un repuesto'),
            cantidad: Yup.number().required('Cantidad requerida').min(1, 'Mínimo 1'),
            precioUnitario: Yup.number().required('Precio requerido').min(0, 'No puede ser negativo'),
          })
        )
        .min(1, 'Debe agregar al menos un detalle'),
    }),
    onSubmit: async (values, { resetForm }) => {
      // Calcula el total sumando cantidad * precioUnitario
      const total = values.detalles.reduce((sum, item) => {
        const cantidad = Number(item.cantidad) || 0;
        const precio = Number(item.precioUnitario) || 0;
        return sum + cantidad * precio;
      }, 0);

      const dataToSend = {
        proveedorId: values.proveedorId,
        empleadoId: values.empleadoId,
        fecha: values.fecha,
        total, // <-- agregamos el total
        detalles: values.detalles.map((item) => {
          const cantidad = Number(item.cantidad) || 0;
          const precio = Number(item.precioUnitario) || 0;
          const subTotal = cantidad * precio; // ✅ calcular dentro del map

          return {
            repuestoId: item.repuestoId,
            cantidad,
            precioUnitario: precio,
            subTotal, // ✅ ahora ya existe
          };
        }),
      };

      console.log('Compra enviada al Backend: ', dataToSend);

      try {
        await agregarCompraService(dataToSend);
        fetchCompras();
        resetForm();
        setOpen(false);
        setSnackbar({ open: true, message: 'Se registró la compra correctamente', severity: 'success' });
      } catch (error) {
        console.error('❌ Error al guardar la compra:', error);
        setSnackbar({ open: true, message: 'Ocurrió un error al registrar la compra', severity: 'error' });
      }
    },
  });

  // Filtrar compras por proveedor, empleado o fecha
  const comprasFiltradas = compras.filter((compra) => {
    const texto = filtro.toLowerCase();
    return (
      compra.proveedorNombre.toLowerCase().includes(texto) ||
      compra.empleadoNombre.toLowerCase().includes(texto) ||
      parseFecha(compra.fecha).toLowerCase().includes(texto)
    );
  });
  console.log('🔹 Compras filtradas:', comprasFiltradas);

  const handleVerPDF = (compra) => {
    const repuestosMap = {};
    repuestos.forEach((r) => {
      repuestosMap[r.idRepuesto] = r.nombre;
    });

    const pdfBlob = generarPDFCompra(compra, repuestosMap);
    const url = URL.createObjectURL(pdfBlob);
    setPdfURL(url);
    setOpenPDF(true);
  };

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
    <div>
      <Helmet>
        <title>Compras</title>
      </Helmet>

      <Typography variant="h4" gutterBottom>
        Compras
      </Typography>

      <Button variant="contained" onClick={handleOpen}>
        Nueva Compra
      </Button>

      {/* Buscador */}
      <Autocomplete
        freeSolo
        disableClearable
        options={[]} // texto libre
        inputValue={filtro}
        onInputChange={(e, newValue) => setFiltro(newValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Buscar por proveedor, empleado o fecha"
            placeholder="Escriba algo..."
            variant="outlined"
            size="small"
            fullWidth
            sx={{ my: 2 }}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        )}
      />

      {/* Tabla */}
      <Table sx={{ mt: 2 }} size="small">
        <TableHead>
          <TableRow>
            <TableCell>Nro</TableCell>
            <TableCell>Proveedor</TableCell>
            <TableCell>Empleado</TableCell>
            <TableCell>Fecha</TableCell>
            <TableCell>Detalles</TableCell>
            <TableCell>Total</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {comprasFiltradas
            .sort((a, b) => {
              const nombreA = a.proveedorNombre || a.proveedor?.nombre || '';
              const nombreB = b.proveedorNombre || b.proveedor?.nombre || '';
              return nombreA.localeCompare(nombreB);
            })
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) // 🔹 mostrar solo filas de la página
            .map((compra, index) => (
              <TableRow key={compra.idCompra}>
                <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                <TableCell>{compra.proveedorNombre || compra.proveedor?.nombre || '—'}</TableCell>
                <TableCell>{compra.empleadoNombre || compra.empleado?.nombre || '—'}</TableCell>
                <TableCell>{parseFecha(compra.fecha)}</TableCell>
                <TableCell>
                  <ul style={{ paddingLeft: '1rem', margin: 0 }}>
                    {compra.detalles?.map((detalle, i) => {
                      const repuesto = repuestos.find((r) => r.idRepuesto === detalle.repuestoId);
                      return (
                        <li key={i}>
                          {repuesto ? repuesto.nombre : '—'}
                          {repuesto?.categoria ? ` (${repuesto.categoria})` : ''} — Cant: {detalle.cantidad} — Precio:{' '}
                          {detalle.precioUnitario} Bs — Subtotal: {detalle.subtotal} Bs
                        </li>
                      );
                    })}
                  </ul>
                </TableCell>
                <TableCell>{compra.total} Bs</TableCell>
                <TableCell>
                  <IconButton color="primary" size="small" title="Ver PDF" onClick={() => handleVerPDF(compra)}>
                    <VisibilityIcon fontSize="small" />
                  </IconButton>

                  <IconButton
                    color="error"
                    size="small"
                    aria-label="Eliminar"
                    title="Eliminar"
                    onClick={() => handleOpenConfirm(compra)}
                    sx={{ border: 'none', p: 0 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          {comprasFiltradas.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} align="center">
                No hay compras registradas.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={comprasFiltradas.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Filas por página"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
      />

      {/* Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <div style={{ position: 'relative' }}>
          <img
            src={escudo}
            alt="fondo"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              opacity: 0.2,
              zIndex: 0,
              pointerEvents: 'none',
            }}
          />

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
              Registrar Compra
            </span>
          </DialogTitle>
          <form onSubmit={formik.handleSubmit}>
            <DialogContent dividers>
              <TextField
                select
                fullWidth
                margin="dense"
                label="Proveedor"
                name="proveedorId"
                value={formik.values.proveedorId}
                onChange={handleProveedorChange}
                error={formik.touched.proveedorId && Boolean(formik.errors.proveedorId)}
                helperText={formik.touched.proveedorId && formik.errors.proveedorId}
              >
                <MenuItem value="">Seleccione proveedor</MenuItem>
                {proveedoresActivos.map((prov) => (
                  <MenuItem key={prov.idProveedor} value={prov.idProveedor}>
                    {prov.nombre}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Empleado"
                fullWidth
                margin="dense"
                value={usuario ? `${usuario.empleado?.nombre || ''} ${usuario.empleado?.apellido || ''}`.trim() : ''}
                disabled
              />

              <TextField
                fullWidth
                margin="dense"
                label="Fecha de compra"
                type="date"
                name="fecha"
                value={formik.values.fecha}
                onChange={formik.handleChange}
                error={formik.touched.fecha && Boolean(formik.errors.fecha)}
                helperText={formik.touched.fecha && formik.errors.fecha}
                InputLabelProps={{ shrink: true }}
                disabled
              />

              {/* Detalles */}
              <FormikProvider value={formik}>
                <FieldArray name="detalles">
                  {({ push, remove }) => (
                    <div>
                      <Typography variant="subtitle1" sx={{ mt: 2 }}>
                        Detalles de la compra
                      </Typography>
                      {formik.values.detalles.map((detalle, index) => (
                        <Box key={index} display="flex" gap={1} alignItems="center" sx={{ mt: 1 }}>
                          <TextField
                            select
                            label="Repuesto"
                            name={`detalles[${index}].repuestoId`}
                            value={detalle.repuestoId}
                            onChange={formik.handleChange}
                            error={
                              formik.touched.detalles?.[index]?.repuestoId &&
                              Boolean(formik.errors.detalles?.[index]?.repuestoId)
                            }
                            helperText={
                              formik.touched.detalles?.[index]?.repuestoId &&
                              formik.errors.detalles?.[index]?.repuestoId
                            }
                            sx={{ flex: 3 }}
                            size="small"
                          >
                            <MenuItem value="">Seleccione repuesto</MenuItem>

                            {[...repuestos]
                              .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''))
                              .map((rep) => (
                                <MenuItem key={rep.idRepuesto} value={rep.idRepuesto}>
                                  {rep.nombre} {rep.categoria ? `(${rep.categoria})` : ''}
                                </MenuItem>
                              ))}
                          </TextField>

                          <TextField
                            label="Cantidad"
                            name={`detalles[${index}].cantidad`}
                            type="number"
                            value={detalle.cantidad}
                            onChange={formik.handleChange}
                            error={
                              formik.touched.detalles?.[index]?.cantidad &&
                              Boolean(formik.errors.detalles?.[index]?.cantidad)
                            }
                            helperText={
                              formik.touched.detalles?.[index]?.cantidad && formik.errors.detalles?.[index]?.cantidad
                            }
                            sx={{ flex: 1 }}
                            size="small"
                            inputProps={{ min: 1 }}
                          />

                          <TextField
                            label="Precio Unitario"
                            name={`detalles[${index}].precioUnitario`}
                            type="number"
                            value={Number(detalle.precioUnitario)}
                            onChange={formik.handleChange}
                            error={
                              formik.touched.detalles?.[index]?.precioUnitario &&
                              Boolean(formik.errors.detalles?.[index]?.precioUnitario)
                            }
                            helperText={
                              formik.touched.detalles?.[index]?.precioUnitario &&
                              formik.errors.detalles?.[index]?.precioUnitario
                            }
                            sx={{ flex: 1 }}
                            size="small"
                            inputProps={{ min: 0 }}
                            InputProps={{
                              endAdornment: <InputAdornment position="end">Bs</InputAdornment>,
                            }}
                          />

                          {/* Subtotal */}
                          <TextField
                            label="Subtotal"
                            value={(Number(detalle.cantidad || 0) * Number(detalle.precioUnitario || 0)).toFixed(2)}
                            size="small"
                            sx={{ flex: 1 }}
                            InputProps={{
                              endAdornment: <InputAdornment position="end">Bs</InputAdornment>,
                              readOnly: true,
                            }}
                          />

                          <IconButton
                            color="error"
                            onClick={() => remove(index)}
                            disabled={formik.values.detalles.length === 1}
                          >
                            <RemoveCircleOutlineIcon />
                          </IconButton>
                        </Box>
                      ))}

                      <Button
                        sx={{ mt: 1 }}
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={() => push({ repuestoId: '', cantidad: '', precioUnitario: '' })}
                        size="small"
                      >
                        Agregar detalle
                      </Button>
                    </div>
                  )}
                </FieldArray>
                {/* Total visual */}
                <Typography variant="h6" sx={{ mt: 2, textAlign: 'right' }}>
                  Total: Bs.{' '}
                  {formik.values.detalles
                    .reduce((sum, item) => {
                      const cantidad = Number(item.cantidad) || 0;
                      const precio = Number(item.precioUnitario) || 0;
                      return sum + cantidad * precio;
                    }, 0)
                    .toFixed(2)}
                </Typography>
              </FormikProvider>
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" variant="contained" disabled={!(formik.isValid && formik.dirty)}>
                Guardar Compra
              </Button>
            </DialogActions>
          </form>
        </div>
      </Dialog>

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

      {/* Dialog de Confirmación para eliminar */}
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Desea eliminar la compra realizada por <strong>{compraAEliminar?.empleadoNombre}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openPDF}
        onClose={() => {
          setOpenPDF(false);
          URL.revokeObjectURL(pdfURL); // liberar memoria
          setPdfURL('');
        }}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>Previsualización PDF</DialogTitle>
        <DialogContent dividers sx={{ height: '80vh' }}>
          {pdfURL && (
            <iframe src={pdfURL} title="Previsualización PDF" width="100%" height="100%" style={{ border: 'none' }} />
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenPDF(false);
              URL.revokeObjectURL(pdfURL);
              setPdfURL('');
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
