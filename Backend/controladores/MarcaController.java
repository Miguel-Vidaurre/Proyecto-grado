package com.example.servert.controladores;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.servert.modelos.Marca;
import com.example.servert.repositorios.RepoMarca;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/marca")
public class MarcaController {
    @Autowired
    public RepoMarca RepoMarca;

    // 🟢 Listar todas las marcas
    @GetMapping("/lista")
    public List<Marca> listarMarcas() {
        return (List<Marca>) RepoMarca.findAll();
    }

    // 🟢 Agregar nueva marca
    @PostMapping("/agregar")
    public Marca agregarMarca(@RequestBody Marca marca) {
        return RepoMarca.save(marca);
    }

    // 🟡 Modificar marca existente
    @PutMapping("/modificar")
    public Marca modificarMarca(@RequestBody Marca marca) {
        return RepoMarca.save(marca);
    }

    // 🔴 Eliminar marca por ID
    @DeleteMapping("/eliminar/{id}")
    public void eliminarMarca(@PathVariable Integer id) {
        RepoMarca.deleteById(id);
    }

    // 🟡 Buscar por ID (opcional)
    @GetMapping("/{id}")
    public Optional<Marca> buscarPorId(@PathVariable Integer id) {
        return RepoMarca.findById(id);
    }
}
