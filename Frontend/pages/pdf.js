import { useState, useEffect, React } from 'react';
import ReactDOM from 'react-dom';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import JsPDF from 'jspdf';
import 'jspdf-autotable';
import numberToWords from 'number-to-words';
import { NumerosALetras } from 'numero-a-letras';
// @mui
import {
  Card,
  Table,
  Stack,
  Paper,
  Avatar,
  Button,
  Popover,
  Checkbox,
  TableRow,
  MenuItem,
  TableBody,
  TableCell,
  Container,
  Typography,
  IconButton,
  TableContainer,
  TablePagination,
  TableHead,
  TextField,
} from '@mui/material';
// components
import Label from '../components/label';
import Iconify from '../components/iconify';
import { getlistacli, modificarCliente } from '../service/clienteservice';

export default function GenerarPDF({ pdf }) {
  const generarPDF = () => {
    console.log(pdf);
    const doc = new JsPDF();
    // Encabezado de la factura
    doc.setFontSize(18);
    doc.text('Factura', doc.internal.pageSize.getWidth() / 2, 10, { align: 'center' });

    // Datos del cliente
    doc.setFontSize(12);
    doc.text(`Fecha: ${pdf.fecha}`, 10, 20);
    doc.text(`Nombre: ${pdf.cli}`, 10, 30);
    doc.text(`Nit: ${pdf.nit}`, doc.internal.pageSize.getWidth() / 2, 20);

    // Tabla de productos
    const productos = pdf.descripcion;
    const total = pdf.total;
    const startY = 40;
    const columnas = ['Descripción', 'Total'];
    const filas = [[productos, total]];

    doc.autoTable({
      startY,
      head: [columnas],
      body: filas,
      styles: {
        cellPadding: 2,
        valign: 'middle', // Centrar verticalmente el texto en cada celda
        halign: 'center', // Centrar horizontalmente el texto en cada celda
      },
      didDrawCell: (data) => {
        if (data.section === 'body') {
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S'); // Dibujar borde negro alrededor de cada celda
        }
      },
    });

    // Total de la factura
    const totalLiteral = NumerosALetras(total); // Convertir total a su representación literal en español

    // doc.text(`Total: ${total}`, 10, doc.autoTable.previous.finalY + 10);
    doc.text(`Son: ${totalLiteral}`, 10, doc.autoTable.previous.finalY + 10);

    doc.save(`${pdf.cli}-factura.pdf`);
  };

  return (
    <>
      <button onClick={generarPDF}>Generar PDF</button>
    </>
  );
}

GenerarPDF.propTypes = {
  pdf: Yup.object()
    .shape({
      cli: Yup.string().required('Campo requerido.'),
      descripcion: Yup.string().required('Campo requerido.'),
      total: Yup.number().notRequired(),
    })
    .required('Campo requerido.'),
};
