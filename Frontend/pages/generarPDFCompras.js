// pdfCompras.js
import JsPDF from 'jspdf';
import 'jspdf-autotable';
import { NumerosALetras } from 'numero-a-letras';
import perfil from '../Perfil.png';

// 🔹 Función auxiliar para formatear fechas dd/mm/yyyy
function formatDateDDMMYYYY(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// 🔹 Función principal para generar PDF de compras
export function generarPDFCompras(compras, nombreEmpleado, repuestos, filtros = {}) {
  const doc = new JsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const fechaActual = formatDateDDMMYYYY(new Date());

  // ===== Marca de agua / Logo centrado =====
  const logoWidth = 150;
  const logoHeight = 150;
  const x = (pageWidth - logoWidth) / 2;
  const y = (pageHeight - logoHeight) / 2;

  doc.setGState(new doc.GState({ opacity: 0.1 }));
  doc.addImage(perfil, 'PNG', x, y, logoWidth, logoHeight);
  doc.setGState(new doc.GState({ opacity: 1 }));

  // ===== Encabezado =====
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 80);
  doc.text('Taller Mecatrónica Vedia', pageWidth / 2, 12, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Reporte de Compras', pageWidth / 2, 20, { align: 'center' });

  // Datos del empleado y fecha
  doc.setFontSize(11);
  doc.text(`Empleado: ${nombreEmpleado}`, 10, 35);
  doc.text(`Fecha: ${fechaActual}`, pageWidth - 10, 35, { align: 'right' });

  // ===== Tabla =====
  const columnas = ['Nº', 'Proveedor', 'Empleado', 'Fecha', 'Detalles', 'Total Bs'];

  const filas = compras.map((c, index) => [
    index + 1,
    c.proveedorNombre || 'Sin proveedor',
    c.empleadoNombre || 'Sin empleado',
    c.fecha ? formatDateDDMMYYYY(c.fecha) : '',
    c.detalles && c.detalles.length > 0
      ? c.detalles
          .map((d) => {
            const repuesto = repuestos.find((r) => r.idRepuesto === d.repuestoId);
            return `${repuesto ? repuesto.nombre : '—'} — Cant: ${d.cantidad} — Precio: ${
              d.precioUnitario
            } Bs — Subtotal: ${(d.cantidad * d.precioUnitario).toFixed(2)} Bs`;
          })
          .join(', ')
      : 'Sin detalles',
    c.total != null ? `${c.total.toFixed(2)} Bs` : '—',
  ]);

  let startY = 45; // altura inicial de la tabla

  const filtrosActivos = Object.entries(filtros)
    .filter(([key, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${key}: ${value}`);

  if (filtrosActivos.length > 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Filtros aplicados:', 10, startY);

    const yOffset = 5;
    filtrosActivos.forEach((filtro, index) => {
      doc.text(filtro, 10, startY + yOffset + index * 5);
    });

    startY += 5 + filtrosActivos.length * 5; // ajustar inicio de la tabla
  }

  doc.autoTable({
    startY,
    head: [columnas],
    body: filas,
    styles: { fontSize: 9, cellPadding: 2, halign: 'center', valign: 'middle' },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold', halign: 'center' },
    footStyles: { fillColor: [41, 128, 185], textColor: 255 },
    margin: { bottom: 30 }, // ✅ deja espacio para el pie de página
    didDrawPage: (data) => {
      const pageCount = doc.internal.getNumberOfPages();
      const pageCurrent = doc.internal.getCurrentPageInfo().pageNumber;

      const footerYBase = doc.internal.pageSize.getHeight() - 25;
      const lineHeight = 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100);

      doc.text(`Página ${pageCurrent} de ${pageCount}`, doc.internal.pageSize.getWidth() / 2, footerYBase, {
        align: 'center',
      });
      doc.text(
        'Taller Mecatrónica Vedia | Contacto: +591 72962112 | Email: limbertja@gmail.com',
        10,
        footerYBase + lineHeight,
        { align: 'left' }
      );
      doc.text(`Ref: Reporte de Compras`, doc.internal.pageSize.getWidth() - 10, footerYBase + lineHeight, {
        align: 'right',
      });
    },
  });

  // ===== Totales =====
  const totalGeneral = compras.reduce((acc, c) => acc + (c.total || 0), 0);
  const totalLiteral = NumerosALetras(totalGeneral).toUpperCase().replace('PESOS', '').replace('M.N.', '').trim();

  const finalY = doc.lastAutoTable.finalY + 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`Total: ${totalGeneral.toFixed(2)} Bs`, pageWidth - 10, finalY, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.text(`Son: ${totalLiteral} Bolivianos`, 10, finalY + 7);

  // ===== Guardar PDF =====
  const fechaArchivo = new Date();
  const fechaArchivoStr = `${String(fechaArchivo.getDate()).padStart(2, '0')}-${String(
    fechaArchivo.getMonth() + 1
  ).padStart(2, '0')}-${fechaArchivo.getFullYear()}`;

  const nombreArchivo = `Compras_${nombreEmpleado?.replace(/\s+/g, '_') || 'empleado'}_${fechaArchivoStr}.pdf`;
  doc.save(nombreArchivo);
}
