package com.example.servert.modelos;

import java.time.LocalDate;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.*;

@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "detalles" })
@Entity
@Table(name = "cotizaciones")
public class Cotizacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idCotizacion;

    private LocalDate fechaCotizacion;

    private BigDecimal totalCotizacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idEmpleado")
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Empleado empleado;

    @ManyToOne
    @JoinColumn(name = "idCliente")
    @JsonBackReference
    private Cliente cliente;

    @OneToMany(mappedBy = "cotizacion", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private Set<DetalleCotizaciones> detalles;

    // Getters y setters

    public Integer getIdCotizacion() {
        return idCotizacion;
    }

    public void setIdCotizacion(Integer idCotizacion) {
        this.idCotizacion = idCotizacion;
    }

    public LocalDate getFechaCotizacion() {
        return fechaCotizacion;
    }

    public void setFechaCotizacion(LocalDate fechaCotizacion) {
        this.fechaCotizacion = fechaCotizacion;
    }

    public BigDecimal getTotalCotizacion() {
        return totalCotizacion;
    }

    public void setTotalCotizacion(BigDecimal totalCotizacion) {
        this.totalCotizacion = totalCotizacion;
    }

    public Empleado getEmpleado() {
        return empleado;
    }

    public void setEmpleado(Empleado empleado) {
        this.empleado = empleado;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public Set<DetalleCotizaciones> getDetalles() {
        return detalles;
    }

    public void setDetalles(Set<DetalleCotizaciones> detalles) {
        this.detalles = detalles;
    }

}
