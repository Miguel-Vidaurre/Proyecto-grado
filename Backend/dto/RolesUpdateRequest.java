package com.example.servert.dto;

import java.util.List;

public class RolesUpdateRequest {
    private Integer idEmpleado;
    private List<Integer> roles;

    public Integer getIdEmpleado() {
        return idEmpleado;
    }

    public void setIdEmpleado(Integer idEmpleado) {
        this.idEmpleado = idEmpleado;
    }

    public List<Integer> getRoles() {
        return roles;
    }

    public void setRoles(List<Integer> roles) {
        this.roles = roles;
    }
}
