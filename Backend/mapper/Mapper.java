package com.example.servert.mapper;

import java.time.ZoneId;
import java.util.Date;
import java.util.Set;
import java.util.stream.Collectors;

import com.example.servert.dto.*;
import com.example.servert.servicios.RepuestoService;
import com.example.servert.modelos.*;

public class Mapper {

    public static CotizacionDTO toCotizacionDTO(Cotizacion cotizacion) {
        CotizacionDTO dto = new CotizacionDTO();
        dto.setIdCotizacion(cotizacion.getIdCotizacion());
        dto.setFechaCotizacion(cotizacion.getFechaCotizacion());
        dto.setTotalCotizacion(cotizacion.getTotalCotizacion());

        if (cotizacion.getEmpleado() != null) {
            dto.setEmpleado(toEmpleadoDTO(cotizacion.getEmpleado()));
        }

        if (cotizacion.getCliente() != null) {
            dto.setCliente(toClienteDTO(cotizacion.getCliente()));
        }

        if (cotizacion.getDetalles() != null) {
            Set<DetalleCotizacionDTO> detallesDto = cotizacion.getDetalles().stream()
                    .map(Mapper::toDetalleCotizacionDTO)
                    .collect(Collectors.toSet());
            dto.setDetalles(detallesDto);
        }

        return dto;
    }

    public static EmpleadoDTO toEmpleadoDTO(Empleado empleado) {
        EmpleadoDTO dto = new EmpleadoDTO();
        dto.setIdEmpleado(empleado.getIdEmpleado());
        dto.setNombre(empleado.getNombre());
        dto.setApellido(empleado.getApellido());
        dto.setCarnet(empleado.getCarnet());
        dto.setDireccion(empleado.getDireccion());
        dto.setTelefono(empleado.getTelefono());
        dto.setHoraEntrada1(empleado.getHoraEntrada1());
        dto.setHoraSalida1(empleado.getHoraSalida1());
        dto.setHoraEntrada2(empleado.getHoraEntrada2());
        dto.setHoraSalida2(empleado.getHoraSalida2());
        return dto;
    }

    public static Empleado toEmpleadoEntity(EmpleadoDTO dto) {
        Empleado empleado = new Empleado();
        empleado.setIdEmpleado(dto.getIdEmpleado());
        empleado.setNombre(dto.getNombre());
        empleado.setApellido(dto.getApellido());
        empleado.setCarnet(dto.getCarnet());
        empleado.setDireccion(dto.getDireccion());
        empleado.setTelefono(dto.getTelefono());
        empleado.setHoraEntrada1(dto.getHoraEntrada1());
        empleado.setHoraSalida1(dto.getHoraSalida1());
        empleado.setHoraEntrada2(dto.getHoraEntrada2());
        empleado.setHoraSalida2(dto.getHoraSalida2());
        return empleado;
    }

    public static ClienteDTO toClienteDTO(Cliente cliente) {
        ClienteDTO dto = new ClienteDTO();
        dto.setIdCliente(cliente.getIdCliente());
        dto.setNombre(cliente.getNombre());
        dto.setApellido(cliente.getApellido());
        dto.setCarnet(cliente.getCarnet());
        dto.setEmail(cliente.getEmail());
        dto.setTelefono(cliente.getTelefono());
        dto.setNit(cliente.getNit());
        return dto;
    }

    public static DetalleCotizacionDTO toDetalleCotizacionDTO(DetalleCotizaciones detalle) {
        DetalleCotizacionDTO dto = new DetalleCotizacionDTO();
        dto.setIdDetalle(detalle.getId());

        if (detalle.getServicio() != null) {
            dto.setIdServicio(detalle.getServicio().getIdServicio()); // NUEVO
            dto.setDescripcionServicio(detalle.getServicio().getTipoServicio());
        }

        dto.setPrecioUnitario(detalle.getCostoUnitarioServ());
        dto.setCantidad(detalle.getCantidadServicios());
        dto.setSubtotal(detalle.getSubtotal());
        return dto;
    }

