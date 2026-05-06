package com.example.servert.modelos;

import java.math.BigDecimal;

import jakarta.persistence.*;

@Entity
@Table(name = "detalle_repuestos_servicios")
public class DetalleRepuestosServicios {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private Integer cantidad; // Solo cantidad, sin precio ni subtotal

    private BigDecimal precio; // precio unitario

    private BigDecimal subtotal; // cantidad * precio

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idRepuesto")
    private Repuesto repuesto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idServiciosRealizados")
    private ServiciosRealizados serviciosRealizados;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
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

    public Repuesto getRepuesto() {
        return repuesto;
    }

    public void setRepuesto(Repuesto repuesto) {
        this.repuesto = repuesto;
    }

    public ServiciosRealizados getServiciosRealizados() {
        return serviciosRealizados;
    }

    public void setServiciosRealizados(ServiciosRealizados serviciosRealizados) {
        this.serviciosRealizados = serviciosRealizados;
    }
}
