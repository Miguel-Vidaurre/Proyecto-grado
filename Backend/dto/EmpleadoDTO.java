package com.example.servert.dto;

import java.time.LocalTime;

public class EmpleadoDTO {
    private Integer idEmpleado;
    private String nombre;
    private String apellido;
    private String carnet;
    private String direccion;
    private Integer telefono;

    private LocalTime horaEntrada1;
    private LocalTime horaSalida1;

    private LocalTime horaEntrada2;
    private LocalTime horaSalida2;

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

    @Override
    public String toString() {
        return "EmpleadoDTO{" +
                "idEmpleado=" + idEmpleado +
                ", nombre='" + nombre + '\'' +
                ", apellido='" + apellido + '\'' +
                ", carnet='" + carnet + '\'' +
                ", direccion='" + direccion + '\'' +
                ", telefono=" + telefono +
                ", horaEntrada1=" + horaEntrada1 +
                ", horaSalida1=" + horaSalida1 +
                ", horaEntrada2=" + horaEntrada2 +
                ", horaSalida2=" + horaSalida2 +
                '}';
    }
}
