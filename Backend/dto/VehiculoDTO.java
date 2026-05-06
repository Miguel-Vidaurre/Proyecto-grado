package com.example.servert.dto;

public class VehiculoDTO {
    private Integer idVehiculo;
    private String placa;
    private ClienteDTO cliente;

    public Integer getIdVehiculo() {
        return idVehiculo;
    }

    public void setIdVehiculo(Integer idVehiculo) {
        this.idVehiculo = idVehiculo;
    }

    public String getPlaca() {
        return placa;
    }

    public void setPlaca(String placa) {
        this.placa = placa;
    }

    @Override
    public String toString() {
        return "VehiculoDTO{" +
                "idVehiculo=" + idVehiculo +
                ", placa='" + placa + '\'' +
                '}';
    }

    public ClienteDTO getCliente() {
        return cliente;
    }

    public void setCliente(ClienteDTO cliente) {
        this.cliente = cliente;
    }

}
