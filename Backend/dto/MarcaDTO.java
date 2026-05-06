package com.example.servert.dto;

public class MarcaDTO {
    private Integer idMarca;
    private String nombre;

    // Constructor vacío
    public MarcaDTO() {
    }

    // Constructor con campos
    public Integer getIdMarca() {
        return idMarca;
    }

    public void setIdMarca(Integer idMarca) {
        this.idMarca = idMarca;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

}