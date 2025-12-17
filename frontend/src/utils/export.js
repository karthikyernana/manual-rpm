import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePDF = async (patient, vitals) => {
  const doc = new jsPDF();
  
  // Brand colors - Vitalis teal
  const brandColor = [16, 185, 129]; // #10b981 (teal-500)
  const brandDark = [13, 148, 103]; // #0d9488 (teal-600)
  
  // Header with brand styling
  doc.setFillColor(...brandColor);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 35, 'F');
  
  // Logo text
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Vitalis', 20, 18);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Patient Vitals Report', 20, 26);
  
  // Report metadata on right
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString()}`, doc.internal.pageSize.getWidth() - 20, 18, { align: 'right' });
  doc.text(`Report ID: VR-${Date.now().toString(36).toUpperCase()}`, doc.internal.pageSize.getWidth() - 20, 26, { align: 'right' });
  
  // Patient name banner
  doc.setFillColor(240, 253, 250); // Very light teal
  doc.rect(0, 35, doc.internal.pageSize.getWidth(), 15, 'F');
  doc.setTextColor(...brandDark);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Patient: ${patient.name}`, 20, 45);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`MRN: ${patient.mrn}`, doc.internal.pageSize.getWidth() - 20, 45, { align: 'right' });
  
  // Patient Information Section
  doc.setFontSize(12);
  doc.setTextColor(31, 41, 55); // Gray-800
  doc.setFont('helvetica', 'bold');
  doc.text('Patient Details', 20, 60);
  
  const patientInfo = [
    ['Full Name', patient.name],
    ['Medical Record Number (MRN)', patient.mrn],
    ['Gender', patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)],
    ['Date of Birth', new Date(patient.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
    ['Ward / Location', `${patient.ward}${patient.bed ? ` • Bed ${patient.bed}` : ''}`],
    ['Vitals Template', patient.template || 'Standard'],
    ['Primary Care Provider', patient.primaryNurse?.name || 'Not Assigned'],
    ['Last Updated', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })]
  ];
  
  autoTable(doc, {
    startY: 65,
    head: [],
    body: patientInfo,
    theme: 'plain',
    styles: { 
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60, textColor: [107, 114, 128] },
      1: { cellWidth: 'auto', textColor: [31, 41, 55] }
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251]
    }
  });
  
  // Vitals History Section
  let finalY = doc.lastAutoTable.finalY + 15;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('Vitals History', 20, finalY);
  
  if (vitals && vitals.length > 0) {
    // Collect all unique vital fields
    const allFields = new Set();
    vitals.forEach(v => {
      Object.keys(v.vitals).forEach(key => allFields.add(key));
    });
    
    // Format field names for headers
    const formatFieldName = (field) => {
      return field
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
    };
    
    const headers = ['Date', 'Time', ...Array.from(allFields).map(formatFieldName), 'Status'];
    const rows = vitals.map(vital => {
      const date = new Date(vital.recordedAt);
      const row = [
        date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }),
        date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      ];
      allFields.forEach(field => {
        const value = vital.vitals[field];
        row.push(value !== undefined ? (typeof value === 'boolean' ? (value ? '✓' : '✗') : value.toString()) : '—');
      });
      row.push(vital.flagged ? '⚠ Flagged' : 'Normal');
      return row;
    });
    
    autoTable(doc, {
      startY: finalY + 5,
      head: [headers],
      body: rows,
      theme: 'striped',
      styles: { 
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: { 
        fillColor: brandColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 253, 250]
      },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 18 }
      },
      didParseCell: function(data) {
        // Highlight flagged rows
        if (data.section === 'body' && data.row.raw[data.row.raw.length - 1].includes('Flagged')) {
          data.cell.styles.fillColor = [254, 242, 242];
          data.cell.styles.textColor = [185, 28, 28];
        }
      }
    });
  } else {
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text('No vitals recorded for this patient yet.', 20, finalY + 10);
  }
  
  // Footer on all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Footer line
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setDrawColor(...brandColor);
    doc.setLineWidth(0.5);
    doc.line(20, pageHeight - 20, doc.internal.pageSize.getWidth() - 20, pageHeight - 20);
    
    // Footer text
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(
      `Vitalis Patient Monitoring System`,
      20,
      pageHeight - 12
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      pageHeight - 12,
      { align: 'center' }
    );
    doc.text(
      `Confidential Medical Record`,
      doc.internal.pageSize.getWidth() - 20,
      pageHeight - 12,
      { align: 'right' }
    );
  }
  
  // Save with patient name
  const safePatientName = patient.name.replace(/[^a-z0-9]/gi, '_');
  doc.save(`Vitalis_${safePatientName}_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const downloadCSV = async (patientId, patientName = 'patient') => {
  try {
    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    
    const response = await fetch(`${apiUrl}/export/patient/${patientId}/csv`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'text/csv'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to download CSV');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Use patient name in filename
    const safePatientName = patientName.replace(/[^a-z0-9]/gi, '_');
    const dateStr = new Date().toISOString().split('T')[0];
    a.download = `Vitalis_${safePatientName}_Vitals_${dateStr}.csv`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('CSV download error:', error);
    throw error;
  }
};
