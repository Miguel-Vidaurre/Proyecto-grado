package com.example.servert.modelos;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "detalle_servicios_realizados")
public class DetalleServiciosRealizados {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idDetalleServiciosRealizados;

    private Integer cantidad;

    private BigDecimal subtotal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idServicio")
    private Servicio servicio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idServiciosRealizados")
    private ServiciosRealizados serviciosRealizados;

    // Getters y Setters

    public Integer getIdDetalleServiciosRealizados() {
        return idDetalleServiciosRealizados;
    }

    public void setIdDetalleServiciosRealizados(Integer idDetalleServiciosRealizados) {
        this.idDetalleServiciosRealizados = idDetalleServiciosRealizados;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public Servicio getServicio() {
        return servicio;
    }

    public void setServicio(Servicio servicio) {
        this.servicio = servicio;
    }

    public ServiciosRealizados getServiciosRealizados() {
        return serviciosRealizados;
    }

    public void setServiciosRealizados(ServiciosRealizados serviciosRealizados) {
        this.serviciosRealizados = serviciosRealizados;
    }
}
