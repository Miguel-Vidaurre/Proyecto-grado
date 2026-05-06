package com.example.servert.repositorios;

import org.springframework.data.repository.CrudRepository;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.example.servert.modelos.Compra;

@CrossOrigin(origins = "*")
public interface Repocompra extends CrudRepository<Compra, Integer> {

}