    public static Cotizacion toCotizacionEntity(CotizacionDTO dto) {
        Cotizacion entidad = new Cotizacion();
        entidad.setIdCotizacion(dto.getIdCotizacion());
        entidad.setFechaCotizacion(dto.getFechaCotizacion());
        entidad.setTotalCotizacion(dto.getTotalCotizacion());

        // Cliente e Empleado se asignarán en el controlador desde la BD
        // Aquí no se asignan directamente para evitar errores si vienen incompletos

        if (dto.getDetalles() != null) {
            Set<DetalleCotizaciones> detalles = dto.getDetalles().stream().map(detalleDto -> {
                DetalleCotizaciones detalle = new DetalleCotizaciones();
                detalle.setId(detalleDto.getIdDetalle());
                detalle.setCantidadServicios(detalleDto.getCantidad());
                detalle.setCostoUnitarioServ(detalleDto.getPrecioUnitario());
                detalle.setSubtotal(detalleDto.getSubtotal());

                // Asignar servicio solo con ID (esto es suficiente)
                if (detalleDto.getIdServicio() != null) {
                    Servicio servicio = new Servicio();
                    servicio.setIdServicio(detalleDto.getIdServicio());
                    detalle.setServicio(servicio);
                }

                return detalle;
            }).collect(Collectors.toSet());

            entidad.setDetalles(detalles);
        }

        return entidad;
    }

    public static DetalleServiciosRealizadosDTO toDetalleServiciosRealizadosDTO(DetalleServiciosRealizados entity) {
        DetalleServiciosRealizadosDTO dto = new DetalleServiciosRealizadosDTO();
        dto.setCantidad(entity.getCantidad());
        dto.setSubtotal(entity.getSubtotal());

        if (entity.getServicio() != null) {
            System.out.println("🟩 Mapper → Entidad con servicio encontrada:");
            System.out.println("   - ID: " + entity.getServicio().getIdServicio());

            ServicioDTO servicioDTO = new ServicioDTO();
            servicioDTO.setIdServicio(entity.getServicio().getIdServicio());
            dto.setServicio(servicioDTO);
        } else {
            System.out.println("🟥 Mapper → Entidad sin servicio asociado");
        }

        return dto;
    }

    public static DetalleServiciosRealizados toDetalleServiciosRealizados(DetalleServiciosRealizadosDTO dto) {
        DetalleServiciosRealizados detalle = new DetalleServiciosRealizados();
        detalle.setCantidad(dto.getCantidad());
        detalle.setSubtotal(dto.getSubtotal());

        if (dto.getServicio() != null) {
            System.out.println("🟦 Mapper → DTO recibido con servicio:");
            System.out.println("   - ID: " + dto.getServicio().getIdServicio());

            Servicio servicio = new Servicio();
            servicio.setIdServicio(dto.getServicio().getIdServicio());
            detalle.setServicio(servicio);

            System.out.println("✅ Mapper → Entidad creada con Servicio ID = " + detalle.getServicio().getIdServicio());
        } else {
            System.out.println("🟥 Mapper → DTO sin servicio asociado");
        }

        return detalle;
    }

    public static DetalleRepuestosServicios toDetalleRepuestosServicios(DetalleRepuestosServiciosDTO dto) {
        System.out.println("🔹 Mapper: DetalleRepuestoDTO recibido: " + dto);

        DetalleRepuestosServicios detalle = new DetalleRepuestosServicios();
        detalle.setCantidad(dto.getCantidad());
        detalle.setPrecio(dto.getPrecio());
        detalle.setSubtotal(dto.getSubtotal());

        if (dto.getRepuesto() != null && dto.getRepuesto().getIdRepuesto() != null) {
            Repuesto repuesto = new Repuesto();
            repuesto.setIdRepuesto(dto.getRepuesto().getIdRepuesto());
            detalle.setRepuesto(repuesto);
        }
        System.out.println("🔹 Mapper: Entidad DetalleRepuestosServicios creada: " + detalle);
        return detalle;
    }

