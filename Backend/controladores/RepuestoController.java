package com.example.servert.controladores;

import com.example.servert.dto.RepuestoDTO;
import com.example.servert.modelos.Marca;
import com.example.servert.modelos.Repuesto;
import com.example.servert.repositorios.RepoMarca;
import com.example.servert.repositorios.RepoRepuesto;
import com.example.servert.servicios.RepuestoService;
import com.example.servert.mapper.Mapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/repuesto")
public class RepuestoController {

    @Autowired
    private RepoRepuesto repoRepuesto;

    @Autowired
    private RepoMarca repoMarca;

    @Autowired
    private RepuestoService repuestoService;

    @PostMapping("/agregar")
    public Repuesto agregarRepuesto(@RequestBody Repuesto repuesto) {
        if (repuesto.getMarca() == null || repuesto.getMarca().getId() == null) {
            throw new RuntimeException("La marca es obligatoria");
        }

        Integer marcaId = repuesto.getMarca().getId();
        Marca marca = repoMarca.findById(marcaId)
                .orElseThrow(() -> new RuntimeException("Marca no encontrada"));

        repuesto.setMarca(marca);

        repuesto.setCategoria(repuestoService.clasificarCategoria(repuesto.getNombre()));

        return repoRepuesto.save(repuesto);
    }

    @GetMapping("/lista")
    public ResponseEntity<List<RepuestoDTO>> listarRepuestos() {
        List<Repuesto> repuestos = repoRepuesto.findAll();

        // 🔹 Asignar categoría calculada antes de mapear a DTO
        repuestos.forEach(r -> {
            String categoria = repuestoService.clasificarCategoria(r.getNombre());
            r.setCategoria(categoria);

        });

        List<RepuestoDTO> repuestosDTO = repuestos.stream()
                .map(Mapper::toRepuestoDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(repuestosDTO);
    }

    @GetMapping("/{id}")
    public Repuesto obtenerRepuesto(@PathVariable Integer id) {
        return repoRepuesto.findById(id)
                .orElseThrow(() -> new RuntimeException("Repuesto no encontrado"));
    }

    @PutMapping("/modificar")
    public Repuesto modificarRepuesto(@RequestBody Repuesto repuestoDatos) {
        Repuesto repuesto = repoRepuesto.findById(repuestoDatos.getIdRepuesto())
                .orElseThrow(() -> new RuntimeException("Repuesto no encontrado"));

        repuesto.setNombre(repuestoDatos.getNombre());
        repuesto.setDescripcion(repuestoDatos.getDescripcion());
        repuesto.setPrecio(repuestoDatos.getPrecio());
        repuesto.setCantidad(repuestoDatos.getCantidad());
        repuesto.setEstado(repuestoDatos.getEstado());
        repuesto.setMarca(repuestoDatos.getMarca());

        repuesto.setCategoria(repuestoService.clasificarCategoria(repuesto.getNombre()));

        return repoRepuesto.save(repuesto);
    }

    @DeleteMapping("/eliminar/{id}")
    public void eliminarRepuesto(@PathVariable Integer id) {
        repoRepuesto.deleteById(id);
    }
}