package com.example.servert.dto;

import java.math.BigDecimal;

public class RepuestoDTO {
    private Integer idRepuesto;
    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private Integer cantidad;
    private Boolean estado;
    private MarcaDTO marca;
    private String categoria;

    // Constructor vacío
    public RepuestoDTO() {
    }

    // Getters y setters para todos los campos
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

    public MarcaDTO getMarca() {
        return marca;
    }

    public void setMarca(MarcaDTO marca) {
        this.marca = marca;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    @Override
    public String toString() {
        return "RepuestoDTO{" +
                "idRepuesto=" + idRepuesto +
                ", nombre='" + nombre + '\'' +
                ", descripcion='" + descripcion + '\'' +
                ", precio=" + precio +
                ", cantidad=" + cantidad +
                ", estado=" + estado +
                ", categoria='" + categoria + '\'' +
                ", marca=" + (marca != null ? marca.getIdMarca() : null) +
                '}';
    }
}