// src/components/FacturaBoliviaPDF.jsx
import React, { useEffect, useState } from 'react';
import { PDFDownloadLink, Document, Page, Text, View, Image, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import { NumerosALetras } from 'numero-a-letras';
import QRCode from 'qrcode';

// Función para convertir números a texto en bolivianos
const literalBolivianos = (numero) => {
  let texto = NumerosALetras(numero);
  texto = texto.replace(/Pesos.*M\.N\./i, '').trim();
  const decimales = Math.round((numero - Math.floor(numero)) * 100)
    .toString()
    .padStart(2, '0');
  return `${texto} ${decimales}/100 Bolivianos`;
};

// Estilos para el PDF
const styles = StyleSheet.create({
  page: { padding: 15, fontSize: 10, fontFamily: 'Helvetica' },

  // Encabezado
  encabezado: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  columnaIzq: { flex: 1, alignItems: 'center' },

  // Columna derecha dividida en dos subcolumnas
  columnaDer: { flexDirection: 'row', width: '40%', justifyContent: 'flex-start' },
  subColumna: { flexDirection: 'column', width: '50%' },
  texto10: { fontSize: 10 },

  // Título
  tituloFactura: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginVertical: 5 },
  subtitulo: { fontSize: 10, textAlign: 'center', marginBottom: 5 },

  // Información cliente
  infoCliente: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },

  // Tabla
  tabla: { marginTop: 10 }, // eliminamos borde
  fila: { flexDirection: 'row' }, // sigue igual
  celda: { borderWidth: 1, borderColor: '#000', padding: 3, fontSize: 9, textAlign: 'center' },
  celdaDescripcion: { borderWidth: 1, borderColor: '#000', padding: 3, fontSize: 9, textAlign: 'left' },
  celdaTitulo: { fontWeight: 'bold', fontSize: 7, textAlign: 'center' }, // centrado
  celdaAncho: { width: '10%' },
  celdaCant: { width: '8%' },
  celdaUnidad: { width: '10%' },
  celdaDescripcionCol: { width: '41%' },
  celdaPrecio: { width: '8%' },
  celdaDescuento: { width: '15%' },
  celdaSubtotal: { width: '10%' },

  // Totales
  total: { marginTop: 10, textAlign: 'right', fontSize: 10, fontWeight: 'bold' },

  // QR
  textoQRCompacto: {
    fontSize: 7,
    lineHeight: 7, // líneas pegadas
    textAlign: 'justify',
    marginBottom: 2, // si querés un poco de espacio entre líneas
  },
  qrImage: {
    width: 60,
    height: 60,
    marginLeft: 5,
  },
});

