// pdfRepuestos.js
import JsPDF from 'jspdf';
import 'jspdf-autotable';
import { NumerosALetras } from 'numero-a-letras';
import perfil from '../Perfil.png';

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

  // Numeración
  doc.text(`Página ${pageCurrent} de ${pageCount}`, pageWidth / 2, footerYBase, { align: 'center' });

  // Contacto
  doc.text('Taller Mecatrónica Vedia | Contacto: +591 72962112 | Email: limbertja@gmail.com', 10, footerYBase + 5);

  // Referencia
  doc.text('Ref: Reporte de Repuestos', pageWidth - 10, footerYBase + 5, { align: 'right' });
}

// ===== Función principal para generar PDF de Repuestos =====
export function generarPDFRepuestos(repuestos, nombreEmpleado, filtros = {}) {
  const doc = new JsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // === 🔹 Logo tipo marca de agua centrado y translúcido ===
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
  doc.setTextColor(0, 0, 80);
  doc.setFont('helvetica', 'bold');
  doc.text('Taller Mecatrónica Vedia', pageWidth / 2, 12, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text('Reporte de Repuestos', pageWidth / 2, 20, { align: 'center' });

  // === 🔹 Datos de empleado y fecha ===
  doc.setFontSize(11);
  doc.text(`Empleado: ${nombreEmpleado}`, 10, 35);
  doc.text(`Fecha: ${fechaActual}`, pageWidth - 10, 35, { align: 'right' });

  // === 🔹 Tabla de datos ===
  const columnas = ['N°', 'Nombre', 'Marca', 'Descripción', 'Precio (Bs)', 'Cantidad'];
  const filas = repuestos.map((r, index) => [
    index + 1,
    r.nombre || '—',
    r.marca?.nombre || 'Sin marca',
    r.descripcion || '—',
    r.precio != null ? `${r.precio.toFixed(2)} Bs` : '—',
    r.cantidad != null ? `${r.cantidad} ${r.cantidad === 1 ? 'unidad' : 'unidades'}` : '—',
  ]);

  let startY = 45;

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

    startY += 5 + filtrosActivos.length * 5; // Ajustar la posición antes de la tabla
  }

  doc.autoTable({
    startY,
    head: [columnas],
    body: filas,
    styles: { fontSize: 10, halign: 'center', valign: 'middle' },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    didDrawPage: () => {
      dibujarFooter(doc, pageWidth, pageHeight);
    },
  });

  // === Total ===
  const totalGeneral = repuestos.reduce((acc, r) => acc + (r.precio || 0) * (r.cantidad || 0), 0);
  let totalLiteral = '';
  try {
    totalLiteral = NumerosALetras(totalGeneral)
      .replace(/Pesos .*M\.N\./i, 'Bs. 00/100')
      .toUpperCase();
  } catch {
    totalLiteral = '';
  }

  let yPos = doc.lastAutoTable.finalY + 10; // <-- nuevo nombre
  const espacioNecesario = 20; // espacio para Total + Son

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
  doc.save(`Repuestos_${fechaArchivoStr}.pdf`);
}
