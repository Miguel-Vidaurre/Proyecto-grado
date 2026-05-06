import React from 'react';
import JsPDF from 'jspdf';
import 'jspdf-autotable';
import { Button } from '@mui/material';

export default function PDFpruebas() {
  console.log('Generando PDF...');
  const doc = new JsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Encabezado alineado izquierda y derecha
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('GRACIELA FLORES COLQUE', 10, 10);
  doc.text('NIT 5051795015', pageWidth - 10, 10, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('CASA MATRIZ', 10, 16);
  doc.text('FACTURA N° 80', pageWidth - 10, 16, { align: 'right' });

  doc.text('No. Punto de Venta 0', 10, 22);
  doc.text('TARIJA', pageWidth - 10, 22, { align: 'right' });

  doc.text('LA PAZ Nro.: 862 Zona/Barrio: VIRGEN DE FATIMA', 10, 28);
  doc.text('CÓD. AUTORIZACIÓN', pageWidth - 10, 28, { align: 'right' });

  doc.text('159A8684F5EAF2B2B', pageWidth - 10, 34, { align: 'right' });
  doc.text('051A313C6C32F8AAF', pageWidth - 10, 40, { align: 'right' });
  doc.text('020E6920897F4C83C', pageWidth - 10, 46, { align: 'right' });
  doc.text('BFB1F74', pageWidth - 10, 52, { align: 'right' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURA (Con Derecho a Crédito Fiscal)', pageWidth / 2, 60, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Fecha: 29/05/2025 02:53 PM', 10, 68);
  doc.text('NIT/CI/CEX: 7484178016', 10, 74);
  doc.text('Nombre/Razón Social: JONATAN CONDORI FERNANDEZ', 10, 80);
  doc.text('Cod. Cliente: 7484178016', 10, 86);

  const columns = [
    { header: 'CÓDIGO', dataKey: 'codigo' },
    { header: 'DESCRIPCIÓN', dataKey: 'descripcion' },
    { header: 'CANTIDAD', dataKey: 'cantidad' },
    { header: 'P.UNIT', dataKey: 'precio' },
    { header: 'DESCUENTO', dataKey: 'descuento' },
    { header: 'SUBTOTAL', dataKey: 'subtotal' },
  ];

  const rows = [
    {
      codigo: '266',
      descripcion: 'WHOLE HOME MESH 300MBPS MERCUSYS HALO S3 2PACK',
      cantidad: '1',
      precio: '420.00',
      descuento: '0.00',
      subtotal: '420.00',
    },
    {
      codigo: '267',
      descripcion: 'WHOLE HOME MESH 300MBPS MERCUSYS HALO S3 3PACK',
      cantidad: '1',
      precio: '470.00',
      descuento: '0.00',
      subtotal: '470.00',
    },
  ];

  doc.autoTable({
    startY: 70,
    head: [columns.map((col) => col.header)],
    body: rows.map((row) => columns.map((col) => row[col.dataKey])),
    styles: { fontSize: 10 },
  });

  const finalY = doc.lastAutoTable.finalY + 10;
  doc.text('SUBTOTAL Bs: 890.00', 140, finalY);
  doc.text('DESCUENTO Bs: 0.00', 140, finalY + 7);
  doc.text('TOTAL Bs: 890.00', 140, finalY + 14);
  doc.text('MONTO A PAGAR Bs: 890.00', 140, finalY + 21);
  doc.text('IMPORTE BASE CRÉDITO FISCAL Bs: 890.00', 140, finalY + 28);

  doc.setFontSize(9);
  doc.text('ESTA FACTURA CONTRIBUYE AL DESARROLLO DEL PAÍS', 10, finalY + 45);
  doc.text(
    '“Este documento es la Representación Gráfica de un Documento Fiscal Digital emitido en una modalidad de facturación en línea”',
    10,
    finalY + 52
  );

  doc.save('factura_hoy.pdf');
}
