import JsPDF from 'jspdf';
import 'jspdf-autotable';
import { NumerosALetras } from 'numero-a-letras';
import perfil from '../Perfil.png'; // logo del taller

// ===== Función auxiliar para formatear fechas =====
function formatDateDDMMYYYY(date) {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function dibujarFooter(doc, pageWidth, pageHeight) {
  const pageCount = doc.internal.getNumberOfPages();
  const pageCurrent = doc.internal.getCurrentPageInfo().pageNumber;
  const footerYBase = pageHeight - 25;

  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.setFont('helvetica', 'normal');

  doc.text(`Página ${pageCurrent} de ${pageCount}`, pageWidth / 2, footerYBase, { align: 'center' });
  doc.text('Taller Mecatrónica Vedia | Contacto: +591 72962112 | Email: limbertja@gmail.com', 10, footerYBase + 5);
  doc.text('Ref: Reporte de Historial de Servicios', pageWidth - 10, footerYBase + 5, { align: 'right' });
}

// ===== Función principal para generar PDF =====
export function generarPDFHistorial(historial, nombreEmpleado, filtros = {}) {
  const doc = new JsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // === 🔹 Marca de agua (logo centrado y translúcido) ===
  const logoWidth = 150;
  const logoHeight = 150;
  const x = (pageWidth - logoWidth) / 2;
  const y = (pageHeight - logoHeight) / 2;

  doc.setGState(new doc.GState({ opacity: 0.1 }));
  doc.addImage(perfil, 'PNG', x, y, logoWidth, logoHeight);
  doc.setGState(new doc.GState({ opacity: 1 }));

  const fechaActual = formatDateDDMMYYYY(new Date());

  // === 🔹 Encabezado ===
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 80);
  doc.text('Taller Mecatrónica Vedia', pageWidth / 2, 12, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text('Reporte de Historial de Servicios', pageWidth / 2, 20, { align: 'center' });

  // === 🔹 Datos de empleado y fecha ===
  doc.setFontSize(11);
  doc.text(`Empleado: ${nombreEmpleado}`, 10, 35);
  doc.text(`Fecha: ${fechaActual}`, pageWidth - 10, 35, { align: 'right' });

  // === 🔹 Tabla ===
  const columnas = ['N°', 'Fecha', 'Cliente', 'Vehículo', 'Servicio', 'Empleado', 'Total (Bs)'];
  const filas = historial.map((h, index) => [
    index + 1,
    h.fecha ? formatDateDDMMYYYY(h.fecha) : '',
    h.vehiculo?.cliente ? `${h.vehiculo.cliente.nombre} ${h.vehiculo.cliente.apellido}` : 'Sin cliente',
    h.vehiculo?.placa || 'Sin vehículo',
    h.detallesServicios?.length
      ? h.detallesServicios.map((d) => `${d.servicio?.tipoServicio || '—'} (${d.cantidad})`).join(', ')
      : 'Sin servicios',
    h.empleado ? `${h.empleado.nombre} ${h.empleado.apellido}` : 'Sin empleado',
    h.total != null ? `${h.total.toFixed(2)}` : '—',
  ]);

  let startY = 45;
  const filtrosActivos = Object.entries(filtros)
    .filter(([k, v]) => v !== null && v !== undefined && v !== '')
    .map(([k, v]) => `${k}: ${v}`);

  if (filtrosActivos.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.text('Filtros aplicados:', 10, startY);

    filtrosActivos.forEach((filtro, i) => doc.text(filtro, 10, startY + 5 + i * 5));
    startY += 5 + filtrosActivos.length * 5; // Ajusta posición para la tabla
  }
  doc.autoTable({
    startY,
    head: [columnas],
    body: filas,
    styles: { fontSize: 10, halign: 'center', valign: 'middle' },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    margin: { bottom: 35 },
    didDrawPage: () => dibujarFooter(doc, pageWidth, pageHeight),
  });

  // === Total ===
  const totalGeneral = historial.reduce((acc, h) => acc + (h.total || 0), 0);
  let totalLiteral = '';
  try {
    totalLiteral = NumerosALetras(totalGeneral)
      .replace(/Pesos .*M\.N\./i, 'Bs. 00/100')
      .toUpperCase();
  } catch {
    totalLiteral = '';
  }

  let yPos = doc.lastAutoTable.finalY + 10;
  const espacioNecesario = 20; // espacio para total + literal

  if (yPos + espacioNecesario > pageHeight - 40) {
    doc.addPage();
    dibujarFooter(doc, pageWidth, pageHeight);
    yPos = 20;
  }

  // === Dibujar total ===
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`Total: ${totalGeneral.toFixed(2)} Bs`, pageWidth - 10, yPos, { align: 'right' });

  // === Total en literal ===
  doc.setFont('helvetica', 'normal');
  doc.text(`Son: ${totalLiteral}`, 10, yPos + 7);

  // === 🔹 Guardar PDF ===
  const fechaArchivo = new Date();
  const fechaArchivoStr = `${String(fechaArchivo.getDate()).padStart(2, '0')}-${String(
    fechaArchivo.getMonth() + 1
  ).padStart(2, '0')}-${fechaArchivo.getFullYear()}`;

  doc.save(`HistorialServicios_${fechaArchivoStr}.pdf`);
}
