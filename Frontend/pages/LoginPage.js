import { Helmet } from 'react-helmet-async';
import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Typography, Box } from '@mui/material';
import { LoginForm } from '../sections/auth/login';
import { UserContext } from './UserContext'; // Asegúrate de la ruta correcta

// ----------------------------------------------------------------------

const StyledRoot = styled(Box)({
  position: 'relative',
  width: '100%',
  height: '100vh',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#f9f9f9',
});

const BackgroundImage = styled('img')({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  opacity: 0.2,
  zIndex: 0,
});

const StyledContent = styled(Box)(({ theme }) => ({
  zIndex: 1,
  width: '100%',
  maxWidth: 480,
  padding: theme.spacing(4),
  backgroundColor: 'rgba(255, 255, 255, 0.85)',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[3],
  textAlign: 'center',
}));

// ----------------------------------------------------------------------

export default function LoginPage() {
  const navigate = useNavigate();
  const { usuario } = useContext(UserContext);

  // Si ya hay usuario logueado, redirigir al dashboard
  useEffect(() => {
    if (usuario) {
      navigate('/dashboard/app', { replace: true });
    }
  }, [usuario, navigate]);

  return (
    <>
      <Helmet>
        <title>Login</title>
      </Helmet>

      <StyledRoot>
        <BackgroundImage src="/assets/logo.jpg" alt="Fondo Logo" />

        <StyledContent>
          <Typography variant="h4" gutterBottom>
            Taller Mecatrónica Vedia
          </Typography>

          <LoginForm />
        </StyledContent>
      </StyledRoot>
    </>
  );
}
