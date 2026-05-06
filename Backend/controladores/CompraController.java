package com.example.servert.controladores;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.servert.dto.CompraDTO;
import com.example.servert.repositorios.Repocompra;
import com.example.servert.servicios.CompraService;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/compra")
public class CompraController {

    @Autowired
    private CompraService compraService;

    @PostMapping("/agregar")
    public ResponseEntity<?> registrarCompra(@RequestBody CompraDTO compraDTO) {
        compraService.registrarCompra(compraDTO);
        return ResponseEntity.ok("Compra registrada exitosamente");
    }

    @GetMapping("/listar")
    public ResponseEntity<List<CompraDTO>> listarCompras() {
        List<CompraDTO> compras = compraService.listarCompras();
        return ResponseEntity.ok(compras);
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminarCompra(@PathVariable Integer id) {
        compraService.eliminarCompra(id);
        return ResponseEntity.noContent().build(); // 204 sin contenido
    }
}