package com.example.servert.modelos;

import java.sql.Date;
import java.time.LocalDate;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "vehiculos")
public class Vehiculos {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idVehiculo;

    @Column(unique = true, nullable = false)
    private String placa;

    private String marca;

    private String modelo;

    private String tipo;

    private LocalDate fechaRegistro;

    // Relación muchos a uno con Cliente
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "idCliente")
    @JsonIgnoreProperties({ "vehiculos", "cotizaciones", "usuario" }) // Ignorar campos para evitar ciclos
    private Cliente cliente;

    @JsonIgnore
    @OneToMany(mappedBy = "vehiculo", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ServiciosRealizados> serviciosRealizados;

    public Integer getIdVehiculo() {
        return idVehiculo;
    }

    public void setIdVehiculo(Integer idVehiculo) {
        this.idVehiculo = idVehiculo;
    }

    public String getPlaca() {
        return placa;
    }

    public void setPlaca(String placa) {
        this.placa = placa;
    }

    public String getMarca() {
        return marca;
    }

    public void setMarca(String marca) {
        this.marca = marca;
    }

    public String getModelo() {
        return modelo;
    }

    public void setModelo(String modelo) {
        this.modelo = modelo;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public LocalDate getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(LocalDate fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public Set<ServiciosRealizados> getServiciosRealizados() {
        return serviciosRealizados;
    }

    public void setServiciosRealizados(Set<ServiciosRealizados> serviciosRealizados) {
        this.serviciosRealizados = serviciosRealizados;
    }

}
