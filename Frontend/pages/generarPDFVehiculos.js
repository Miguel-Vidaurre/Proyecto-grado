// pdfVehiculos.js
import JsPDF from 'jspdf';
import 'jspdf-autotable';
import perfil from '../Perfil.png'; // tu logo

// 🔹 Función auxiliar para formatear fechas dd/mm/yyyy
function formatFechaDDMMYYYY(fecha) {
  if (!fecha) return '';
  let d;
  if (fecha instanceof Date) {
    d = fecha;
  } else {
    const [year, month, day] = fecha.split('-');
    d = new Date(year, month - 1, day);
  }
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// 🔹 Generar PDF de Vehículos
export function generarPDFVehiculos(vehiculos, nombreUsuario, filtros = {}) {
  const doc = new JsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ====== 🔹 1️⃣ Marca de agua (Logo) ======
  const logoWidth = 150;
  const logoHeight = 150;
  const x = (pageWidth - logoWidth) / 2;
  const y = (pageHeight - logoHeight) / 2;

  doc.setGState(new doc.GState({ opacity: 0.1 }));
  doc.addImage(perfil, 'PNG', x, y, logoWidth, logoHeight);
  doc.setGState(new doc.GState({ opacity: 1 }));

  // ====== 🔹 2️⃣ Encabezado ======
  const fechaActual = formatFechaDDMMYYYY(new Date());

  doc.setFontSize(18);
  doc.setTextColor(0, 0, 80);
  doc.setFont('helvetica', 'bold');
  doc.text('Taller Mecatrónica Vedia', pageWidth / 2, 12, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text('Reporte de Vehículos', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(11);
  doc.text(`Usuario: ${nombreUsuario || '—'}`, 10, 30);
  doc.text(`Fecha: ${fechaActual}`, pageWidth - 10, 30, { align: 'right' });

  // ====== 🔹 3️⃣ Tabla ======
  const columnas = ['N°', 'Cliente', 'Placa', 'Marca', 'Modelo', 'Tipo', 'Fecha Registro'];
  const filas = vehiculos.map((v, i) => [
    i + 1,
    v.cliente ? `${v.cliente.nombre} ${v.cliente.apellido}` : 'Sin cliente',
    v.placa || '—',
    v.marca || '—',
    v.modelo || '—',
    v.tipo || '—',
    formatFechaDDMMYYYY(v.fechaRegistro),
  ]);

  // 🔹 Mostrar filtros activos
  let startY = 40; // inicio por defecto
  const filtrosActivos = Object.entries(filtros)
    .filter(([key, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => {
      // Si el valor es un objeto Date, lo formateamos
      if (value instanceof Date) {
        return `${key}: ${formatFechaDDMMYYYY(value)}`;
      }
      return `${key}: ${value}`;
    });

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
    styles: { fontSize: 10, cellPadding: 2, halign: 'center', valign: 'middle' },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    didDrawPage: (data) => {
      // ====== 🔹 4️⃣ Pie de página ======
      const pageCount = doc.internal.getNumberOfPages();
      const pageCurrent = doc.internal.getCurrentPageInfo().pageNumber;
      const footerYBase = pageHeight - 25;
      const lineHeight = 5;

      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.setFont('helvetica', 'normal');

      // Numeración centrada
      doc.text(`Página ${pageCurrent} de ${pageCount}`, pageWidth / 2, footerYBase, { align: 'center' });

      // Contacto (izquierda)
      doc.text(
        'Taller Mecatrónica Vedia | Contacto: +591 72962112 | Email: limbertja@gmail.com',
        10,
        footerYBase + lineHeight,
        { align: 'left' }
      );

      // Referencia (derecha)
      doc.text('Ref: Reporte de Vehículos', pageWidth - 10, footerYBase + lineHeight, { align: 'right' });
    },
  });

  // ====== 🔹 5️⃣ Total de registros ======
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total de vehículos: ${vehiculos.length}`, 10, finalY);

  // ====== 🔹 6️⃣ Guardar PDF ======
  const fechaArchivo = formatFechaDDMMYYYY(new Date()).replace(/\//g, '-');
  doc.save(`Reporte_Vehiculos_${fechaArchivo}.pdf`);
}
