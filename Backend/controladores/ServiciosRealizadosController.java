package com.example.servert.controladores;

import com.example.servert.dto.ServicioRealizadoDTO;
import com.example.servert.mapper.Mapper;
import com.example.servert.modelos.ServiciosRealizados;
import com.example.servert.modelos.DetalleServiciosRealizados;
import com.example.servert.modelos.Repuesto;
import com.example.servert.modelos.DetalleRepuestosServicios;
import com.example.servert.repositorios.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.transaction.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/historial")
public class ServiciosRealizadosController {

        @Autowired
        private RepoServiciosRealizados repoServicioRealizado;

        @Autowired
        private RepoVehiculo repoVehiculo;

        @Autowired
        private Repoempleado repoEmpleado;

        @Autowired
        private Reposervicio repoServicio;

        @Autowired
        private RepoRepuesto repoRepuesto;

        @PostMapping("/agregar")
        @Transactional
        public ServiciosRealizados crearServicioRealizado(@RequestBody ServicioRealizadoDTO dto) {
                System.out.println("📥 Datos recibidos del frontend:");
                System.out.println(dto);

                ServiciosRealizados servicioRealizado = Mapper.toServicioRealizadoEntity(dto);

                // 🔹 ASIGNAR VEHÍCULO Y EMPLEADO
                servicioRealizado.setVehiculo(
                                repoVehiculo.findById(dto.getVehiculo().getIdVehiculo())
                                                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado")));
                servicioRealizado.setEmpleado(
                                repoEmpleado.findById(dto.getEmpleado().getIdEmpleado())
                                                .orElseThrow(() -> new RuntimeException("Empleado no encontrado")));

                // 🔹 RELACIONAR DETALLES DE SERVICIOS
                if (servicioRealizado.getDetallesServicios() != null) {
                        for (DetalleServiciosRealizados detalle : servicioRealizado.getDetallesServicios()) {
                                detalle.setServiciosRealizados(servicioRealizado);
                                detalle.setServicio(
                                                repoServicio.findById(detalle.getServicio().getIdServicio())
                                                                .orElseThrow(() -> new RuntimeException(
                                                                                "Servicio no encontrado")));
                        }
                }

                // 🔹 RELACIONAR DETALLES DE REPUESTOS Y RESTAR STOCK
                if (servicioRealizado.getDetallesRepuestos() != null) {
                        for (DetalleRepuestosServicios detalle : servicioRealizado.getDetallesRepuestos()) {
                                detalle.setServiciosRealizados(servicioRealizado);

                                Repuesto repuesto = repoRepuesto.findById(detalle.getRepuesto().getIdRepuesto())
                                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                                "Repuesto no encontrado"));

                                int stockActual = repuesto.getCantidad() != null ? repuesto.getCantidad() : 0;
                                int cantidadUsada = detalle.getCantidad() != null ? detalle.getCantidad() : 0;
                                int nuevoStock = stockActual - cantidadUsada;

                                if (nuevoStock < 0) {
                                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                                        "Stock insuficiente para el repuesto: " + repuesto.getNombre());
                                }

                                repuesto.setCantidad(nuevoStock);
                                repoRepuesto.save(repuesto);

                                detalle.setRepuesto(repuesto);
                        }
                }

                ServiciosRealizados saved = repoServicioRealizado.save(servicioRealizado);
                repoServicioRealizado.flush();

                System.out.println(
                                "✅ ServicioRealizado guardado correctamente con ID: " + saved.getIdServicioRealizado());
                return saved;
        }

        @GetMapping("/listahistorial")
        public List<ServicioRealizadoDTO> listarServiciosRealizados() {
                return repoServicioRealizado.findAll()
                                .stream()
                                .map(Mapper::toServicioRealizadoDTO)
                                .collect(Collectors.toList());
        }

        @DeleteMapping("/eliminar/{id}")
        public void eliminarServicioRealizado(@PathVariable Integer id) {
                repoServicioRealizado.deleteById(id);
        }
}
