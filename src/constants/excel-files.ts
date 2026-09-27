export type ExcelFileType = {
  id: string;
  title: string;
  description: string;
  fileName: string;
  downloadUrl: string;
};

export const excelFiles: ExcelFileType[] = [
  {
    id: "sales",
    title: "گزارش فروش",
    description: "تحلیل اطلاعات فروش و عملکرد محصولات",
    fileName: "binix-sales-template.xlsx",
    downloadUrl: "/templates/binix-sales-template.xlsx",
  },
  {
    id: "customers",
    title: "اطلاعات مشتریان",
    description: "تحلیل اطلاعات و رفتار مشتریان",
    fileName: "binix-customers-template.xlsx",
    downloadUrl: "/templates/binix-customers-template.xlsx",
  },
  {
    id: "inventory",
    title: "موجودی انبار",
    description: "تحلیل موجودی و وضعیت کالاها",
    fileName: "binix-inventory-template.xlsx",
    downloadUrl: "/templates/binix-inventory-template.xlsx",
  },
];