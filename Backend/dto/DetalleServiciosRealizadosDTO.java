package com.example.servert.dto;

import java.math.BigDecimal;

public class DetalleServiciosRealizadosDTO {
    private ServicioDTO servicio;
    private Integer cantidad;
    private BigDecimal subtotal;

    // Getters y Setters
    public ServicioDTO getServicio() {
        return servicio;
    }

    public void setServicio(ServicioDTO servicio) {
        this.servicio = servicio;
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

    @Override
    public String toString() {
        return "DetalleServiciosRealizadosDTO{" +
                "servicio=" + (servicio != null ? servicio.getIdServicio() : "null") +
                ", cantidad=" + cantidad +
                ", subtotal=" + subtotal +
                '}';
    }
}
