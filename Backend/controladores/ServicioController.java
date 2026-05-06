package com.example.servert.controladores;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.servert.modelos.Servicio;
import com.example.servert.repositorios.Reposervicio;
import com.example.servert.servicios.ServicioService;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/servicio")
public class ServicioController {

    @Autowired
    private Reposervicio repoServicio;

    @Autowired
    private ServicioService servicioservice;

    @GetMapping("/listar")
    public List<Servicio> listarServicios() {
        return (List<Servicio>) repoServicio.findAll();
    }

    // ➕ Agregar un nuevo servicio
    @PostMapping("/agregar")
    public Servicio agregarServicio(@RequestBody Servicio servicio) {
        return repoServicio.save(servicio);
    }

    // ✏️ Modificar un servicio existente
    @PutMapping("/modificar")
    public Servicio modificarServicio(@RequestBody Servicio servicio) {
        return repoServicio.save(servicio);
    }

    // ❌ Eliminar un servicio por ID
    @DeleteMapping("/eliminar/{id}")
    public void eliminarServicio(@PathVariable Integer id) {
        repoServicio.deleteById(id);
    }

    @GetMapping("/verificar/{descripcion}")
    public ResponseEntity<Boolean> verificarDescripcion(@PathVariable String descripcion) {
        boolean existe = servicioservice.existeDescripcion(descripcion.toUpperCase());
        return ResponseEntity.ok(existe);
    }
}