    public static ServiciosRealizados toServicioRealizadoEntity(ServicioRealizadoDTO dto) {
        ServiciosRealizados entidad = new ServiciosRealizados();

        // Asignación directa de LocalDate
        if (dto.getFecha() != null) {
            entidad.setFecha(dto.getFecha());
        }

        entidad.setTotal(dto.getTotal());
        entidad.setDescuento(dto.getDescuento());

        if (dto.getDetallesServicios() != null) {
            Set<DetalleServiciosRealizados> detalles = dto.getDetallesServicios().stream()
                    .map(Mapper::toDetalleServiciosRealizados)
                    .collect(Collectors.toSet());
            entidad.setDetallesServicios(detalles);
        }

        if (dto.getDetallesRepuestos() != null) {
            Set<DetalleRepuestosServicios> detalles = dto.getDetallesRepuestos().stream()
                    .map(Mapper::toDetalleRepuestosServicios)
                    .collect(Collectors.toSet());
            entidad.setDetallesRepuestos(detalles);
        }

        return entidad;
    }

    public static MarcaDTO toMarcaDTO(Marca marca) {
        if (marca == null)
            return null;
        MarcaDTO dto = new MarcaDTO();
        dto.setIdMarca(marca.getId());
        dto.setNombre(marca.getNombre());
        return dto;
    }

    public static Marca toMarcaEntity(MarcaDTO dto) {
        if (dto == null)
            return null;
        Marca marca = new Marca();
        marca.setId(dto.getIdMarca());
        marca.setNombre(dto.getNombre());
        return marca;
    }

    // DTO para Repuesto:
    public static RepuestoDTO toRepuestoDTO(Repuesto repuesto) {
        if (repuesto == null)
            return null;
        RepuestoDTO dto = new RepuestoDTO();
        dto.setIdRepuesto(repuesto.getIdRepuesto());
        dto.setNombre(repuesto.getNombre());
        dto.setDescripcion(repuesto.getDescripcion());
        dto.setPrecio(repuesto.getPrecio());
        dto.setCantidad(repuesto.getCantidad());
        dto.setEstado(repuesto.getEstado());
        dto.setMarca(toMarcaDTO(repuesto.getMarca()));

        // ✅ Enviar categoría también al frontend
        dto.setCategoria(repuesto.getCategoria());

        return dto;
    }

    public static Repuesto toRepuestoEntity(RepuestoDTO dto) {
        if (dto == null)
            return null;
        Repuesto repuesto = new Repuesto();
        repuesto.setIdRepuesto(dto.getIdRepuesto());
        repuesto.setNombre(dto.getNombre());
        repuesto.setDescripcion(dto.getDescripcion());
        repuesto.setPrecio(dto.getPrecio());
        repuesto.setCantidad(dto.getCantidad());
        repuesto.setEstado(dto.getEstado());
        repuesto.setMarca(toMarcaEntity(dto.getMarca()));

        // ⚡ Clasificar automáticamente la categoría
        RepuestoService clasificador = new RepuestoService();
        String categoria = clasificador.clasificarCategoria(dto.getNombre());
        repuesto.setCategoria(categoria);

        return repuesto;
    }

    public static ServicioDTO toServicioDTO(Servicio servicio) {
        if (servicio == null)
            return null;

        ServicioDTO dto = new ServicioDTO();
        dto.setIdServicio(servicio.getIdServicio());
        dto.setTipoServicio(servicio.getTipoServicio()); // 👈 aquí
        return dto;
    }

