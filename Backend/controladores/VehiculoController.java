package com.example.servert.controladores;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.Map;

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

import com.example.servert.modelos.Vehiculos;
import com.example.servert.repositorios.RepoVehiculo;
import com.example.servert.servicios.VehiculoService;

import jakarta.transaction.Transactional;

@CrossOrigin(origins = "*")
@RestController
public class VehiculoController {

    @Autowired
    public RepoVehiculo Repovehi;

    @Autowired
    private VehiculoService vehiculoService;

    @GetMapping({ "/vehiculo/listavehiculo" })
    public List<Vehiculos> listaSocios() {
        return (List<Vehiculos>) Repovehi.findAll();
    }

    // Codigo recopilado
    @Transactional
    @PostMapping("/vehiculo/agregar")
    public int agregarVehiculo(@RequestBody Vehiculos vehiculo) {
        Repovehi.save(vehiculo);
        System.out.println("estoy aqui..." + vehiculo.getMarca());
        return 1;
    }

    @PutMapping("/vehiculo/modificar")
    public ResponseEntity<Vehiculos> modificarVehiculo(@RequestBody Vehiculos vehiculo) {
        Optional<Vehiculos> existing = Repovehi.findById(vehiculo.getIdVehiculo());
        if (!existing.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Vehiculos v = existing.get();
        v.setCliente(vehiculo.getCliente());
        v.setPlaca(vehiculo.getPlaca());
        v.setMarca(vehiculo.getMarca());
        v.setModelo(vehiculo.getModelo());
        v.setTipo(vehiculo.getTipo());
        v.setFechaRegistro(vehiculo.getFechaRegistro());

        Repovehi.save(v);
        return ResponseEntity.ok(v);
    }

    @DeleteMapping("/vehiculo/eliminar/{id}")
    public void eliminarVehiculo(@PathVariable Integer id) {
        Repovehi.deleteById(id);
    }

    @GetMapping("/vehiculo/verificar/{placa}")
    public ResponseEntity<Map<String, Boolean>> verificarplaca(@PathVariable String placa) {
        boolean existe = Repovehi.existsByPlacaIgnoreCase(placa);
        return ResponseEntity.ok(Collections.singletonMap("existe", existe));
    }

}
