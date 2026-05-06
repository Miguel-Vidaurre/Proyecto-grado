package com.example.servert.dto;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.util.Set;

public class ServicioRealizadoDTO {
    private LocalDate fecha;
    private BigDecimal total;
    private BigDecimal descuento;

    private EmpleadoDTO empleado;
    private VehiculoDTO vehiculo;

    private Set<DetalleServiciosRealizadosDTO> detallesServicios;
    private Set<DetalleRepuestosServiciosDTO> detallesRepuestos;

    // Getters y Setters

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

    public EmpleadoDTO getEmpleado() {
        return empleado;
    }

    public void setEmpleado(EmpleadoDTO empleado) {
        this.empleado = empleado;
    }

    public VehiculoDTO getVehiculo() {
        return vehiculo;
    }

    public void setVehiculo(VehiculoDTO vehiculo) {
        this.vehiculo = vehiculo;
    }

    public Set<DetalleServiciosRealizadosDTO> getDetallesServicios() {
        return detallesServicios;
    }

    public void setDetallesServicios(Set<DetalleServiciosRealizadosDTO> detallesServicios) {
        this.detallesServicios = detallesServicios;
    }

    public Set<DetalleRepuestosServiciosDTO> getDetallesRepuestos() {
        return detallesRepuestos;
    }

    public void setDetallesRepuestos(Set<DetalleRepuestosServiciosDTO> detallesRepuestos) {
        this.detallesRepuestos = detallesRepuestos;
    }

    @Override
    public String toString() {
        return "ServicioRealizadoDTO{" +
                ", fecha=" + fecha +
                ", vehiculo=" + vehiculo +
                ", empleado=" + empleado +
                ", detallesServicios=" + detallesServicios +
                ", detallesRepuestos=" + detallesRepuestos +
                '}';
    }
}