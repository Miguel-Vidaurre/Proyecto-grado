import { Helmet } from 'react-helmet-async';
import { useState, useEffect, React } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import * as Yup from 'yup';
import { useFormik } from 'formik';
// @mui
import {
  Card,
  Table,
  Stack,
  Paper,
  Avatar,
  Button,
  Popover,
  Checkbox,
  TableRow,
  MenuItem,
  TableBody,
  TableCell,
  Container,
  Typography,
  IconButton,
  TableContainer,
  TablePagination,
  TableHead,
  TextField,
} from '@mui/material';
// components
import Iconify from '../components/iconify';
import { getlistaper, agregarPersonal, eliminarPersonal } from '../service/personalservice';
// import ModificarPer from './modifiempleado';
import PDFpruebas from './pdfpr';
// sections
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';
// mock
// import USERLIST from '../_mock/user';
const USERLIST = [];
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'nomper', label: 'Nombre', alignRight: false },
  { id: 'apper', label: 'Apellido Paterno', alignRight: false },
  { id: 'amper', label: 'Apellido Materno', alignRight: false },
  { id: 'ciper', label: 'Carnet', alignRight: false },
  { id: 'fnacper', label: 'Fecha Nacimiento', alignRight: false },
  { id: 'cargoper', label: 'Cargo', alignRight: false },
  { id: 'fregper', label: 'Fecha de Registro', alignRight: false },
];

// ----------------------------------------------------------------------

function YourComponent() {
  const [nombre, setNombre] = useState('');
  const [ap, setAp] = useState('');
  const [am, setAm] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [cargo, setCargo] = useState('');
  const [fecharegistro, setFecharegistro] = useState('');
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  const guardarPersonal = async () => {
    const personal = {
      nombre,
      ap,
      am,
      fechaNacimiento,
      cargo,
      fecharegistro,
    };

    const response = await agregarPersonal(personal);
    // Manejar la respuesta según sea necesario
  };

  return (
    <Modal
      keepMounted
      open={open}
      onClose={handleClose}
      aria-labelledby="keep-mounted-modal-title"
      aria-describedby="keep-mounted-modal-description"
    >
      <Box sx={style}>
        <h2 style={{ textAlign: 'center', margin: '0 auto' }}>Agregar Personal</h2>
        <TextField
          id="standard-basic"
          label="Nombre"
          variant="standard"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <TextField
          id="standard-basic"
          label="Apellido Paterno"
          variant="standard"
          value={ap}
          onChange={(e) => setAp(e.target.value)}
        />
        <TextField
          id="standard-basic"
          label="Apellido Materno"
          variant="standard"
          value={am}
          onChange={(e) => setAm(e.target.value)}
        />
        <TextField
          id="standard-basic"
          label="Fecha de Nacimiento"
          variant="standard"
          value={fechaNacimiento}
          onChange={(e) => setFechaNacimiento(e.target.value)}
        />
        <TextField
          id="standard-basic"
          label="Nombre Registro"
          variant="standard"
          value={cargo}
          onChange={(e) => setCargo(e.target.value)}
        />
        <TextField
          id="standard-basic"
          label="Fecha de Registro"
          variant="standard"
          value={fecharegistro}
          onChange={(e) => setFecharegistro(e.target.value)}
        />
        <Stack flexDirection={'row'} justifyContent={'space-evenly'}>
          <Button variant="contained" onClick={guardarPersonal}>
            Guardar
          </Button>
          <Button variant="contained">Cancelar</Button>
        </Stack>
      </Box>
    </Modal>
  );
}

