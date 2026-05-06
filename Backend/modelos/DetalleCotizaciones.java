package com.example.servert.modelos;

import jakarta.persistence.*;
import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "cotizacion", "servicio" })
@Entity
@Table(name = "detalle_cotizaciones")
public class DetalleCotizaciones {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private Integer cantidadServicios;

    private BigDecimal costoUnitarioServ;

    private BigDecimal subtotal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idServicio")
    private Servicio servicio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idCotizacion")
    @JsonBackReference
    private Cotizacion cotizacion;

    // Getters y setters

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getCantidadServicios() {
        return cantidadServicios;
    }

    public void setCantidadServicios(Integer cantidadServicios) {
        this.cantidadServicios = cantidadServicios;
    }

    public BigDecimal getCostoUnitarioServ() {
        return costoUnitarioServ;
    }

    public void setCostoUnitarioServ(BigDecimal costoUnitarioServ) {
        this.costoUnitarioServ = costoUnitarioServ;
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

    public Cotizacion getCotizacion() {
        return cotizacion;
    }

    public void setCotizacion(Cotizacion cotizacion) {
        this.cotizacion = cotizacion;
    }

    public BigDecimal getPrecioUnitario() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getPrecioUnitario'");
    }
}