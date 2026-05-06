package com.example.servert.dto;

import java.util.Set;

import com.example.servert.dto.EmpleadoConRolesDTO.RolDTO;

public class UsuarioDTO {
    private Integer idUsuario;
    private String usuario; // nombre de usuario
    private String password; // contraseña
    private Integer clienteId; // relación con Cliente
    private Integer rolId; // un solo rol
    private Set<RolDTO> roles;

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

    public Integer getClienteId() {
        return clienteId;
    }

    public void setClienteId(Integer clienteId) {
        this.clienteId = clienteId;
    }

    public Integer getRolId() {
        return rolId;
    }

    public void setRolId(Integer rolId) {
        this.rolId = rolId;
    }

    public Set<RolDTO> getRoles() {
        return roles;
    }

    public void setRoles(Set<RolDTO> roles) {
        this.roles = roles;
    }

    public static class RolDTO {
        private Integer idRol;
        private String nombre;

        public Integer getIdRol() {
            return idRol;
        }

        public void setIdRol(Integer idRol) {
            this.idRol = idRol;
        }

        public String getNombre() {
            return nombre;
        }

        public void setNombre(String nombre) {
            this.nombre = nombre;
        }
    }

}