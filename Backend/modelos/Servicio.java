package com.example.servert.modelos;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "servicios")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "detalles", "detallesRealizados" })
public class Servicio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idServicio;

    private String tipoServicio;

    private BigDecimal costo;

    @JsonIgnore
    @OneToMany(mappedBy = "servicio", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<DetalleCotizaciones> detalles;

    @JsonIgnore
    @OneToMany(mappedBy = "servicio", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<DetalleServiciosRealizados> detallesRealizados;

    // Getters y Setters

    public Integer getIdServicio() {
        return idServicio;
    }

    public void setIdServicio(Integer idServicio) {
        this.idServicio = idServicio;
    }

    public String getTipoServicio() {
        return tipoServicio;
    }

    public void setTipoServicio(String tipoServicio) {
        this.tipoServicio = tipoServicio;
    }

    public BigDecimal getCosto() {
        return costo;
    }

    public void setCosto(BigDecimal costo) {
        this.costo = costo;
    }

    public Set<DetalleCotizaciones> getDetalles() {
        return detalles;
    }

    public void setDetalles(Set<DetalleCotizaciones> detalles) {
        this.detalles = detalles;
    }

    public Set<DetalleServiciosRealizados> getDetallesRealizados() {
        return detallesRealizados;
    }

    public void setDetallesRealizados(Set<DetalleServiciosRealizados> detallesRealizados) {
        this.detallesRealizados = detallesRealizados;
    }
}
