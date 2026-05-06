package com.example.servert.controladores;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.Optional;
import java.util.HashSet;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.servert.dto.RolesUpdateRequest;
import com.example.servert.dto.UsuarioClienteRequest;
import com.example.servert.modelos.Cliente;
import com.example.servert.modelos.Empleado;
import com.example.servert.modelos.Rol;
import com.example.servert.modelos.Usuario;
import com.example.servert.repositorios.Repoempleado;
import com.example.servert.repositorios.Repousuario; // Assuming you have a repository for Usuario
import com.example.servert.repositorios.Repocliente;
import com.example.servert.servicios.UsuarioService;
import com.example.servert.repositorios.RepoRol;

@CrossOrigin(origins = "*")
@RestController
public class UsuarioController {

    @Autowired
    private Repousuario repoUsuario; // Repository for accessing user data

    @Autowired
    private RepoRol repoRol;

    @Autowired
    private Repoempleado repoEmpleado;

    @Autowired
    private Repocliente repoCliente;

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/usuario/login")
    public ResponseEntity<?> login(@RequestBody Usuario usuario) {
        System.out.println("Usuario recibido para login: " + usuario.getUsuario() + " / " + usuario.getPassword());
        Usuario usuarioBD = repoUsuario.findByUsuario(usuario.getUsuario());

        if (usuarioBD != null && usuarioBD.getPassword().equals(usuario.getPassword())) {
            Set<Rol> roles = usuarioBD.getRoles();
            System.out.println("Roles encontrados: " + roles.size());
            roles.forEach(r -> System.out.println("Rol: " + r.getNombre()));
            List<String> nombresRoles = roles.stream().map(Rol::getNombre).collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("usuario", usuarioBD.getUsuario());
            response.put("roles", nombresRoles);

            // Agregar datos del empleado si está presente
            if (usuarioBD.getEmpleado() != null) {
                Empleado empleado = usuarioBD.getEmpleado();
                Map<String, Object> empleadoData = new HashMap<>();
                empleadoData.put("idEmpleado", empleado.getIdEmpleado()); // 👈 AÑADIR ESTE CAMPO
                empleadoData.put("nombre", empleado.getNombre());
                empleadoData.put("apellido", empleado.getApellido());
                response.put("empleado", empleadoData);
            }

            // Agregar datos del cliente si está presente
            if (usuarioBD.getCliente() != null) {
                Cliente cliente = usuarioBD.getCliente();
                Map<String, Object> clienteData = new HashMap<>();
                clienteData.put("idCliente", cliente.getIdCliente()); // 👈 incluir ID
                clienteData.put("nombre", cliente.getNombre());
                clienteData.put("apellido", cliente.getApellido());
                response.put("cliente", clienteData);
            }

            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario o contraseña incorrectos");
        }
    }

    @GetMapping({ "/usuario/listausuario" })
    public List<Usuario> listaUsuario() {
        System.out.println();
        return (List<Usuario>) repoUsuario.findAll();
    }

    @GetMapping("/usuario/listaroles")
    public List<Rol> listarRoles() {
        return repoRol.findAll();
    }

    @PostMapping("/usuario/agregar")
    public ResponseEntity<?> agregarUsuario(@RequestBody Usuario usuario) {
        System.out.println("Usuario recibido: " + usuario);
        System.out.println("Empleado: " + usuario.getEmpleado());
        System.out.println("Roles: " + usuario.getRoles());
        try {
            // 1. Cargar empleado real por ID
            Integer idEmpleado = usuario.getEmpleado().getIdEmpleado();
            Empleado empleado = repoEmpleado.findById(idEmpleado)
                    .orElseThrow(() -> new RuntimeException("Empleado no encontrado con ID: " + idEmpleado));
            usuario.setEmpleado(empleado);

            // 2. Cargar roles reales por ID
            Set<Rol> rolesDesdeJson = usuario.getRoles();
            Set<Rol> rolesCompletos = new HashSet<>();
            for (Rol rol : rolesDesdeJson) {
                Integer idRol = rol.getIdRol();
                Rol rolReal = repoRol.findById(idRol)
                        .orElseThrow(() -> new RuntimeException("Rol no encontrado con ID: " + idRol));
                rolesCompletos.add(rolReal);
            }
            usuario.setRoles(rolesCompletos);

            // 3. Guardar usuario
            Usuario nuevoUsuario = repoUsuario.save(usuario);
            return ResponseEntity.ok(nuevoUsuario);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al crear usuario: " + e.getMessage());
        }
    }

