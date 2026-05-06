import JsPDF from 'jspdf';
import 'jspdf-autotable';
import { NumerosALetras } from 'numero-a-letras';
import escudo from '../escudo.png';

// Fallback de formato de fecha
const defaultFormatFechaDDMMYYYY = (fecha) => {
  if (!fecha) return '';
  const [y, m, d] = fecha.split('-');
  return `${d}/${m}/${y}`;
};

export function generarPDFCompra(compra, repuestosMap = {}, formatFechaDDMMYYYY = defaultFormatFechaDDMMYYYY) {
  const doc = new JsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 🔹 1️⃣ Logo como marca de agua (centrado y grande)
  const logoWidth = 150;
  const logoHeight = 150;
  const x = (pageWidth - logoWidth) / 2;
  const y = (pageHeight - logoHeight) / 2;

  doc.setGState(new doc.GState({ opacity: 0.1 }));
  doc.addImage(escudo, 'PNG', x, y, logoWidth, logoHeight);
  doc.setGState(new doc.GState({ opacity: 1 }));

  // 🔹 2️⃣ Encabezado
  const fechaRaw = (compra.fecha || '').split('T')[0] || '';
  const fechaFormateada = formatFechaDDMMYYYY(fechaRaw);

  doc.setFontSize(18);
  doc.setTextColor(0, 0, 80);
  doc.setFont('helvetica', 'bold');
  doc.text('Taller Mecatrónica Vedia', pageWidth / 2, 12, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text('Compra de Repuestos', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(11);
  doc.text(`Proveedor: ${compra.proveedorNombre || ''}`, 10, 35);
  doc.text(`Empleado: ${compra.empleadoNombre || ''} ${compra.empleadoApellido || ''}`, 10, 42);
  doc.text(`Fecha: ${fechaFormateada}`, pageWidth - 10, 35, { align: 'right' });

  // 🔹 3️⃣ Título detalle
  doc.setFont('helvetica', 'bold');
  doc.text('DETALLE DE LA COMPRA', pageWidth / 2, 50, { align: 'center' });

  // 🔹 4️⃣ Tabla de repuestos
  const columnas = ['Repuesto', 'Cantidad', 'Costo Unitario', 'Subtotal'];
  const filas = (compra.detalles || []).map((d) => {
    const repuestoNombre = repuestosMap[d.repuestoId] || '—';
    const cantidad = d.cantidad ?? 1;
    const precio = Number(d.precioUnitario ?? 0);
    const subtotal = Number(d.subtotal ?? cantidad * precio);
    return [repuestoNombre, cantidad, `${precio.toFixed(2)} Bs`, `${subtotal.toFixed(2)} Bs`];
  });

  doc.autoTable({
    startY: 55,
    head: [columnas],
    body: filas,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    footStyles: { fillColor: [41, 128, 185], textColor: 255 },
    didDrawPage(data) {
      // 🔹 5️⃣ Pie de página
      const pageCount = doc.internal.getNumberOfPages();
      const pageCurrent = doc.internal.getCurrentPageInfo().pageNumber;
      const footerYBase = pageHeight - 25;
      const lineHeight = 5;

      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.setFont('helvetica', 'normal');

      // Numeración centrada
      doc.text(`Página ${pageCurrent} de ${pageCount}`, pageWidth / 2, footerYBase, { align: 'center' });

      // Contacto a la izquierda
      doc.text(
        'Taller Mecatrónica Vedia | Contacto: +591 72962112 | Email: limbertja@gmail.com',
        10,
        footerYBase + lineHeight,
        { align: 'left' }
      );

      // Referencia a la derecha
      doc.text(`Ref: Compra #${compra.idCompra || 'sin-id'}`, pageWidth - 10, footerYBase + lineHeight, {
        align: 'right',
      });
    },
  });

  // 🔹 6️⃣ Totales
  const finalY = doc.lastAutoTable.finalY + 10;
  const total = Number(compra.total ?? 0);
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

  // 🔹 7️⃣ Retornar PDF como blob
  const pdfBlob = doc.output('blob');
  return pdfBlob;
}
