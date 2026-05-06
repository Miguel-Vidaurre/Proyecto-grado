package com.example.servert.dto;

import java.math.BigDecimal;

public class DetalleCompraDTO {
    private Integer repuestoId;
    private Integer cantidad;
    private BigDecimal subtotal;
    private BigDecimal precioUnitario;

    public Integer getRepuestoId() {
        return repuestoId;
    }

    public void setRepuestoId(Integer repuestoId) {
        this.repuestoId = repuestoId;
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

    public BigDecimal getPrecioUnitario() {
        return precioUnitario;
    }

    public void setPrecioUnitario(BigDecimal precioUnitario) {
        this.precioUnitario = precioUnitario;
    }

}