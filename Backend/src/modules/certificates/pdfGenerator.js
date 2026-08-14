import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Ensure folder exists
const createFolderIfNotExist = (folderPath) => {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
};

export const generateCertificatePDF = (certData) => {
    return new Promise((resolve, reject) => {
        try {
            const destDir = 'uploads/certificates/';
            createFolderIfNotExist(destDir);
            
            const filename = `cert-${certData.certificateId}.pdf`;
            const filePath = path.join(destDir, filename);
            const relativePath = `/uploads/certificates/${filename}`;
            
            // Create a landscape document (A4: 841.89 x 595.28)
            const doc = new PDFDocument({
                size: 'A4',
                layout: 'landscape',
                margins: { top: 40, bottom: 40, left: 40, right: 40 }
            });
            
            const writeStream = fs.createWriteStream(filePath);
            doc.pipe(writeStream);
            
            // 🎨 Elegant double border design
            doc.rect(20, 20, 801.89, 555.28)
               .lineWidth(3)
               .stroke('hsl(217, 91%, 60%)'); // Accent color border
               
            doc.rect(26, 26, 789.89, 543.28)
               .lineWidth(1)
               .stroke('rgba(255, 255, 255, 0.1)'); // Inner border
            
            // 🌟 Header Sparkles/Logo Placeholder
            doc.fillColor('hsl(217, 91%, 60%)')
               .fontSize(36)
               .font('Helvetica-Bold')
               .text('UNITY NGO NETWORK', 40, 70, { align: 'center' });
               
            doc.moveDown(0.2);
            doc.fillColor('#9ca3af')
               .fontSize(11)
               .font('Helvetica-Oblique')
               .text('COMMUNITY EMPOWERMENT & RELIEF INITIATIVE', { align: 'center' });
            
            // 🏅 Certificate Title
            doc.moveDown(2);
            doc.fillColor('#ffffff')
               .fontSize(28)
               .font('Times-Bold')
               .text('Certificate of Appreciation', { align: 'center' });
            
            // Presenting to label
            doc.moveDown(1.5);
            doc.fillColor('#9ca3af')
               .fontSize(14)
               .font('Helvetica')
               .text('THIS CERTIFICATE IS PROUDLY PRESENTED TO', { align: 'center' });
               
            // Volunteer Name
            doc.moveDown(0.8);
            doc.fillColor('hsl(270, 91%, 65%)') // Accent gradient secondary (Neon purple-like)
               .fontSize(28)
               .font('Helvetica-Bold')
               .text(`${certData.volunteerName.toUpperCase()}`, { align: 'center' });
               
            // Underline for name
            doc.moveTo(150, doc.y + 4)
               .lineTo(doc.page.width - 150, doc.y + 4)
               .lineWidth(1.5)
               .stroke('rgba(255, 255, 255, 0.2)');
            
            // Appreciation Text
            doc.moveDown(2);
            doc.fillColor('#d1d5db')
               .fontSize(14)
               .font('Helvetica')
               .text(`For outstanding and dedicated voluntary service contributing `, { align: 'center', continued: true })
               .fillColor('#ffffff')
               .font('Helvetica-Bold')
               .text(`${certData.hoursLogged} hours `)
               .fillColor('#d1d5db')
               .font('Helvetica')
               .text(`to the charity campaign: `, { continued: true })
               .fillColor('#ffffff')
               .font('Helvetica-Bold')
               .text(`"${certData.campaignTitle}"`);
            
            // Signatures block at bottom
            doc.moveDown(4.5);
            const bottomY = doc.y;
            
            // Left Signature (Authorized Rep)
            doc.moveTo(80, bottomY)
               .lineTo(280, bottomY)
               .lineWidth(1)
               .stroke('#9ca3af');
            doc.fillColor('#ffffff')
               .fontSize(11)
               .font('Helvetica-Bold')
               .text('AUTHORIZED ADMINISTRATOR', 80, bottomY + 8, { width: 200, align: 'center' });
            doc.fillColor('#9ca3af')
               .fontSize(9)
               .font('Helvetica')
               .text(`Signed by: ${certData.signerName}`, 80, bottomY + 24, { width: 200, align: 'center' });
               
            // Right Signature (Date)
            doc.moveTo(560, bottomY)
               .lineTo(760, bottomY)
               .lineWidth(1)
               .stroke('#9ca3af');
            doc.fillColor('#ffffff')
               .fontSize(11)
               .font('Helvetica-Bold')
               .text('DATE OF ISSUANCE', 560, bottomY + 8, { width: 200, align: 'center' });
            doc.fillColor('#9ca3af')
               .fontSize(9)
               .font('Helvetica')
               .text(new Date(certData.issueDate).toLocaleDateString(), 560, bottomY + 24, { width: 200, align: 'center' });
               
            // 🔐 Cryptographic Footer Verification Key
            doc.fillColor('#6b7280')
               .fontSize(8)
               .font('Courier')
               .text(`VERIFIABLE CRYPTOGRAPHIC TOKEN: ${certData.certificateId}`, 40, doc.page.height - 35, { align: 'center' });
               
            doc.end();
            
            writeStream.on('finish', () => {
                resolve(relativePath);
            });
            
            writeStream.on('error', (err) => {
                reject(err);
            });
        } catch (error) {
            reject(error);
        }
    });
};
