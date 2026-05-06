package com.example.servert.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

public class CotizacionDTO {
    private Integer idCotizacion;
    private LocalDate fechaCotizacion;
    private BigDecimal totalCotizacion;
    private EmpleadoDTO empleado;
    private ClienteDTO cliente;
    private Set<DetalleCotizacionDTO> detalles;

    // Getters y setters
    public Integer getIdCotizacion() {
        return idCotizacion;
    }

    public void setIdCotizacion(Integer idCotizacion) {
        this.idCotizacion = idCotizacion;
    }

    public LocalDate getFechaCotizacion() {
        return fechaCotizacion;
    }

    public void setFechaCotizacion(LocalDate fechaCotizacion) {
        this.fechaCotizacion = fechaCotizacion;
    }

    public BigDecimal getTotalCotizacion() {
        return totalCotizacion;
    }

    public void setTotalCotizacion(BigDecimal totalCotizacion) {
        this.totalCotizacion = totalCotizacion;
    }

    public EmpleadoDTO getEmpleado() {
        return empleado;
    }

    public void setEmpleado(EmpleadoDTO empleado) {
        this.empleado = empleado;
    }

    public ClienteDTO getCliente() {
        return cliente;
    }

    public void setCliente(ClienteDTO cliente) {
        this.cliente = cliente;
    }

    public Set<DetalleCotizacionDTO> getDetalles() {
        return detalles;
    }

    public void setDetalles(Set<DetalleCotizacionDTO> detalles) {
        this.detalles = detalles;
    }
}