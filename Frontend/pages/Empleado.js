import { useState, useEffect, useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import * as Yup from 'yup';
import { useFormik } from 'formik';

import {
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  Stack,
  Paper,
  Button,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TableHead,
  TextField,
  TablePagination,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  IconButton,
  Snackbar,
  Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import esLocale from 'date-fns/locale/es';
import MuiAlert from '@mui/material/Alert';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import SearchIcon from '@mui/icons-material/Search';

import { UserContext } from './UserContext';
import ModificarEmp from './modifiempleado';

import { getlistaper, agregarPersonal, eliminarPersonal, verificarCarnet } from '../service/personalservice';
import {
  getListaRoles,
  agregarUsuario,
  actualizarRolesUsuario,
  buscarUsuariosPorNombreBase,
  contarUsuariosPorNombreBase,
  obtenerNombreUsuarioDisponible,
} from '../service/usuarioservice';
import escudo from '../escudo.png';

const TABLE_HEAD = [
  { id: 'N°', label: 'N°', alignRight: false },
  { id: 'nombre', label: 'Nombre', alignRight: false },
  { id: 'apellido', label: 'Apellido', alignRight: false },
  { id: 'carnet', label: 'Carnet', alignRight: false },
  { id: 'direccion', label: 'Dirección', alignRight: false },
  { id: 'telefono', label: 'Teléfono', alignRight: false },
  { id: 'horaEntrada', label: 'Turno Mañana', alignRight: false },
  { id: 'horaSalida', label: 'Turno Tarde', alignRight: false },
  { id: 'acciones', label: 'Acciones', alignRight: false },
];

const style = {
  minWidth: 400,
};

export default function UserPage() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openSnackbarEliminar, setOpenSnackbarEliminar] = useState(false);
  const [mensajeSnack, setMensajeSnack] = useState('');
  const [tipoSnack, setTipoSnack] = useState('success'); // 'success' o 'error'
  const [openSnack, setOpenSnack] = useState(false);
  const [empleados, setEmpleados] = useState([]);

  // Estados para manejo de modales Usuarios y Roles
  const [modalUsuarioAbierto, setModalUsuarioAbierto] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [modalRolesAbierto, setModalRolesAbierto] = useState(false);
  const [roles, setRoles] = useState([]);
  const [rolSeleccionado, setRolSeleccionado] = useState([]);
  const [openSelectRol, setOpenSelectRol] = useState(false);
  const [rolesSeleccionadosEnModal, setRolesSeleccionadosEnModal] = useState([]);
  const [nombreUsuarioGenerado, setNombreUsuarioGenerado] = useState('');
  const [usuarioConContador, setUsuarioConContador] = useState('');
  const { usuario, actualizarUsuario } = useContext(UserContext);

  // Buscador
  const [filtro, setFiltro] = useState('');
  const [dataFiltrada, setDataFiltrada] = useState(data);
  const [focus, setFocus] = useState(false);

  // Lista de opciones para el autocomplete (solo texto para mostrar)
  const opcionesBusqueda = data.map((emp) => `${emp.nombre} ${emp.apellido} `);

  // Estados para el diálogo de confirmación de empleados
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [empleadoAEliminar, setEmpleadoAEliminar] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Función de filtrado
  const filtrarEmpleados = (texto) => {
    setFiltro(texto);
    if (!texto) {
      setDataFiltrada(data);
    } else {
      const t = texto.toLowerCase();
      setDataFiltrada(
        data.filter(
          (emp) =>
            emp.nombre.toLowerCase().includes(t) ||
            emp.apellido.toLowerCase().includes(t) ||
            emp.carnet.toLowerCase().includes(t)
        )
      );
    }
  };

  // Cuando cambie la lista original, actualizar filtrada
  useEffect(() => {
    setDataFiltrada(data);
  }, [data]);

  // Mensaje de alerta Guardado
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpenSnackbar(false);
  };

  // Manejo cierre snackbar eliminación
  const handleCloseSnackbarEliminar = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpenSnackbarEliminar(false);
  };

  // Función eliminar con snackbar
  const handleDelete = async (id) => {
    await eliminarPersonal(id);
    actualizarLista();
    setOpenSnackbarEliminar(true);
  };

  // Funciones para abrir/cerrar modales
  const handleClickOpen = () => {
    formik.resetForm();
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  // Cargar lista de empleados
  const actualizarLista = async () => {
    const lista = await getlistaper();
    setData(lista);
  };

  useEffect(() => {
    actualizarLista();
  }, []);

  useEffect(() => {
    const generar = async () => {
      if (usuarioSeleccionado?.nombre) {
        try {
          const nombreGenerado = await generarNombreUsuario(usuarioSeleccionado.nombre);
          setUsuarioConContador(nombreGenerado);
        } catch (error) {
          console.error('Error generando nombre de usuario:', error);
          setUsuarioConContador(usuarioSeleccionado.nombre.toUpperCase().replace(/\s/g, ''));
        }
      }
      setRolSeleccionado([]);
    };
    if (modalUsuarioAbierto) {
      generar();
    }
  }, [modalUsuarioAbierto, usuarioSeleccionado]);

  // Generar nombre usuario (puedes usar lógica local o llamar al backend)
  const generarNombreUsuario = async (nombreEmpleado) => {
    const base = nombreEmpleado.toUpperCase().replace(/\s/g, '');
    // Puedes llamar al backend:
    try {
      const sugerencia = await obtenerNombreUsuarioDisponible(base);
      return sugerencia;
    } catch {
      // Fallback: buscar usuarios ya existentes localmente para calcular el siguiente número
      const usuariosExistentes = await buscarUsuariosPorNombreBase(base);
      const numeros = usuariosExistentes
        .map((u) => {
          const match = u.usuario?.match(new RegExp(`^${base}(\\d+)$`));
          return match ? parseInt(match[1], 10) : null;
        })
        .filter((n) => n !== null);
      const siguienteNumero = numeros.length > 0 ? Math.max(...numeros) + 1 : 1;
      return `${base}${siguienteNumero}`;
    }
  };
  useEffect(() => {
    const generarNombreUsuario = async () => {
      if (usuarioSeleccionado?.nombre) {
        const nombreBase = usuarioSeleccionado.nombre.toUpperCase().replace(/\s+/g, '');
        try {
          const sugerencia = await obtenerNombreUsuarioDisponible(nombreBase);
          setNombreUsuarioGenerado(sugerencia);
        } catch (error) {
          console.error('Error generando nombre de usuario:', error);
          setNombreUsuarioGenerado(nombreBase); // fallback
        }
      }
    };

    if (modalUsuarioAbierto) {
      generarNombreUsuario();
      setRolSeleccionado([]);
    }
  }, [modalUsuarioAbierto, usuarioSeleccionado]);

  // Abrir modal asignar usuario y cargar roles
  const abrirModalUsuario = async (empleado) => {
    try {
      const listaRoles = await getListaRoles();
      setRoles(listaRoles || []);
      setRolSeleccionado([]);

      setUsuarioSeleccionado({
        ...empleado,
        usuarioGenerado: '', // Se actualizará en useEffect
        passwordGenerada: empleado.carnet,
      });
      setModalUsuarioAbierto(true);
    } catch (error) {
      console.error('Error al abrir modal usuario:', error);
    }
  };

  // Guardar usuario asignado al empleado
  const guardarUsuario = async () => {
    if (!usuarioSeleccionado || rolSeleccionado.length === 0) return;

    try {
      const nombreBase = usuarioSeleccionado.nombre.toLowerCase().replace(/\s+/g, '');
      const count = await contarUsuariosPorNombreBase(nombreBase);
      const usuarioFinal = count === 0 ? nombreBase : `${nombreBase}${count}`;

      const nuevoUsuario = {
        usuario: usuarioFinal,
        password: usuarioSeleccionado.carnet,
        roles: rolSeleccionado.map((idRol) => ({ idRol })),
        empleado: { idEmpleado: usuarioSeleccionado.idEmpleado },
      };

      const respuesta = await agregarUsuario(nuevoUsuario);

      if (respuesta) {
        setMensajeSnack('Usuario asignado correctamente');
        setTipoSnack('success');
        setOpenSnackbar(true);
        setModalUsuarioAbierto(false);
        actualizarLista();
      }
    } catch (error) {
      setMensajeSnack('Error al asignar usuario');
      setTipoSnack('error');
      setOpenSnackbar(true);
      console.error('Error en guardarUsuario:', error);
    }
  };

  // Función para abrir modal "Más Roles"
  const abrirModalRoles = async (empleado) => {
    setUsuarioSeleccionado(empleado);

    console.log('Empleado recibido en abrirModalRoles:', empleado);
    console.log('Roles asignados en empleado:', empleado.roles);

    // Lista completa de roles (si no la tienes cargada, carga antes)
    const listaRoles = await getListaRoles();
    setRoles(listaRoles || []);

    const rolesAsignados = empleado.roles ? empleado.roles.map((r) => r.idRol) : [];
    setRolesSeleccionadosEnModal(rolesAsignados);

    setModalRolesAbierto(true);
  };

  // Checkbox roles en modal
  const handleCambioCheckbox = (idRol) => {
    if (rolesSeleccionadosEnModal.includes(idRol)) {
      setRolesSeleccionadosEnModal(rolesSeleccionadosEnModal.filter((id) => id !== idRol));
    } else {
      setRolesSeleccionadosEnModal([...rolesSeleccionadosEnModal, idRol]);
    }
  };

  // Guardar roles actualizados
  const guardarRolesActualizados = async () => {
    try {
      await actualizarRolesUsuario(usuarioSeleccionado.idEmpleado, rolesSeleccionadosEnModal);

      // 🔹 Actualizar solo los roles en el contexto, sin reemplazar todo
      actualizarUsuario((prevUsuario) => ({
        ...prevUsuario, // mantiene empleado, cliente, etc.
        roles: rolesSeleccionadosEnModal.map((idRol) => {
          const rol = roles.find((r) => r.idRol === idRol);
          return rol ? { idRol: rol.idRol, nombre: rol.nombre } : { idRol, nombre: '' };
        }),
      }));

      setMensajeSnack('Roles asignados correctamente');
      setTipoSnack('success');
      setOpenSnackbar(true);
      setModalRolesAbierto(false);
      actualizarLista(); // para refrescar tabla
    } catch (error) {
      setMensajeSnack('Error al asignar roles');
      setTipoSnack('error');
      setOpenSnackbar(true);
      console.error('Error en guardarRolesActualizados:', error);
    }
  };

  // Formik para el formulario Agregar / Editar empleado
  const formik = useFormik({
    initialValues: {
      nombre: '',
      apellido: '',
      carnet: '',
      direccion: '',
      telefono: '',
      horaEntrada1: '',
      horaSalida1: '',
      horaEntrada2: '',
      horaSalida2: '',
      submit: null,
    },
    validationSchema: Yup.object({
      nombre: Yup.string()
        .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'Solo se permiten letras')
        .required('Campo requerido.'),

      apellido: Yup.string()
        .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'Solo se permiten letras')
        .required('Campo requerido.'),
      carnet: Yup.string().min(3).max(10).required('Campo requerido.'),
      direccion: Yup.string().max(50).required('Campo requerido.'),
      telefono: Yup.string()
        .required('Campo requerido.')
        .matches(/^\d+$/, 'Solo se permiten números') // solo dígitos
        .length(8, 'El teléfono debe tener exactamente 8 dígitos'),
      horaEntrada1: Yup.string()
        .nullable()
        .test('hora-manana-entrada', 'La hora de entrada debe ser entre 06:00 y 12:00', (value) => {
          if (!value) return true;
          return value >= '06:00' && value <= '12:00';
        }),
      horaSalida1: Yup.string()
        .nullable()
        .test('hora-manana-salida', 'La hora de salida debe ser entre 06:00 y 12:00', (value) => {
          if (!value) return true;
          return value >= '06:00' && value <= '12:00';
        })
        .when('horaEntrada1', (entrada, schema) =>
          schema.test('validar-hora-manana', 'La hora de salida debe ser mayor que la hora de entrada', (salida) => {
            if (entrada && salida && entrada >= salida) return false;
            return true;
          })
        ),
      horaEntrada2: Yup.string()
        .required('Hora de entrada (tarde) requerida')
        .matches(/^([1][3-9]|2[0]):[0-5][0-9]$/, 'Solo horario de tarde (13:00-20:59)'),
      horaSalida2: Yup.string()
        .required('Hora de salida (tarde) requerida')
        .matches(/^([1][3-9]|2[0]):[0-5][0-9]$/, 'Solo horario de tarde (13:00-20:59)'),
    }),
    onSubmit: async (valores, helpers) => {
      try {
        // Paso 1: verificar carnet antes de guardar
        const existe = await verificarCarnet(valores.carnet); // servicio que devuelve true/false
        if (existe) {
          helpers.setFieldError('carnet', 'Este carnet ya está registrado');
          helpers.setSubmitting(false);
          return; // detenemos el envío
        }

        // Paso 2: guardar
        await agregarPersonal({
          nombre: valores.nombre.toUpperCase(),
          apellido: valores.apellido.toUpperCase(),
          carnet: valores.carnet,
          direccion: valores.direccion.toUpperCase(),
          telefono: valores.telefono,
          horaEntrada1: valores.horaEntrada1 || null,
          horaSalida1: valores.horaSalida1 || null,
          horaEntrada2: valores.horaEntrada2 || null,
          horaSalida2: valores.horaSalida2 || null,
        });

        actualizarLista();
        setOpen(false);
        setTipoSnack('success');
        setMensajeSnack('Se guardo el empleado correctamente');
        setOpenSnackbar(true);
      } catch (error) {
        helpers.setErrors({ submit: error.message });
      }
    },
  });

  const BackgroundImage = styled('img')({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'contain', // muestra toda la imagen
    opacity: 0.3,
    zIndex: 0,
    pointerEvents: 'none',
    transition: 'opacity 0.3s ease', // suave si cambias opacidad
  });

  return (
    <>
      <Helmet>
        <title> Empleados </title>
      </Helmet>

      <Container>
        <Typography variant="h4" sx={{ mb: 5 }}>
          Empleados
        </Typography>

        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Button variant="contained" onClick={handleClickOpen}>
            Nuevo Empleado
          </Button>
        </Stack>

        {/* Modal Agregar / Editar Empleado */}
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <div style={{ position: 'relative', height: '100%' }}>
            <BackgroundImage src={escudo} alt="fondo" />

            <DialogTitle
              sx={{
                textAlign: 'center',
                position: 'relative',
                zIndex: 1,
                mt: 1,
              }}
            >
              <Box
                sx={{
                  backgroundColor: '#e3f2fd',
                  color: '#0d47a1',
                  px: 2,
                  py: 0.5,
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '1.25rem',
                  display: 'inline-block',
                }}
              >
                Agregar Empleado
              </Box>
            </DialogTitle>
            <DialogContent>
              <form noValidate onSubmit={formik.handleSubmit}>
                <Stack spacing={2} mt={1}>
                  <TextField
                    fullWidth
                    name="nombre"
                    label="Nombre"
                    value={formik.values.nombre}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.nombre && Boolean(formik.errors.nombre)}
                    helperText={formik.touched.nombre && formik.errors.nombre}
                    onKeyPress={(e) => {
                      if (/\d/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                  <TextField
                    fullWidth
                    name="apellido"
                    label="Apellido"
                    value={formik.values.apellido}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.apellido && Boolean(formik.errors.apellido)}
                    helperText={formik.touched.apellido && formik.errors.apellido}
                    onKeyPress={(e) => {
                      if (/\d/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                  <TextField
                    fullWidth
                    name="carnet"
                    label="Carnet"
                    value={formik.values.carnet}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.carnet && Boolean(formik.errors.carnet)}
                    helperText={formik.touched.carnet && formik.errors.carnet}
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault(); // bloquea si no es número
                      }
                    }}
                  />
                  <TextField
                    label="Dirección"
                    name="direccion"
                    value={formik.values.direccion}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.direccion && Boolean(formik.errors.direccion)}
                    helperText={formik.touched.direccion && formik.errors.direccion}
                    fullWidth
                  />
                  <TextField
                    fullWidth
                    name="telefono"
                    label="Teléfono"
                    value={formik.values.telefono}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Solo números y máximo 8 dígitos
                      if (/^\d{0,8}$/.test(value)) {
                        formik.setFieldValue('telefono', value);
                      }
                    }}
                    onBlur={formik.handleBlur}
                    error={formik.touched.telefono && Boolean(formik.errors.telefono)}
                    helperText={formik.touched.telefono && formik.errors.telefono}
                    inputProps={{ maxLength: 8 }}
                  />
                  <Typography variant="subtitle2">Turno Mañana</Typography>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={esLocale}>
                    <TimePicker
                      label="Entrada (mañana)"
                      value={
                        formik.values.horaEntrada1 ? new Date(`1970-01-01T${formik.values.horaEntrada1}:00`) : null
                      }
                      onChange={(newValue) => {
                        const timeString = newValue ? newValue.toTimeString().slice(0, 5) : '';
                        formik.setFieldValue('horaEntrada1', timeString);
                        if (formik.values.horaSalida1 && timeString >= formik.values.horaSalida1) {
                          formik.setFieldValue('horaSalida1', '');
                        }
                      }}
                      minTime={new Date(0, 0, 0, 6, 0)}
                      maxTime={new Date(0, 0, 0, 12, 0)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={formik.touched.horaEntrada1 && Boolean(formik.errors.horaEntrada1)}
                          helperText={formik.touched.horaEntrada1 && formik.errors.horaEntrada1}
                          InputLabelProps={{ shrink: true }}
                          inputProps={{
                            ...params.inputProps,
                            readOnly: true, // 🔒 Evita escribir manualmente
                          }}
                        />
                      )}
                    />

                    <TimePicker
                      label="Salida (mañana)"
                      value={formik.values.horaSalida1 ? new Date(`1970-01-01T${formik.values.horaSalida1}:00`) : null}
                      onChange={(newValue) => {
                        const timeString = newValue ? newValue.toTimeString().slice(0, 5) : '';
                        formik.setFieldValue('horaSalida1', timeString);
                      }}
                      minTime={
                        formik.values.horaEntrada1
                          ? new Date(`1970-01-01T${formik.values.horaEntrada1}:00`)
                          : new Date(0, 0, 0, 6, 0)
                      }
                      maxTime={new Date(0, 0, 0, 12, 0)}
                      shouldDisableTime={(timeValue, clockType) => {
                        // Deshabilitar la hora si es igual a horaEntrada1 en el reloj de horas
                        if (clockType === 'hours' && formik.values.horaEntrada1) {
                          const entradaHora = parseInt(formik.values.horaEntrada1.split(':')[0], 10);
                          return timeValue === entradaHora;
                        }
                        return false;
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={formik.touched.horaSalida1 && Boolean(formik.errors.horaSalida1)}
                          helperText={formik.touched.horaSalida1 && formik.errors.horaSalida1}
                          InputLabelProps={{ shrink: true }}
                          inputProps={{
                            ...params.inputProps,
                            readOnly: true, // 🔒 Evita escribir manualmente
                          }}
                        />
                      )}
                    />
                  </LocalizationProvider>

                  <Typography variant="subtitle2">Turno Tarde</Typography>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={esLocale}>
                    <TimePicker
                      label="Entrada (tarde)"
                      value={
                        formik.values.horaEntrada2 ? new Date(`1970-01-01T${formik.values.horaEntrada2}:00`) : null
                      }
                      onChange={(newValue) => {
                        const timeString = newValue ? newValue.toTimeString().slice(0, 5) : '';
                        formik.setFieldValue('horaEntrada2', timeString);
                        if (formik.values.horaSalida2 && timeString >= formik.values.horaSalida2) {
                          formik.setFieldValue('horaSalida2', '');
                        }
                      }}
                      minTime={new Date(0, 0, 0, 13, 0)}
                      maxTime={new Date(0, 0, 0, 20, 0)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={formik.touched.horaEntrada2 && Boolean(formik.errors.horaEntrada2)}
                          helperText={formik.touched.horaEntrada2 && formik.errors.horaEntrada2}
                          InputLabelProps={{ shrink: true }}
                          inputProps={{
                            ...params.inputProps,
                            readOnly: true, // 🔒 Evita escribir manualmente
                          }}
                        />
                      )}
                    />

                    <TimePicker
                      label="Salida (tarde)"
                      value={formik.values.horaSalida2 ? new Date(`1970-01-01T${formik.values.horaSalida2}:00`) : null}
                      onChange={(newValue) => {
                        const timeString = newValue ? newValue.toTimeString().slice(0, 5) : '';
                        formik.setFieldValue('horaSalida2', timeString);
                      }}
                      minTime={
                        formik.values.horaEntrada2
                          ? new Date(`1970-01-01T${formik.values.horaEntrada2}:00`)
                          : new Date(0, 0, 0, 13, 0)
                      }
                      maxTime={new Date(0, 0, 0, 20, 0)}
                      shouldDisableTime={(timeValue, clockType) => {
                        if (clockType === 'hours' && formik.values.horaEntrada2) {
                          const entradaHora = parseInt(formik.values.horaEntrada2.split(':')[0], 10);
                          return timeValue === entradaHora;
                        }
                        return false;
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={formik.touched.horaSalida2 && Boolean(formik.errors.horaSalida2)}
                          helperText={formik.touched.horaSalida2 && formik.errors.horaSalida2}
                          InputLabelProps={{ shrink: true }}
                          inputProps={{
                            ...params.inputProps,
                            readOnly: true, // 🔒 Evita escribir manualmente
                          }}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Stack>
                {formik.errors.submit && (
                  <Typography color="error" sx={{ mt: 3 }} variant="body2" align="center">
                    {formik.errors.submit}
                  </Typography>
                )}
                <DialogActions sx={{ justifyContent: 'center', pt: 3, pb: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={!formik.isValid || !formik.dirty || formik.isSubmitting}
                  >
                    Guardar
                  </Button>
                  <Button variant="outlined" onClick={handleClose}>
                    Cancelar
                  </Button>
                </DialogActions>
              </form>
            </DialogContent>
          </div>
        </Dialog>
        {/* Snackbar de éxito o error */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <MuiAlert
            onClose={handleCloseSnackbar}
            severity={tipoSnack}
            sx={{ width: '100%' }}
            elevation={6}
            variant="filled"
          >
            {mensajeSnack}
          </MuiAlert>
        </Snackbar>

        {/* Snackbar de confirmación eliminación */}
        <Snackbar
          open={openSnackbarEliminar}
          autoHideDuration={3000}
          onClose={handleCloseSnackbarEliminar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <MuiAlert
            onClose={handleCloseSnackbarEliminar}
            severity="success"
            sx={{ width: '100%' }}
            elevation={6}
            variant="filled"
          >
            Se eliminó el empleado correctamente
          </MuiAlert>
        </Snackbar>

        <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>Confirmar eliminación</DialogTitle>
          <DialogContent sx={{ textAlign: 'center' }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              ¿Desea eliminar al empleado{' '}
              <strong>
                {empleadoAEliminar?.nombre} {empleadoAEliminar?.apellido}
              </strong>
              ?
            </Typography>
          </DialogContent>

          <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
            <Button variant="outlined" color="primary" onClick={() => setOpenConfirmDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={async () => {
                if (!empleadoAEliminar) return;

                try {
                  await handleDelete(empleadoAEliminar.idEmpleado); // tu función que ya funciona
                } catch (error) {
                  console.error('Error al eliminar:', error);
                } finally {
                  setOpenConfirmDialog(false);
                  setEmpleadoAEliminar(null); // limpiar selección
                }
              }}
            >
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal Asignar Usuario */}
        <Dialog open={modalUsuarioAbierto} onClose={() => setModalUsuarioAbierto(false)} maxWidth="sm" fullWidth>
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
                Asignar Usuario
              </span>
            </DialogTitle>

            <DialogContent dividers>
              {/* Campo: Nombre de Usuario */}
              <TextField
                label="Nombre de usuario sugerido"
                value={usuarioConContador}
                InputProps={{ readOnly: true }}
                fullWidth
                margin="normal"
              />

              {/* Campo: Contraseña (Carnet) */}
              <TextField
                label="Contraseña"
                value={usuarioSeleccionado?.carnet || ''}
                fullWidth
                margin="normal"
                InputProps={{ readOnly: true }}
              />

              {/* Selector de roles */}
              <FormControl fullWidth margin="normal">
                <InputLabel id="rol-label">Rol</InputLabel>

                <Select
                  labelId="rol-label"
                  multiple
                  open={openSelectRol}
                  onOpen={() => setOpenSelectRol(true)}
                  onClose={() => setOpenSelectRol(false)}
                  value={rolSeleccionado}
                  label="Rol"
                  onChange={(e) => {
                    setRolSeleccionado(e.target.value);

                    // Cerrar automáticamente al seleccionar
                    setOpenSelectRol(false);
                  }}
                  renderValue={(selected) =>
                    selected
                      .map((id) => {
                        const rol = roles.find((r) => r.idRol === id);
                        return rol ? rol.nombre : id;
                      })
                      .join(', ')
                  }
                >
                  {roles.map((rol) => (
                    <MenuItem key={rol.idRol} value={rol.idRol}>
                      {rol.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
              <Button variant="contained" color="primary" onClick={guardarUsuario} disabled={!rolSeleccionado.length}>
                Guardar
              </Button>
              <Button variant="outlined" color="secondary" onClick={() => setModalUsuarioAbierto(false)}>
                Cancelar
              </Button>
            </DialogActions>
          </div>
        </Dialog>
        {/* Mensaje de asignar usuario */}
        <Snackbar
          open={openSnack}
          autoHideDuration={3000}
          onClose={() => setOpenSnack(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MuiAlert onClose={() => setOpenSnack(false)} severity={tipoSnack} elevation={6} variant="filled">
            {mensajeSnack}
          </MuiAlert>
        </Snackbar>

        {/* Modal Más Roles */}
        <Dialog open={modalRolesAbierto} onClose={() => setModalRolesAbierto(false)} maxWidth="sm" fullWidth>
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
                {' '}
                Roles asignados a {usuarioSeleccionado?.nombre}
              </span>
            </DialogTitle>
            <DialogContent>
              <Stack>
                {roles.map((rol) => (
                  <FormControlLabel
                    key={rol.idRol}
                    control={
                      <Checkbox
                        checked={rolesSeleccionadosEnModal.includes(rol.idRol)}
                        onChange={() => handleCambioCheckbox(rol.idRol)}
                      />
                    }
                    label={rol.nombre}
                  />
                ))}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
              <Button variant="contained" onClick={guardarRolesActualizados}>
                Guardar
              </Button>
              <Button variant="outlined" onClick={() => setModalRolesAbierto(false)}>
                Cancelar
              </Button>
            </DialogActions>
          </div>
        </Dialog>
        {/* Mensaje mas roles */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <MuiAlert
            onClose={handleCloseSnackbar}
            severity={tipoSnack}
            sx={{ width: '100%' }}
            elevation={6}
            variant="filled"
          >
            {mensajeSnack}
          </MuiAlert>
        </Snackbar>

        <Autocomplete
          freeSolo
          disableClearable
          openOnFocus={false} // ✅ esta sí es válida
          options={[]} // lista vacía, nada que mostrar
          inputValue={filtro}
          onInputChange={(e, newInputValue) => filtrarEmpleados(newInputValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Buscar empleado..."
              placeholder="Nombre, Apellido, Carnet"
              variant="outlined"
              size="small"
              fullWidth
              sx={{ mb: 2 }}
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
        {/* Tabla Empleados */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {TABLE_HEAD.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    align={headCell.id === 'acciones' ? 'center' : 'left'}
                    sx={headCell.id === 'acciones' ? { textAlign: 'center' } : {}}
                  >
                    {headCell.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {dataFiltrada
                ?.slice() // copia segura
                .sort((a, b) => a.nombre.localeCompare(b.nombre))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((client, index) => (
                  <TableRow key={client.idEmpleado}>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{client.nombre}</TableCell>
                    <TableCell>{client.apellido}</TableCell>
                    <TableCell>{client.carnet}</TableCell>
                    <TableCell>{client.direccion}</TableCell>
                    <TableCell>{client.telefono}</TableCell>

                    <TableCell>
                      {client.horaEntrada1 && client.horaSalida1 && (
                        <div>
                          {client.horaEntrada1.slice(0, 5)} - {client.horaSalida1.slice(0, 5)} (M)
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      {client.horaEntrada2 && client.horaSalida2 && (
                        <div>
                          {client.horaEntrada2.slice(0, 5)} - {client.horaSalida2.slice(0, 5)} (T)
                        </div>
                      )}
                    </TableCell>

                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                        <ModificarEmp personal={client} onUpdate={actualizarLista}>
                          <IconButton
                            aria-label="Modificar"
                            size="small"
                            title="Modificar"
                            sx={{ border: 'none', p: 0 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </ModificarEmp>

                        <IconButton
                          color="error"
                          size="small"
                          aria-label="Eliminar"
                          title="Eliminar"
                          onClick={() => {
                            setEmpleadoAEliminar(client);
                            setOpenConfirmDialog(true);
                          }}
                          sx={{ p: 0 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                          color="secondary"
                          size="small"
                          aria-label="Asignar Usuario"
                          title="Asignar Usuario"
                          onClick={() => abrirModalUsuario(client)}
                          sx={{ border: 'none', p: 0 }}
                          disabled={client.roles && client.roles.length > 0}
                        >
                          <PersonIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                          color="info"
                          size="small"
                          aria-label="Más Roles"
                          title="Más Roles"
                          onClick={() => abrirModalRoles(client)}
                          sx={{ border: 'none', p: 0 }}
                          disabled={!client.nombreUsuario || !client.roles || client.roles.length === 0}
                        >
                          <SupervisorAccountIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={dataFiltrada.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Filas por página"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        />
      </Container>
    </>
  );
}