export default function UserPage() {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    formik.handleReset();
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const [data, setData] = useState([]);

  const formik = useFormik({
    initialValues: {
      nombre: '',
      ap: '',
      am: '',
      ci: '',
      fnac: '',
      cargo: '',
      freg: '',
      submit: null,
    },
    validationSchema: Yup.object({
      nombre: Yup.string().min(3).max(50).required('Campo requerido.'),
      ap: Yup.string().max(50).required('Campo requerido.'),
      am: Yup.string().min(3).max(50),
      ci: Yup.string().max(9),
      fnac: Yup.string().required('Campo requerido.'),
      cargo: Yup.string().required('Campo requerido.'),
      freg: Yup.string().required('Campo requerido.'),
    }),
    onSubmit: async (valores, helpers) => {
      try {
        console.log('hola');
        const personal1 = {
          ID: 1,
          nombre: valores.nombre.toUpperCase(),
          ap: valores.ap.toUpperCase(),
          am: valores.am.toUpperCase(),
          ci: valores.ci,
          fechaNacimiento: valores.fnac,
          cargo: valores.cargo.toUpperCase(),
          fecharegistro: new Date(),
        };
        console.log(personal1);

        agregarPersonal(personal1)
          .then((aux) => {
            getlistaper()
              .then((aux) => {
                setData(aux);
              })
              .catch((error) => {
                console.error(error);
              });
          })
          .catch((error) => {
            console.error(error);
          });
      } catch (err) {
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: err.message });
        helpers.setSubmitting(false);
      }
    },
  });

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getlistaper();
        setData(response); // Assuming the response is an array
      } catch (error) {
        console.error(error);
      }
    }
    fetchData();
  }, []);

  return (
    <>
      <Helmet>
        <title> Rol </title>
      </Helmet>

      <Container>
        <Typography variant="h4" sx={{ mb: 5 }}>
          Roles
        </Typography>
        <Stack direction="row" alignItems="center" justifyContent="left" spacing={2}>
          <Button variant="contained" onClick={handleClickOpen}>
            Añadir Personal - Usuario
          </Button>
          <Button onClick={PDFpruebas}>Factura prueba</Button>
          <Modal
            keepMounted
            open={open}
            onClose={handleClose}
            aria-labelledby="keep-mounted-modal-title"
            aria-describedby="keep-mounted-modal-description"
          >
            <Box sx={style}>
              <h2 style={{ textAlign: 'center', margin: '0 auto' }}>Agregar Personal</h2>
              <Stack spacing={3}>
                <form noValidate onSubmit={formik.handleSubmit}>
                  <Stack spacing={3}>
                    <div>
                      <TextField
                        style={{ width: '49%' }}
                        error={!!(formik.touched.nombre && formik.errors.nombre)}
                        fullWidth
                        helperText={formik.touched.nombre && formik.errors.nombre}
                        label="Nombre"
                        name="nombre"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.nombre}
                      />
                    </div>
                    <TextField
                      error={!!(formik.touched.ap && formik.errors.ap)}
                      fullWidth
                      helperText={formik.touched.ap && formik.errors.ap}
                      label="Apellido Paterno"
                      name="ap"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.ap}
                    />

                    <TextField
                      style={{ width: '49%', marginRight: '2%' }}
                      error={!!(formik.touched.am && formik.errors.am)}
                      fullWidth
                      helperText={formik.touched.am && formik.errors.am}
                      label="Apellido Materno"
                      name="am"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.am}
                    />
                    <TextField
                      style={{ width: '49%' }}
                      error={!!(formik.touched.ci && formik.errors.ci)}
                      fullWidth
                      helperText={formik.touched.ci && formik.errors.ci}
                      label="Carnet"
                      name="ci"
                      type="number"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.ci}
                    />

                    <TextField
                      error={!!(formik.touched.fnac && formik.errors.fnac)}
                      fullWidth
                      helperText={formik.touched.fnac && formik.errors.fnac}
                      label="Fecha de Nacimiento"
                      name="fnac"
                      type="date"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.fnac}
                    />
                    <TextField
                      error={!!(formik.touched.cargo && formik.errors.cargo)}
                      fullWidth
                      helperText={formik.touched.cargo && formik.errors.cargo}
                      label="Cargo"
                      name="cargo"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.cargo}
                    />
                    <TextField
                      error={!!(formik.touched.freg && formik.errors.freg)}
                      fullWidth
                      helperText={formik.touched.freg && formik.errors.freg}
                      label="Fecha de Registro"
                      name="freg"
                      type="date"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.freg}
                    />
                  </Stack>
                  {formik.errors.submit && (
                    <Typography color="error" sx={{ mt: 3 }} variant="body2">
                      {formik.errors.submit}
                    </Typography>
                  )}

                  <Button type="submit"> Guardar </Button>
                  <Button onClick={handleClose}> Cancelar </Button>
                </form>
              </Stack>
              {formik.errors.submit && (
                <Typography color="error" sx={{ mt: 3 }} variant="body2">
                  {formik.errors.submit}
                </Typography>
              )}
            </Box>
          </Modal>
          <Button variant="contained">Añadir Rol</Button>
        </Stack>

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                {TABLE_HEAD.map((headCell) => (
                  <TableCell key={headCell.id}>{headCell.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((personal) => (
                <TableRow key={personal.id}>
                  <TableCell>{personal.nombre}</TableCell>
                  <TableCell>{personal.ap}</TableCell>
                  <TableCell>{personal.am}</TableCell>
                  <TableCell>{personal.ci}</TableCell>
                  <TableCell>{personal.fechaNacimiento}</TableCell>
                  <TableCell>{personal.cargo}</TableCell>
                  <TableCell>{personal.fecharegistro}</TableCell>

                  <TableCell>
                    <Button onClick={() => eliminarPersonal(personal.id)}>Eliminar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </>
  );
}