    @PostMapping("/usuario/agregarCliente")
    public ResponseEntity<?> agregarUsuarioCliente(@RequestBody Usuario usuario) {
        System.out.println("Usuario recibido: " + usuario);
        System.out.println("Cliente: " + usuario.getCliente());
        System.out.println("Roles: " + usuario.getRoles());

        try {
            // 1. Cargar cliente real por ID si viene
            if (usuario.getCliente() != null) {
                Integer idCliente = usuario.getCliente().getIdCliente();
                Cliente cliente = repoCliente.findById(idCliente)
                        .orElseThrow(() -> new RuntimeException("Cliente no encontrado con ID: " + idCliente));

                usuario.setCliente(cliente);
            }

            // 2. Cargar roles reales por ID
            Set<Rol> rolesDesdeJson = usuario.getRoles();
            Set<Rol> rolesCompletos = new HashSet<>();
            for (Rol rol : rolesDesdeJson) {
                Integer idRol = rol.getIdRol();
                Rol rolReal = repoRol.findById(idRol)
                        .orElseThrow(() -> new RuntimeException("Rol no encontrado con ID: " + idRol));
                rolesCompletos.add(rolReal);
            }
            usuario.setRoles(rolesCompletos);

            // 3. Guardar usuario
            Usuario nuevoUsuario = repoUsuario.save(usuario);
            return ResponseEntity.ok(nuevoUsuario);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al crear usuario cliente: " + e.getMessage());
        }
    }

    @PutMapping("/usuario/actualizar-roles")
    public ResponseEntity<?> actualizarRoles(@RequestBody Map<String, Object> payload) {
        try {
            Integer idEmpleado = (Integer) payload.get("idEmpleado");
            List<Integer> rolesIds = (List<Integer>) payload.get("roles");

            String mensaje = usuarioService.actualizarRoles(idEmpleado, rolesIds);
            return ResponseEntity.ok(mensaje);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al actualizar roles: " + e.getMessage());
        }
    }

    @GetMapping("/usuario/buscar-por-nombrebase/{nombreBase}")
    public ResponseEntity<List<Usuario>> buscarUsuariosPorNombreBase(@PathVariable String nombreBase) {
        List<Usuario> usuarios = repoUsuario.findByUsuarioStartingWithIgnoreCase(nombreBase);
        return ResponseEntity.ok(usuarios);
    }

    @GetMapping("/usuario/count-por-nombrebase/{nombreBase}")
    public ResponseEntity<Integer> contarUsuariosPorNombreBase(@PathVariable String nombreBase) {
        int count = repoUsuario.countByUsuarioStartingWithIgnoreCase(nombreBase);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/usuario/sugerir-nombre")
    public ResponseEntity<String> sugerirNombre(@RequestParam String base) {
        try {
            String nombreSugerido = usuarioService.sugerirNombreDisponible(base.toLowerCase());
            return ResponseEntity.ok(nombreSugerido);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al sugerir nombre: " + e.getMessage());
        }
    }

    @PostMapping("/usuario/agregar-cliente")
    public ResponseEntity<?> asignarUsuarioCliente(@RequestBody UsuarioClienteRequest request) {
        System.out.println("Asignando usuario cliente: " + request.getUsuario());
        System.out.println("Cliente ID recibido: " + request.getIdCliente());
        System.out.println("Roles recibidos: " + request.getRolesIds());

        // Crear la entidad Usuario
        Usuario usuario = new Usuario();
        usuario.setUsuario(request.getUsuario());
        usuario.setPassword(request.getPassword());

        // Asociar el cliente
        Cliente cliente = new Cliente();
        cliente.setIdCliente(request.getIdCliente());
        usuario.setCliente(cliente);

        // Asociar los roles
        Set<Rol> roles = request.getRolesIds().stream()
                .map(idRol -> {
                    Rol rol = new Rol();
                    rol.setIdRol(idRol);
                    System.out.println("Preparando rol con ID: " + idRol);
                    return rol;
                })
                .collect(Collectors.toSet());

        usuario.setRoles(roles);

        // Mensaje previo a guardar
        System.out.println("Usuario listo para guardar: " + usuario.getUsuario());
        System.out.println(
                "Cliente asociado: " + (usuario.getCliente() != null ? usuario.getCliente().getIdCliente() : "null"));
        System.out.println("Roles asociados: " + usuario.getRoles().stream().map(Rol::getIdRol).toList());

        // Guardar en la BD
        Usuario nuevoUsuario = usuarioService.asignarUsuarioCliente(usuario);

        System.out.println("Usuario guardado con ID: " + nuevoUsuario.getIdUsuario());
        if (nuevoUsuario.getCliente() != null) {
            System.out.println("Cliente final asociado: " + nuevoUsuario.getCliente().getIdCliente());
        }
        System.out.println("Roles finales asignados: " + nuevoUsuario.getRoles().stream().map(Rol::getIdRol).toList());

        return ResponseEntity.ok(nuevoUsuario);
    }
}
