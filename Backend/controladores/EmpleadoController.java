package com.example.servert.controladores;

import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.servert.dto.EmpleadoConRolesDTO;
import com.example.servert.dto.EmpleadoConRolesDTO.RolDTO;
import com.example.servert.modelos.Empleado;
import com.example.servert.modelos.Usuario;
import com.example.servert.repositorios.Repoempleado;
import com.example.servert.servicios.EmpleadoService;

import jakarta.transaction.Transactional;

@CrossOrigin(origins = "*")
@RestController
public class EmpleadoController {

    @Autowired
    public Repoempleado Repoempleado;

    @Autowired
    private EmpleadoService empleadoService;

    @GetMapping("/empleado/listaempleado")
    public List<EmpleadoConRolesDTO> listaSocios() {
        List<Empleado> empleados = (List<Empleado>) Repoempleado.findAll();
        return empleados.stream()
                .map(this::convertirEmpleado)
                .collect(Collectors.toList());
    }

    @Transactional
    @PostMapping("/empleado/agregar")
    public ResponseEntity<?> agregarEmpleado(@RequestBody Empleado empleado) {
        try {
            empleadoService.guardarEmpleado(empleado);
            return ResponseEntity.ok("Empleado registrado correctamente");
        } catch (DataIntegrityViolationException ex) {
            // Esto ocurre cuando intentas insertar un carnet duplicado
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("El carnet ya está registrado");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al registrar el empleado: " + e.getMessage());
        }
    }

    @GetMapping("/verificar-carnet/{carnet}")
    public ResponseEntity<Map<String, Boolean>> verificarCarnet(@PathVariable String carnet) {
        boolean existe = Repoempleado.existsByCarnet(carnet);
        return ResponseEntity.ok(Collections.singletonMap("existe", existe));
    }

    @PutMapping("/empleado/modificar")
    public ResponseEntity<?> modificarEmpleado(@RequestBody Empleado empleado) {
        try {
            empleadoService.modificarEmpleado(empleado);
            return ResponseEntity.ok("Empleado modificado correctamente");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/empleado/eliminar/{id}")
    public ResponseEntity<?> eliminarEmpleado(@PathVariable Integer id) {
        try {
            empleadoService.eliminarEmpleadoConUsuarioYRoles(id);
            return ResponseEntity.ok("Empleado y usuario eliminados correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar: " + e.getMessage());
        }
    }

    private EmpleadoConRolesDTO convertirEmpleado(Empleado e) {
        EmpleadoConRolesDTO dto = new EmpleadoConRolesDTO();

        dto.setIdEmpleado(e.getIdEmpleado());
        dto.setNombre(e.getNombre());
        dto.setApellido(e.getApellido());
        dto.setCarnet(e.getCarnet());
        dto.setDireccion(e.getDireccion());
        dto.setTelefono(e.getTelefono());
        dto.setHoraEntrada1(e.getHoraEntrada1());
        dto.setHoraSalida1(e.getHoraSalida1());
        dto.setHoraEntrada2(e.getHoraEntrada2());
        dto.setHoraSalida2(e.getHoraSalida2());

        if (e.getUsuarios() != null && !e.getUsuarios().isEmpty()) {
            Usuario primerUsuario = e.getUsuarios().iterator().next();
            dto.setNombreUsuario(primerUsuario.getUsuario());

            List<EmpleadoConRolesDTO.RolDTO> rolesDTO = primerUsuario.getRoles().stream()
                    .map(r -> new EmpleadoConRolesDTO.RolDTO(r.getIdRol(), r.getNombre()))
                    .toList();

            dto.setRoles(rolesDTO);
        } else {
            dto.setRoles(List.of());
            dto.setNombreUsuario(null);
        }

        return dto;
    }
}
