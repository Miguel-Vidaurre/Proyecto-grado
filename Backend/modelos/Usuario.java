package com.example.servert.modelos;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "usuarios")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idUsuario;

    @Column(length = 50, unique = true, nullable = false)
    private String usuario;

    @Column(length = 100, nullable = false)
    private String password;

    // Relación Muchos a Uno con Rol
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "usuario_rol", joinColumns = @JoinColumn(name = "usuario_id"), inverseJoinColumns = @JoinColumn(name = "rol_id"))
    private Set<Rol> roles = new HashSet<>();

    // Relación Uno a Uno con Empleado
    @ManyToOne
    @JoinColumn(name = "id_empleado", referencedColumnName = "idEmpleado")
    private Empleado empleado;

    @JsonIgnore
    // Relación Uno a Uno con Cliente
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idCliente", unique = true)
    private Cliente cliente;

    // Constructor por defecto
    public Usuario() {
    }

    // Constructor con parámetros
    public Usuario(String usuario, String password) {
        this.usuario = usuario;
        this.password = password;
    }

    // Getters y Setters
    public Integer getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Integer idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getUsuario() {
        return usuario;
    }

    public void setUsuario(String usuario) {
        this.usuario = usuario;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Set<Rol> getRoles() {
        return roles;
    }

    public void setRoles(Set<Rol> roles) {
        this.roles = roles;
    }

    public Empleado getEmpleado() {
        return empleado;
    }

    public void setEmpleado(Empleado empleado) {
        this.empleado = empleado;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

}
