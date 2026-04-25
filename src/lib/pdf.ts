import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReceiptData {
  businessName: string;
  customerName: string;
  customerPhone: string;
  deviceString: string;
  imei: string;
  salePrice: number;
  saleDate: Date;
  paymentMethod: string;
  installments: number;
}

export const generateReceiptPDF = (data: ReceiptData) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(data.businessName || "Meu Lucro", 105, 20, { align: "center" });
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("Termo de Compra e Garantia", 105, 30, { align: "center" });
  
  // Separator
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);
  
  // Customer Info
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Dados do Cliente:", 20, 45);
  doc.setFont("helvetica", "normal");
  doc.text(`Nome: ${data.customerName || 'Não informado'}`, 20, 52);
  doc.text(`Telefone: ${data.customerPhone || 'Não informado'}`, 20, 59);
  
  // Device Info
  doc.setFont("helvetica", "bold");
  doc.text("Detalhes da Compra:", 20, 75);
  doc.setFont("helvetica", "normal");
  doc.text(`Aparelho: ${data.deviceString}`, 20, 82);
  doc.text(`IMEI/Serial: ${data.imei}`, 20, 89);
  doc.text(`Valor: R$ ${data.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, 96);
  
  const paymentTrans = {
    pix: 'PIX',
    credit: `Cartão de Crédito (${data.installments}x)`,
    debit: 'Cartão de Débito',
    cash: 'Dinheiro'
  };
  doc.text(`Forma de Pagamento: ${paymentTrans[data.paymentMethod as keyof typeof paymentTrans] || data.paymentMethod}`, 20, 103);
  doc.text(`Data: ${format(data.saleDate, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}`, 20, 110);
  
  // Separator
  doc.line(20, 120, 190, 120);
  
  // Warranty Terms
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("TERMOS DE GARANTIA (90 DIAS)", 105, 130, { align: "center" });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const warrantyText = [
    "1. Este aparelho possui garantia de 90 dias contra defeitos de fabricação a partir da data desta venda.",
    "2. A garantia NÃO cobre: danos causados por líquidos, quedas, mau uso, uso de carregadores paralelos ou",
    "atualizações de software mal sucedidas.",
    "3. A perda ou remoção do selo de garantia (se houver) implicará na perda imediata da garantia.",
    "4. Aparelhos com tela trincada, arranhada pós-compra ou oxidados perdem o direito à garantia.",
    "5. O tempo máximo para resolução de defeitos cobertos pela garantia é de até 30 dias."
  ];
  
  let currentY = 140;
  warrantyText.forEach(line => {
    doc.text(line, 20, currentY);
    currentY += 7;
  });
  
  // Signatures
  currentY += 30;
  doc.line(30, currentY, 90, currentY);
  doc.line(120, currentY, 180, currentY);
  
  doc.setFontSize(10);
  doc.text("Assinatura do Cliente", 60, currentY + 5, { align: "center" });
  doc.text("Assinatura do Vendedor", 150, currentY + 5, { align: "center" });
  
  // Save PDF
  doc.save(`Recibo_${data.customerName.replace(/\s+/g, '_')}_${format(data.saleDate, 'dd-MM-yyyy')}.pdf`);
};
