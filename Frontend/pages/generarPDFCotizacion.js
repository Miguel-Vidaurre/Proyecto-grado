// pdfCotizacion.js
import JsPDF from 'jspdf';
import 'jspdf-autotable';
import { NumerosALetras } from 'numero-a-letras';
import perfil from '../Perfil.png';

// Fallback de formato de fecha
const defaultFormatFechaDDMMYYYY = (fecha) => {
  if (!fecha) return '';
  const [y, m, d] = fecha.split('-');
  return `${d}/${m}/${y}`;
};

export function generarPDFCotizacion(cot, serviciosMap = {}, formatFechaDDMMYYYY = defaultFormatFechaDDMMYYYY) {
  const doc = new JsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 🔹 1️⃣ Logo como marca de agua (centrado y grande)
  const logoWidth = 150;
  const logoHeight = 150;
  const x = (pageWidth - logoWidth) / 2;
  const y = (pageHeight - logoHeight) / 2;

  doc.setGState(new doc.GState({ opacity: 0.1 }));
  doc.addImage(perfil, 'PNG', x, y, logoWidth, logoHeight);
  doc.setGState(new doc.GState({ opacity: 1 }));

  // 🔹 2️⃣ Encabezado
  const fechaRaw = (cot.fechaCotizacion || '').split('T')[0] || '';
  const fechaFormateada = formatFechaDDMMYYYY(fechaRaw);

  doc.setFontSize(18);
  doc.setTextColor(0, 0, 80);
  doc.setFont('helvetica', 'bold');
  doc.text('Taller Mecatrónica Vedia', pageWidth / 2, 12, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text('Cotización de Servicios', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(11);
  doc.text(`Cliente: ${cot.cliente?.nombre || ''} ${cot.cliente?.apellido || ''}`, 10, 35);
  doc.text(`Fecha: ${fechaFormateada}`, pageWidth - 10, 35, { align: 'right' });

  // 🔹 3️⃣ Título detalle
  doc.setFont('helvetica', 'bold');
  doc.text('DETALLE DE SERVICIOS', pageWidth / 2, 45, { align: 'center' });

  // 🔹 4️⃣ Tabla de servicios
  const columnas = ['Servicio', 'Cantidad', 'Costo Unitario', 'Subtotal'];
  const filas = (cot.detalles || []).map((d) => {
    const servicioNombre = serviciosMap[d.idServicio] || '—';
    const cantidad = d.cantidad ?? 1;
    const precio = Number(d.precioUnitario ?? 0);
    const subtotal = Number(d.subtotal ?? cantidad * precio);
    return [servicioNombre, cantidad, `${precio.toFixed(2)} Bs`, `${subtotal.toFixed(2)} Bs`];
  });

  doc.autoTable({
    startY: 50,
    head: [columnas],
    body: filas,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    footStyles: { fillColor: [41, 128, 185], textColor: 255 },
    didDrawPage(data) {
      // 🔹 5️⃣ Pie de página (numeración, contacto y referencia)
      const pageCount = doc.internal.getNumberOfPages();
      const pageCurrent = doc.internal.getCurrentPageInfo().pageNumber;
      const footerY = pageHeight - 10;

      const footerYBase = pageHeight - 25; // base del pie de página
      const lineHeight = 5; // separación entre líneas

      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.setFont('helvetica', 'normal');

      // 1️⃣ Numeración de página centrada
      doc.text(`Página ${pageCurrent} de ${pageCount}`, pageWidth / 2, footerYBase, { align: 'center' });

      // 2️⃣ Contacto alineado a la izquierda, un poco más abajo
      doc.text(
        'Taller Mecatrónica Vedia | Contacto: +591 123 4567 | Email: info@tallervedia.com',
        10,
        footerYBase + lineHeight,
        { align: 'left' }
      );

      // 3️⃣ Referencia de cotización alineada a la derecha, mismo nivel que contacto
      doc.text(`Ref: Cotización #${cot.idCotizacion || 'sin-id'}`, pageWidth - 10, footerYBase + lineHeight, {
        align: 'right',
      });
    },
  });

  // 🔹 6️⃣ Totales
  const finalY = doc.lastAutoTable.finalY + 10;
  const total = Number(cot.totalCotizacion ?? 0);
  const totalTexto = `Total: ${total.toFixed(2)} Bs`;

  let literal = '';
  try {
    literal = NumerosALetras(total).toUpperCase().replace('PESOS', '').replace('M.N.', '').trim();
  } catch (e) {
    literal = '';
  }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(totalTexto, pageWidth - 10, finalY, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Son: ${literal} Bolivianos`, 10, finalY + 7);

  // 🔹 7️⃣ Guardar PDF con nombre del cliente
  const pdfBlob = doc.output('blob');
  return pdfBlob;
}
