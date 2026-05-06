package com.example.servert.modelos;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
@Entity
@Table(name = "repuestos")
public class Repuesto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idRepuesto;

    private String nombre;

    private String descripcion;

    private BigDecimal precio;

    private Integer cantidad;

    private Boolean estado;

    @Transient
    private String categoria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idMarca")
    private Marca marca;

    @JsonIgnore
    @OneToMany(mappedBy = "repuesto", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<DetalleCompra> compras;

    @JsonIgnore
    @OneToMany(mappedBy = "repuesto", cascade = CascadeType.ALL)
    private Set<DetalleRepuestosServicios> detallesServicios;

    // Getters y Setters
    public Integer getIdRepuesto() {
        return idRepuesto;
    }

    public void setIdRepuesto(Integer idRepuesto) {
        this.idRepuesto = idRepuesto;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public BigDecimal getPrecio() {
        return precio;
    }

    public void setPrecio(BigDecimal precio) {
        this.precio = precio;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }

    public Boolean getEstado() {
        return estado;
    }

    public void setEstado(Boolean estado) {
        this.estado = estado;
    }

    public Marca getMarca() {
        return marca;
    }

    public void setMarca(Marca marca) {
        this.marca = marca;
    }

    public Set<DetalleCompra> getCompras() {
        return compras;
    }

    public void setCompras(Set<DetalleCompra> compras) {
        this.compras = compras;
    }

    public Set<DetalleRepuestosServicios> getDetallesServicios() {
        return detallesServicios;
    }

    public void setDetallesServicios(Set<DetalleRepuestosServicios> detallesServicios) {
        this.detallesServicios = detallesServicios;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }
}
