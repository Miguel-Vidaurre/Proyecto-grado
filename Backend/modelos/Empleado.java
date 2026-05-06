package com.example.servert.modelos;

import java.util.Set;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import java.time.LocalTime;

@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
@Entity
@Table(name = "empleados")
public class Empleado {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idEmpleado;

    private String nombre;

    private String apellido;

    @Column(unique = true, nullable = false)
    private String carnet;

    private String direccion;

    private Integer telefono;

    // Primer turno (obligatorio)
    @JsonFormat(pattern = "HH:mm")
    private LocalTime horaEntrada1;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime horaSalida1;

    // Segundo turno (opcional)
    @JsonFormat(pattern = "HH:mm")
    private LocalTime horaEntrada2;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime horaSalida2;

    @JsonIgnore
    @OneToMany(mappedBy = "empleado", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Usuario> usuarios;

    @OneToMany(mappedBy = "empleado", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Cotizacion> cotizaciones;

    @OneToMany(mappedBy = "empleado", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<ServiciosRealizados> serviciosRealizados;

    // Getters y Setters

    public Integer getIdEmpleado() {
        return idEmpleado;
    }

    public void setIdEmpleado(Integer idEmpleado) {
        this.idEmpleado = idEmpleado;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public String getCarnet() {
        return carnet;
    }

    public void setCarnet(String carnet) {
        this.carnet = carnet;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public Integer getTelefono() {
        return telefono;
    }

    public void setTelefono(Integer telefono) {
        this.telefono = telefono;
    }

    public LocalTime getHoraEntrada1() {
        return horaEntrada1;
    }

    public void setHoraEntrada1(LocalTime horaEntrada1) {
        this.horaEntrada1 = horaEntrada1;
    }

    public LocalTime getHoraSalida1() {
        return horaSalida1;
    }

    public void setHoraSalida1(LocalTime horaSalida1) {
        this.horaSalida1 = horaSalida1;
    }

    public LocalTime getHoraEntrada2() {
        return horaEntrada2;
    }

    public void setHoraEntrada2(LocalTime horaEntrada2) {
        this.horaEntrada2 = horaEntrada2;
    }

    public LocalTime getHoraSalida2() {
        return horaSalida2;
    }

    public void setHoraSalida2(LocalTime horaSalida2) {
        this.horaSalida2 = horaSalida2;
    }

    public Set<Usuario> getUsuarios() {
        return usuarios;
    }

    public void setUsuarios(Set<Usuario> usuarios) {
        this.usuarios = usuarios;
    }

    public Set<Cotizacion> getCotizaciones() {
        return cotizaciones;
    }

    public void setCotizaciones(Set<Cotizacion> cotizaciones) {
        this.cotizaciones = cotizaciones;
    }

    public Set<ServiciosRealizados> getServiciosRealizados() {
        return serviciosRealizados;
    }

    public void setServiciosRealizados(Set<ServiciosRealizados> serviciosRealizados) {
        this.serviciosRealizados = serviciosRealizados;
    }

    public void setSeq_empleado(Integer id2) {
        // método vacío, si no lo usas, puedes borrarlo
    }
}
