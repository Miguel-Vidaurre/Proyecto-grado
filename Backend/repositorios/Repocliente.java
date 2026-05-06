package com.example.servert.repositorios;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.example.servert.modelos.Cliente;
import com.example.servert.modelos.Usuario;

@CrossOrigin(origins = "*")
public interface Repocliente extends JpaRepository<Cliente, Integer> {

    boolean existsByCarnet(String carnet);

    @Query("SELECT c.usuario FROM Cliente c WHERE c = :cliente")
    Optional<Usuario> findUsuarioByCliente(@Param("cliente") Cliente cliente);

}
