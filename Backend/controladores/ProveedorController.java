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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.servert.modelos.Proveedor;
import com.example.servert.repositorios.Repoproveedor;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/proveedor")
public class ProveedorController {

    @Autowired
    public Repoproveedor Repoproveedor;

    @GetMapping("/lista")
    public List<Proveedor> listarProveedor() {
        return (List<Proveedor>) Repoproveedor.findAll();
    }

    @PostMapping("/agregar")
    public Proveedor agregarProveedor(@RequestBody Proveedor proveedor) {
        return Repoproveedor.save(proveedor);
    }

    @PutMapping("/modificar")
    public Proveedor modificarProveedor(@RequestBody Proveedor proveedor) {
        return Repoproveedor.save(proveedor);
    }

    @DeleteMapping("/eliminar/{id}")
    public void eliminarProveedor(@PathVariable Integer id) {
        Repoproveedor.deleteById(id);
    }
}
