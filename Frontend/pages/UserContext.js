import { createContext, useState, useEffect } from 'react';

// Crear el contexto
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem('usuario');
    if (storedUser && storedUser !== 'undefined') {
      try {
        setUsuario(JSON.parse(storedUser));
      } catch (e) {
        console.error('⚠️ Error parseando usuario desde localStorage:', e);
        localStorage.removeItem('usuario'); // limpiamos si está corrupto
        setUsuario(null);
      }
    }
  }, []);

  const actualizarUsuario = (nuevoUsuario) => {
    if (nuevoUsuario) {
      setUsuario(nuevoUsuario);
      localStorage.setItem('usuario', JSON.stringify(nuevoUsuario));
    } else {
      setUsuario(null);
      localStorage.removeItem('usuario');
    }
  };

  return <UserContext.Provider value={{ usuario, actualizarUsuario }}>{children}</UserContext.Provider>;
};
