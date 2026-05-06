package com.example.servert.controladores;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.servert.dto.CotizacionDTO;
import com.example.servert.mapper.Mapper;
import com.example.servert.modelos.Cotizacion;
import com.example.servert.repositorios.Repocotizacion;

import jakarta.transaction.Transactional;

@CrossOrigin(origins = "*")
@RestController
public class CotizacionController {

    @Autowired
    public Repocotizacion RepoCot;

    @Autowired
    private com.example.servert.repositorios.Repocliente repoCliente;

    @Autowired
    private com.example.servert.repositorios.Repoempleado repoEmpleado;

    @GetMapping("/cotizacion/listacotizacion")
    public List<CotizacionDTO> listarCotizaciones() {
        Iterable<Cotizacion> cotizacionesIterable = RepoCot.findAll();

        List<Cotizacion> cotizaciones = StreamSupport.stream(cotizacionesIterable.spliterator(), false)
                .collect(Collectors.toList());

        return cotizaciones.stream()
                .map(Mapper::toCotizacionDTO)
                .collect(Collectors.toList());
    }

    @PostMapping("/cotizacion/agregar")
    @Transactional
    public Cotizacion agregarCotizacion(@RequestBody CotizacionDTO cotizacionDTO) {
        Cotizacion cotizacion = Mapper.toCotizacionEntity(cotizacionDTO);

        // Asignar cliente desde la BD
        cotizacion.setCliente(repoCliente.findById(cotizacionDTO.getCliente().getIdCliente())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado")));

        // Asignar empleado desde la BD
        cotizacion.setEmpleado(repoEmpleado.findById(cotizacionDTO.getEmpleado().getIdEmpleado())
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado")));

        // Asignar cotización a cada detalle
        if (cotizacion.getDetalles() != null) {
            cotizacion.getDetalles().forEach(detalle -> detalle.setCotizacion(cotizacion));
        }

        Cotizacion guardada = RepoCot.save(cotizacion);
        return guardada;
    }

    @PutMapping("/cotizacion/modificar")
    public void modificarCotizacion(@RequestBody Cotizacion cotizacion) {
        RepoCot.save(cotizacion);
    }

    @DeleteMapping("/cotizacion/eliminar/{id}")
    public void eliminarCotizacion(@PathVariable Integer id) {
        RepoCot.deleteById(id);
    }
}
