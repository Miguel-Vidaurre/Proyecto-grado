package com.example.servert.controladores;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.servert.modelos.Rol;
import com.example.servert.repositorios.RepoRol;

@CrossOrigin(origins = "*")
@RestController
public class RolController {
    @Autowired
    private RepoRol repoRol;

    // Obtener todos los roles
    @GetMapping("/listarroles")
    public List<Rol> listarRoles() {
        return repoRol.findAll();
    }

    // Crear un nuevo rol
    @PostMapping("/crear")
    public Rol crearRol(@RequestBody Rol rol) {
        return repoRol.save(rol);
    }

    // Actualizar un rol existente
    @PutMapping("/actualizar/{id}")
    public Rol actualizarRol(@PathVariable Integer id, @RequestBody Rol rolActualizado) {
        Rol rol = repoRol.findById(id).orElseThrow();
        rol.setNombre(rolActualizado.getNombre());
        rol.setDescripcion(rolActualizado.getDescripcion());
        rol.setEstado(rolActualizado.getEstado());
        return repoRol.save(rol);
    }

    // Eliminar un rol
    @DeleteMapping("/eliminar/{id}")
    public void eliminarRol(@PathVariable Integer id) {
        repoRol.deleteById(id);
    }
}
