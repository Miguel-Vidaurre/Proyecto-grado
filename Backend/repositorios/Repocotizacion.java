package com.example.servert.repositorios;

import org.springframework.data.repository.CrudRepository;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.example.servert.modelos.Cotizacion;

@CrossOrigin(origins = "*")
public interface Repocotizacion extends CrudRepository<Cotizacion, Integer> {

}
