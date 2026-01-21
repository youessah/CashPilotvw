import jsPDF from 'jspdf';
import { Transaction } from '@/type';

export const generatePDF = (transactions: Transaction[], totalAmount: number, totalCount: number) => {
    const doc = new jsPDF();

    // Branding
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text("Rapport Financier - FindTrack", 20, 20);

    // Date
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Généré le: ${new Date().toLocaleDateString()} à ${new Date().toLocaleTimeString()}`, 20, 30);

    // Divider
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);

    // Summary
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Résumé", 20, 50);

    doc.setFontSize(12);
    doc.text(`Solde Total: ${totalAmount} FCFA`, 20, 60);
    doc.text(`Nombre de transactions: ${totalCount}`, 20, 70);

    // Transactions Title
    doc.setFontSize(16);
    doc.text("Dernières Transactions", 20, 90);

    // Divider
    doc.line(20, 95, 190, 95);

    let y = 105;

    // Headers
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Description", 20, y);
    doc.text("Date", 100, y);
    doc.text("Montant", 160, y);

    y += 10;
    doc.setTextColor(0, 0, 0);

    transactions.forEach((t) => {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }

        // Simple truncation for description
        const description = t.description.length > 30 ? t.description.substring(0, 30) + '...' : t.description;

        doc.text(description, 20, y);
        doc.text(new Date(t.createdAt).toLocaleDateString(), 100, y);
        doc.text(`${t.amount} FCFA`, 160, y);

        y += 10;
    });

    doc.save("rapport_financier.pdf");
};
