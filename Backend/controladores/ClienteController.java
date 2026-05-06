package com.example.servert.controladores;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import org.springframework.beans.factory.annotation.Autowired;
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

import com.example.servert.dto.ClienteDTO;
import com.example.servert.dto.EmpleadoConRolesDTO;
import com.example.servert.dto.UsuarioDTO;
import com.example.servert.modelos.Cliente;
import com.example.servert.repositorios.Repocliente;
import com.example.servert.repositorios.Repoempleado;
import com.example.servert.servicios.ClienteService;

import jakarta.transaction.Transactional;

@CrossOrigin(origins = "*")
@RestController
public class ClienteController {

    @Autowired
    public Repocliente Repocli;

    @Autowired
    private ClienteService clienteService;

    @GetMapping("/cliente/listacliente")
    public List<ClienteDTO> listaClientes() {
        return Repocli.findAll().stream().map(cliente -> {
            ClienteDTO dto = new ClienteDTO();
            dto.setIdCliente(cliente.getIdCliente());
            dto.setNombre(cliente.getNombre());
            dto.setApellido(cliente.getApellido());
            dto.setCarnet(cliente.getCarnet());
            dto.setTelefono(cliente.getTelefono());
            dto.setEmail(cliente.getEmail());
            dto.setNit(cliente.getNit());

            if (cliente.getUsuario() != null) {
                UsuarioDTO usuarioDTO = new UsuarioDTO();
                usuarioDTO.setIdUsuario(cliente.getUsuario().getIdUsuario());
                usuarioDTO.setUsuario(cliente.getUsuario().getUsuario());

                // ✅ Mapeamos los roles usando UsuarioDTO.RolDTO
                usuarioDTO.setRoles(
                        cliente.getUsuario().getRoles().stream()
                                .map(rol -> {
                                    UsuarioDTO.RolDTO r = new UsuarioDTO.RolDTO();
                                    r.setIdRol(rol.getIdRol());
                                    r.setNombre(rol.getNombre());
                                    return r;
                                })
                                .collect(Collectors.toSet()));

                dto.setUsuario(usuarioDTO);
            }

            return dto;
        }).collect(Collectors.toList());
    }

    // Codigo recopilado
    @Transactional
    @PostMapping("/cliente/agregar")
    public int agregarCliente(@RequestBody Cliente cliente) {
        System.out.println("estoy aqui..." + cliente.getNombre());
        Repocli.save(cliente);
        return 1;
    }

    @GetMapping("/cliente/verificar-carnet/{carnet}")
    public ResponseEntity<Map<String, Boolean>> verificarCarnet(@PathVariable String carnet) {
        boolean existe = Repocli.existsByCarnet(carnet);
        return ResponseEntity.ok(Collections.singletonMap("existe", existe));
    }

    @PutMapping("/cliente/modificar")
    public ResponseEntity<Cliente> modificarCliente(@RequestBody ClienteDTO clienteDTO) {
        Cliente actualizado = clienteService.actualizarCliente(clienteDTO);
        return ResponseEntity.ok(actualizado);
    }

    @DeleteMapping("/cliente/eliminar/{id}")
    public ResponseEntity<?> eliminarCliente(@PathVariable Integer id) {
        try {
            clienteService.eliminarClienteConUsuarioYVehiculos(id);
            return ResponseEntity.ok("Cliente, usuario, roles y vehículos eliminados correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al eliminar: " + e.getMessage());
        }
    }
}