// Componente que genera el PDF
const FacturaPDF = ({ item, numeroFactura = 1 }) => {
  const [qrDataURL, setQrDataURL] = useState('');
  const totalDescuento = item?.descuentoTotal ?? 0;
  const giftcart = item?.descuentoTotal ?? 0;

  useEffect(() => {
    const cuf = item.cuf || '1234567890123456789012345678901234567890';
    QRCode.toDataURL(cuf, { margin: 0 })
      .then((url) => setQrDataURL(url))
      .catch(console.error);
  }, [item]);

  const detallesConSubtotal = (item.detallesServicios || []).map((d, i) => {
    const cantidad = d.cantidad ?? 1;
    const subtotal = d.subtotal ?? (d.precioUnitario ? d.precioUnitario * cantidad : d.servicio?.costo * cantidad ?? 0);
    const precioUnitario = cantidad ? subtotal / cantidad : 0;
    return { ...d, subtotal, precioUnitario };
  });

  const subtotalServicios = detallesConSubtotal.reduce((acc, d) => acc + (d.subtotal ?? 0), 0);
  const subtotalRepuestos = (item.detallesRepuestos || []).reduce(
    (acc, r) => acc + (r.subtotal ?? r.cantidad * (r.repuesto?.precio ?? 0)),
    0
  );
  const subtotalTotal = subtotalServicios + subtotalRepuestos;
  const totalFinal = (subtotalTotal || 0) - (item.descuento || 0);

  const obtenerFechaHoraActual = () => {
    const ahora = new Date();
    const dia = String(ahora.getDate()).padStart(2, '0');
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const año = ahora.getFullYear();
    let horas = ahora.getHours();
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const ampm = horas >= 12 ? 'PM' : 'AM';
    horas = horas % 12 || 12;
    horas = String(horas).padStart(2, '0');
    return `${dia}/${mes}/${año} - ${horas}:${minutos} ${ampm}`;
  };

  const codigoAutorizacion = '4603EBEC034DE81978F847E49358ED5CE09BEA51E16D5E0B931617D74';

  // Función para partir texto en líneas según número máximo de caracteres por línea
  const splitText = (text, maxCharsPerLine) => {
    const lines = [];
    for (let i = 0; i < text.length; i += maxCharsPerLine) {
      lines.push(text.slice(i, i + maxCharsPerLine));
    }
    return lines;
  };

  const lineasCodigo = splitText(codigoAutorizacion, 30); // 30 caracteres por línea

  return (
    <Document>
      <Page size="LETTER" style={{ padding: 20, fontSize: 10, fontFamily: 'Helvetica' }}>
        {/* Encabezado */}
        <View style={styles.encabezado}>
          <View style={[styles.columnaIzq, { alignItems: 'center' }]}>
            <Text style={{ fontWeight: 'bold', fontSize: 12, textAlign: 'center' }}>LIMBER VEDIA</Text>
            <Text style={{ textAlign: 'center' }}>CASA MATRIZ</Text>
            <Text style={{ textAlign: 'center' }}>Nro. Punto de Venta 0</Text>
            <Text style={{ textAlign: 'center' }}>
              BARRIO: JUAN XXIII, AVENIDA JAIME PAZ ZAMORA, TELEFONO: 79252809
            </Text>
            <Text style={{ textAlign: 'center' }}>TARIJA</Text>
          </View>
          <View style={{ flex: 1 }} />
          <View style={styles.columnaDer}>
            {/* Columna izquierda */}
            <View style={styles.subColumna}>
              <Text style={styles.texto10}>NIT:</Text>
              <Text style={styles.texto10}>FACTURA N°:</Text>
              <Text style={styles.texto10}>CÓD. AUTORIZACIÓN:</Text>
            </View>

            {/* Columna derecha */}
            <View style={styles.subColumna}>
              <Text style={styles.texto10}>10627732015</Text>
              <Text style={styles.texto10}>{numeroFactura.toString().padStart(7, '0')}</Text>
              <Text style={{ textAlign: 'left' }}>4603EBEC034DE81978</Text>
              <Text style={{ textAlign: 'left' }}>F847E49358ED5CE09B</Text>
              <Text style={{ textAlign: 'left' }}>EA51E16D5E0B931617</Text>
              <Text style={{ textAlign: 'left' }}>D74</Text>
            </View>
          </View>
        </View>

        {/* Título */}
        <Text style={styles.tituloFactura}>Factura</Text>
        <Text style={styles.subtitulo}>(Con Derecho a Crédito Fiscal)</Text>

        {/* Info Cliente */}
        <View style={{ flexDirection: 'row', marginBottom: 10, width: '100%' }}>
          {/* Fila completa dividida en dos bloques: 60% y 40% */}

          {/* Bloque 60% */}
          <View style={{ width: '70%' }}>
            <View style={{ flexDirection: 'row' }}>
              {/* Columna izquierda: etiquetas */}
              <View style={{ width: '30%' }}>
                <Text>Fecha:</Text>
                <Text>Nombre/Razón Social:</Text>
              </View>

              {/* Columna derecha: valores */}
              <View style={{ width: '65%' }}>
                <Text>{obtenerFechaHoraActual()}</Text>
                <Text>
                  {`${item.vehiculo?.cliente?.nombre ?? ''} ${item.vehiculo?.cliente?.apellido ?? ''}`.trim() ||
                    'Cliente Genérico'}
                </Text>
              </View>
            </View>
          </View>

          {/* Bloque 40% */}
          <View style={{ width: '30%' }}>
            <View style={{ flexDirection: 'row' }}>
              {/* Columna izquierda: etiquetas */}
              <View style={{ width: '35%' }}>
                <Text>NIT/CI:</Text>
                <Text>Cód. Cliente:</Text>
              </View>

              {/* Columna derecha: valores */}
              <View style={{ width: '50%' }}>
                <Text>{item.vehiculo?.cliente?.nit ?? item.vehiculo?.cliente?.carnet ?? '0000000000'}</Text>
                <Text>{item.vehiculo?.cliente?.carnet ?? '00000000'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tabla */}
        <View style={styles.tabla}>
          {/* Encabezado */}
          <View style={styles.fila}>
            <Text style={[styles.celda, styles.celdaTitulo, styles.celdaAncho]}>CÓDIGO PRODUCTO / SERVICIO</Text>
            <View style={[styles.celda, styles.celdaTitulo, styles.celdaCant, { justifyContent: 'center' }]}>
              <Text style={{ textAlign: 'center' }}>CANTIDAD</Text>
            </View>
            <View style={[styles.celda, styles.celdaTitulo, styles.celdaUnidad, { justifyContent: 'center' }]}>
              <Text style={{ textAlign: 'center' }}>UNIDAD DE MEDIDA</Text>
            </View>
            <View style={[styles.celda, styles.celdaTitulo, styles.celdaDescripcionCol, { justifyContent: 'center' }]}>
              <Text style={{ textAlign: 'center' }}>DESCRIPCIÓN</Text>
            </View>
            <View style={[styles.celda, styles.celdaTitulo, styles.celdaPrecio, { justifyContent: 'center' }]}>
              <Text style={{ textAlign: 'center' }}>PRECIO UNITARIO</Text>
            </View>

            <View style={[styles.celda, styles.celdaTitulo, styles.celdaDescuento, { justifyContent: 'center' }]}>
              <Text style={{ textAlign: 'center' }}>DESCUENTO</Text>
            </View>

            <View style={[styles.celda, styles.celdaTitulo, styles.celdaSubtotal, { justifyContent: 'center' }]}>
              <Text style={{ textAlign: 'center' }}>SUBTOTAL</Text>
            </View>
          </View>

          {/* Servicios */}
          {detallesConSubtotal.map((d, i) => (
            <View style={styles.fila} key={i}>
              <Text style={[styles.celda, styles.celdaAncho]}>{`S-${d.servicio?.idServicio ?? i + 1}`}</Text>
              <Text style={[styles.celda, styles.celdaCant]}>{d.cantidad ?? 0}</Text>
              <Text style={[styles.celda, styles.celdaUnidad]}>{d.unidadMedida ?? 'UND'}</Text>
              <Text style={[styles.celdaDescripcion, styles.celdaDescripcionCol]}>
                <Text style={[styles.celdaDescripcion, styles.celdaDescripcionCol]}>
                  {d.servicio?.tipoServicio ?? 'Servicio sin nombre'}
                </Text>
              </Text>
              <Text style={[styles.celda, styles.celdaPrecio]}>{(d.precioUnitario ?? 0).toFixed(2)}</Text>
              <Text style={[styles.celda, styles.celdaDescuento]}>{(d.descuento ?? 0).toFixed(2)}</Text>
              <Text style={[styles.celda, styles.celdaSubtotal]}>{(d.subtotal ?? 0).toFixed(2)}</Text>
            </View>
          ))}

          {/* Repuestos */}
          {(item.detallesRepuestos || []).map((r, i) => (
            <View style={styles.fila} key={i}>
              <Text style={[styles.celda, styles.celdaAncho]}>{`R-${r.repuesto?.idRepuesto ?? i + 1}`}</Text>
              <Text style={[styles.celda, styles.celdaCant]}>{r.cantidad ?? 0}</Text>
              <Text style={[styles.celda, styles.celdaUnidad]}>{r.repuesto?.unidadMedida ?? 'UND'}</Text>
              <Text style={[styles.celdaDescripcion, styles.celdaDescripcionCol]}>{r.repuesto?.nombre ?? ''}</Text>
              <Text style={[styles.celda, styles.celdaPrecio]}>
                {(r.precioUnitario ?? r.repuesto?.precio ?? 0).toFixed(2)}
              </Text>
              <Text style={[styles.celda, styles.celdaDescuento]}>{(r.descuento ?? 0).toFixed(2)}</Text>
              <Text style={[styles.celda, styles.celdaSubtotal]}>{(r.subtotal ?? 0).toFixed(2)}</Text>
            </View>
          ))}

          {/* Totales */}
          <View style={styles.fila}>
            <View style={{ flex: 4 }} /> {/* Vacío sin <Text> */}
            <Text
              style={[styles.celda, { width: 130, fontWeight: 'bold', textAlign: 'right', fontSize: 7.5 }]} // <- tamaño reducido
            >
              SUBTOTAL Bs
            </Text>
            <Text
              style={[styles.celda, { width: 56, textAlign: 'right', fontSize: 7.5 }]} // <- tamaño reducido
            >
              {subtotalTotal.toFixed(2)}
            </Text>
          </View>
          <View style={styles.fila}>
            <View style={{ flex: 4 }} /> {/* Vacío sin <Text> */}
            <Text style={[styles.celda, { width: 130, fontWeight: 'bold', textAlign: 'right', fontSize: 7.5 }]}>
              DESCUENTO Bs
            </Text>
            <Text style={[styles.celda, { width: 56, textAlign: 'right', fontSize: 7.5 }]}>
              {item.descuento != null ? item.descuento.toFixed(2) : '0.00'}
            </Text>
          </View>

          <View style={[styles.fila, { alignItems: 'center' }]}>
            {/* Texto "Son:" alineado a la izquierda, fuera de la tabla */}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 8, fontWeight: 'bold' }}>Son: {literalBolivianos(item.total ?? 0)}</Text>
            </View>

            {/* Celdas de Total Bs alineadas a la derecha */}

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.celda, { width: 130, fontWeight: 'bold', textAlign: 'right', fontSize: 7.5 }]}>
                TOTAL Bs
              </Text>
              <Text style={[styles.celda, { width: 56, textAlign: 'right', fontSize: 7.5 }]}>
                {totalFinal.toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={styles.fila}>
            <View style={{ flex: 4 }} />
            <Text style={[styles.celda, { width: 130, fontWeight: 'bold', textAlign: 'right', fontSize: 7.5 }]}>
              MONTO GIFT CARD Bs
            </Text>
            <Text style={[styles.celda, { width: 56, textAlign: 'right', fontSize: 7.5 }]}>
              {giftcart ? giftcart.toFixed(2) : '0.00'}
            </Text>
          </View>

          <View style={styles.fila}>
            <View style={{ flex: 4 }} />
            <Text style={[styles.celda, { width: 130, fontWeight: 'bold', textAlign: 'right', fontSize: 7.5 }]}>
              MONTO A PAGAR Bs
            </Text>
            <Text style={[styles.celda, { width: 56, textAlign: 'right', fontSize: 7.5 }]}>
              {totalFinal.toFixed(2)}
            </Text>
          </View>

          <View style={styles.fila}>
            <View style={{ flex: 4 }} />
            <Text style={[styles.celda, { width: 130, fontWeight: 'bold', textAlign: 'right', fontSize: 6 }]}>
              IMPORTE BASE CRÉDITO FISCAL Bs
            </Text>
            <Text style={[styles.celda, { width: 56, textAlign: 'right', fontSize: 7.5 }]}>
              {totalFinal.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* QR */}
        {qrDataURL && (
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            {/* Columna izquierda: texto */}
            <View style={[styles.columnaIzq, { alignItems: 'flex-start' }]}>
              <Text style={{ textAlign: 'left', fontSize: 7.5, marginBottom: 5 }}>
                ESTA FACTURA CONTRIBUYE AL DESARROLLO DEL PAÍS, EL USO ILÍCITO SERÁ SANCIONADO PENALMENTE DE ACUERDO A
                LEY
              </Text>
              <Text style={{ textAlign: 'left', fontSize: 7.5, marginBottom: 5 }}>
                Ley Nº 453: El proveedor debe brindar atención sin discriminación, con respeto, calidez y cordialidad a
                los usuarios y consumidores
              </Text>
              <Text style={{ textAlign: 'left', fontSize: 7.5 }}>
                "Este documento es la representación Gráfica de un documento Fiscal Digital emitido en una modalidad de
                facturación en línea"
              </Text>
            </View>

            {/* Columna derecha: QR */}
            <View style={{ width: '25%', alignItems: 'center', justifyContent: 'flex-start' }}>
              <Image src={qrDataURL} style={{ width: 60, height: 60 }} />
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};

// Componente principal con botones y previsualización
const FacturaBoliviaPDF = ({ item, numeroFactura }) => {
  return (
    <div style={{ width: '100%', height: '800px', border: '1px solid #ccc' }}>
      <PDFViewer width="100%" height="100%">
        <FacturaPDF item={item} numeroFactura={numeroFactura ?? 1} />
      </PDFViewer>
    </div>
  );
};

export default FacturaBoliviaPDF;
