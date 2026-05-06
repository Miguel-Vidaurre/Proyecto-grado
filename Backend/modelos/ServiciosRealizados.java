package com.example.servert.modelos;

import java.sql.Date;
import java.time.LocalDate;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.math.BigDecimal;

import jakarta.persistence.*;

@Entity
@Table(name = "servicios_realizados")
public class ServiciosRealizados {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer IdServicioRealizado;

    private LocalDate fecha;

    private BigDecimal total;

    private BigDecimal descuento;

    @JsonIgnore
    // Relación muchos a uno con Empleado
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idEmpleado")
    private Empleado empleado;

    @JsonIgnore
    // Relación muchos a uno con Vehiculo
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idVehiculo")
    private Vehiculos vehiculo;

    @JsonIgnore
    @OneToMany(mappedBy = "serviciosRealizados", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<DetalleServiciosRealizados> detallesServicios;

    @JsonIgnore
    @OneToMany(mappedBy = "serviciosRealizados", cascade = CascadeType.ALL)
    private Set<DetalleRepuestosServicios> detallesRepuestos;

    // Getters y Setters
    public Integer getIdServicioRealizado() {
        return IdServicioRealizado;
    }

    public void setIdServicioRealizado(Integer idServicioRealizado) {
        IdServicioRealizado = idServicioRealizado;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public BigDecimal getDescuento() {
        return descuento;
    }

    public void setDescuento(BigDecimal descuento) {
        this.descuento = descuento;
    }

    public Empleado getEmpleado() {
        return empleado;
    }

    public void setEmpleado(Empleado empleado) {
        this.empleado = empleado;
    }

    public Vehiculos getVehiculo() {
        return vehiculo;
    }

    public void setVehiculo(Vehiculos vehiculo) {
        this.vehiculo = vehiculo;
    }

    public Set<DetalleServiciosRealizados> getDetallesServicios() {
        return detallesServicios;
    }

    public void setDetallesServicios(Set<DetalleServiciosRealizados> detallesServicios) {
        this.detallesServicios = detallesServicios;
    }

    public Set<DetalleRepuestosServicios> getDetallesRepuestos() {
        return detallesRepuestos;
    }

    public void setDetallesRepuestos(Set<DetalleRepuestosServicios> detallesRepuestos) {
        this.detallesRepuestos = detallesRepuestos;
    }

}
