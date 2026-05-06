package com.example.servert;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.example.servert.modelos.Rol;
import com.example.servert.modelos.Usuario;
import com.example.servert.repositorios.RepoRol;
import com.example.servert.repositorios.Repousuario;

@Component
public class DataInitializer implements CommandLineRunner {
    @Autowired
    private RepoRol rolRepository; // Asegúrate de tener un repositorio para Rol

    @Autowired
    private Repousuario usuarioRepository;

    @Override
    public void run(String... args) throws Exception {
        // Insertar roles por defecto si no existen
        if (!rolRepository.existsByNombre("ADMINISTRADOR")) {
            Rol rolAdmin = new Rol();
            rolAdmin.setNombre("ADMINISTRADOR");
            rolAdmin.setDescripcion("Acceso total al sistema");
            rolAdmin.setEstado(true);
            rolRepository.save(rolAdmin);
        }

        if (!rolRepository.existsByNombre("SECRETARIA")) {
            Rol rolSecretaria = new Rol();
            rolSecretaria.setNombre("SECRETARIA");
            rolSecretaria.setDescripcion("Gestión de clientes, cotizaciones y facturas");
            rolSecretaria.setEstado(true);
            rolRepository.save(rolSecretaria);
        }

        if (!rolRepository.existsByNombre("MECANICO")) {
            Rol rolMecanico = new Rol();
            rolMecanico.setNombre("MECANICO");
            rolMecanico.setDescripcion("Gestión de servicios y reparaciones");
            rolMecanico.setEstado(true);
            rolRepository.save(rolMecanico);
        }

        if (!rolRepository.existsByNombre("CLIENTE")) {
            Rol rolCliente = new Rol();
            rolCliente.setNombre("CLIENTE");
            rolCliente.setDescripcion("Acceso limitado para ver historial y facturas");
            rolCliente.setEstado(true);
            rolRepository.save(rolCliente);
        }

        // Verificar si el usuario ya existe
        if (!usuarioRepository.existsByUsuario("user")) {
            Rol adminRole = rolRepository.findByNombre("ADMINISTRADOR");

            if (adminRole != null) {
                Usuario usuario = new Usuario("user", "12345");
                usuario.getRoles().add(adminRole); // agregar el rol al conjunto de roles
                usuarioRepository.save(usuario);
            } else {
                System.out.println("El rol ADMINISTRADOR no existe en la base de datos.");
            }
        }
    }
}