    public static ServicioRealizadoDTO toServicioRealizadoDTO(ServiciosRealizados entidad) {
        ServicioRealizadoDTO dto = new ServicioRealizadoDTO();

        if (entidad.getFecha() != null) {
            dto.setFecha(entidad.getFecha());
        }

        dto.setTotal(entidad.getTotal());
        dto.setDescuento(entidad.getDescuento());

        if (entidad.getEmpleado() != null)
            dto.setEmpleado(toEmpleadoDTO(entidad.getEmpleado()));

        if (entidad.getVehiculo() != null)
            dto.setVehiculo(toVehiculoDTO(entidad.getVehiculo()));

        // Servicios
        if (entidad.getDetallesServicios() != null) {
            Set<DetalleServiciosRealizadosDTO> detallesDTO = entidad.getDetallesServicios().stream()
                    .map(det -> {
                        DetalleServiciosRealizadosDTO dtoDet = new DetalleServiciosRealizadosDTO();
                        dtoDet.setCantidad(det.getCantidad());
                        dtoDet.setSubtotal(det.getSubtotal());

                        if (det.getServicio() != null) {
                            dtoDet.setServicio(toServicioDTO(det.getServicio())); // ✅ ahora incluye tipoServicio
                        }

                        return dtoDet;
                    })
                    .collect(Collectors.toSet());

            dto.setDetallesServicios(detallesDTO);
        }

        // Repuestos
        if (entidad.getDetallesRepuestos() != null) {
            Set<DetalleRepuestosServiciosDTO> repuestosDTO = entidad.getDetallesRepuestos().stream()
                    .map(det -> {
                        DetalleRepuestosServiciosDTO dtoDet = new DetalleRepuestosServiciosDTO();
                        dtoDet.setCantidad(det.getCantidad());
                        dtoDet.setPrecio(det.getPrecio());
                        dtoDet.setSubtotal(det.getSubtotal());

                        if (det.getRepuesto() != null) {
                            RepuestoDTO repuestoDTO = new RepuestoDTO();
                            repuestoDTO.setIdRepuesto(det.getRepuesto().getIdRepuesto());
                            repuestoDTO.setNombre(det.getRepuesto().getNombre());
                            repuestoDTO.setPrecio(det.getRepuesto().getPrecio());
                            dtoDet.setRepuesto(repuestoDTO);
                        }
                        return dtoDet;
                    }).collect(Collectors.toSet());

            dto.setDetallesRepuestos(repuestosDTO); // ✅ repuestos
        }

        return dto;
    }

    public static VehiculoDTO toVehiculoDTO(Vehiculos vehiculo) {
        if (vehiculo == null)
            return null;

        VehiculoDTO dto = new VehiculoDTO();
        dto.setIdVehiculo(vehiculo.getIdVehiculo());
        dto.setPlaca(vehiculo.getPlaca());

        // ⚡ Incluir cliente completo
        if (vehiculo.getCliente() != null) {
            ClienteDTO clienteDTO = new ClienteDTO();
            clienteDTO.setIdCliente(vehiculo.getCliente().getIdCliente());
            clienteDTO.setNombre(vehiculo.getCliente().getNombre());
            clienteDTO.setApellido(vehiculo.getCliente().getApellido());
            clienteDTO.setCarnet(vehiculo.getCliente().getCarnet()); // <- agregar esta línea
            clienteDTO.setEmail(vehiculo.getCliente().getEmail());
            clienteDTO.setTelefono(vehiculo.getCliente().getTelefono());
            clienteDTO.setNit(vehiculo.getCliente().getNit());
            dto.setCliente(clienteDTO);
        }

        return dto;
    }

    // ==================== USUARIO ====================
    public static UsuarioDTO toUsuarioDTO(Usuario usuario) {
        if (usuario == null)
            return null;

        UsuarioDTO dto = new UsuarioDTO();
        dto.setIdUsuario(usuario.getIdUsuario());
        dto.setUsuario(usuario.getUsuario());
        dto.setPassword(usuario.getPassword());

        if (usuario.getCliente() != null) {
            dto.setClienteId(usuario.getCliente().getIdCliente());
        }

        // ⚡ OJO: como dijiste que maneja UN solo rol,
        // aquí asumimos que tu entidad Usuario ahora tiene un único rol.
        // Si todavía está como Set<Rol>, entonces habría que adaptarlo.
        if (usuario.getRoles() != null && !usuario.getRoles().isEmpty()) {
            Rol rol = usuario.getRoles().iterator().next(); // toma el primero
            dto.setRolId(rol.getIdRol());
        }

        return dto;
    }

    public static Usuario toUsuarioEntity(UsuarioDTO dto) {
        if (dto == null)
            return null;

        Usuario usuario = new Usuario();
        usuario.setIdUsuario(dto.getIdUsuario());
        usuario.setUsuario(dto.getUsuario());
        usuario.setPassword(dto.getPassword());

        if (dto.getClienteId() != null) {
            Cliente cliente = new Cliente();
            cliente.setIdCliente(dto.getClienteId());
            usuario.setCliente(cliente);
        }

        if (dto.getRolId() != null) {
            Rol rol = new Rol();
            rol.setIdRol(dto.getRolId());
            usuario.setRoles(Set.of(rol)); // inicializa el Set con un solo rol
        }

        return usuario;
    }
}