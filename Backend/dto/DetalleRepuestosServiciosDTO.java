package com.example.servert.dto;

import java.math.BigDecimal;

public class DetalleRepuestosServiciosDTO {
    private RepuestoDTO repuesto;
    private Integer cantidad;
    private BigDecimal precio; // precio unitario
    private BigDecimal subtotal; // cantidad * precio

    // Getters y Setters
    public RepuestoDTO getRepuesto() {
        return repuesto;
    }

    public void setRepuesto(RepuestoDTO repuesto) {
        this.repuesto = repuesto;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }

    public BigDecimal getPrecio() {
        return precio;
    }

    public void setPrecio(BigDecimal precio) {
        this.precio = precio;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    @Override
    public String toString() {
        return "DetalleRepuestosServiciosDTO{" +
                "cantidad=" + cantidad +
                ", repuesto=" + (repuesto != null ? repuesto.getIdRepuesto() : null) +
                '}';
    }
}