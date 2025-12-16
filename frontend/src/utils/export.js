import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePDF = async (patient, vitals) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235); // primary-600
  doc.text('Manual-RPM Patient Report', 20, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 28);
  
  // Patient Info
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Patient Information', 20, 40);
  
  const patientInfo = [
    ['Name', patient.name],
    ['MRN', patient.mrn],
    ['Gender', patient.gender],
    ['Date of Birth', new Date(patient.dob).toLocaleDateString()],
    ['Ward', `${patient.ward}${patient.bed ? ` - Bed ${patient.bed}` : ''}`],
    ['Template', patient.template],
    ['Primary Nurse', patient.primaryNurse?.name || 'N/A']
  ];
  
  doc.autoTable({
    startY: 45,
    head: [],
    body: patientInfo,
    theme: 'plain',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40 },
      1: { cellWidth: 'auto' }
    }
  });
  
  // Vitals History
  let finalY = doc.lastAutoTable.finalY + 10;
  
  doc.setFontSize(14);
  doc.text('Vitals History', 20, finalY);
  
  if (vitals && vitals.length > 0) {
    // Get all vital fields
    const allFields = new Set();
    vitals.forEach(v => {
      Object.keys(v.vitals).forEach(key => allFields.add(key));
    });
    
    const headers = ['Date & Time', ...Array.from(allFields), 'Flagged'];
    const rows = vitals.map(vital => {
      const row = [new Date(vital.recordedAt).toLocaleString()];
      allFields.forEach(field => {
        const value = vital.vitals[field];
        row.push(value !== undefined ? (typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value.toString()) : '-');
      });
      row.push(vital.flagged ? 'Yes' : 'No');
      return row;
    });
    
    doc.autoTable({
      startY: finalY + 5,
      head: [headers],
      body: rows,
      theme: 'striped',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] },
      didDrawCell: (data) => {
        if (data.column.index === headers.length - 1 && data.cell.raw === 'Yes') {
          doc.setTextColor(220, 38, 38); // red for flagged
        }
      }
    });
  } else {
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('No vitals recorded', 20, finalY + 10);
  }
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  // Save
  doc.save(`${patient.name}_report_${Date.now()}.pdf`);
};

export const downloadCSV = async (patientId) => {
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
    a.download = `patient_vitals_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('CSV download error:', error);
    throw error;
  }
};
