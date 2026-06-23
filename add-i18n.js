const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'inventory-frontend/public/assets/i18n/en.json');
const arPath = path.join(__dirname, 'inventory-frontend/public/assets/i18n/ar.json');
const enSrcPath = path.join(__dirname, 'inventory-frontend/src/assets/i18n/en.json');
const arSrcPath = path.join(__dirname, 'inventory-frontend/src/assets/i18n/ar.json');

const updateI18n = (filePath, additions) => {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(content);
  for (const key of Object.keys(additions)) {
    data[key] = { ...data[key], ...additions[key] };
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
};

const enAdditions = {
  REPORTS: {
    TITLE: "Reports",
    SUBTITLE: "Financial overview and inventory analysis.",
    REFRESH: "Refresh",
    INVENTORY_VALUATION: "Inventory Valuation",
    ABC_ANALYSIS: "ABC Analysis",
    TOTAL_NETWORK_VALUE: "Total Network Value",
    WAREHOUSE: "Warehouse",
    TOTAL_ITEMS: "Total Items",
    TOTAL_VALUE: "Total Value",
    NO_VALUATION: "No valuation data available.",
    ABC_ANALYSIS_BY_VALUE: "ABC Analysis (by Value)",
    ABC_DESC: "Products are classified based on their total value contribution to the inventory.",
    CLASS_A: "Class A:",
    CLASS_B: "Class B:",
    CLASS_C: "Class C:",
    TOP_80: "Top 80% of value.",
    NEXT_15: "Next 15% of value.",
    BOTTOM_5: "Bottom 5% of value.",
    CLASS: "Class",
    PRODUCT: "Product",
    TOTAL_QTY: "Total Qty",
    UNIT_WAC: "Unit WAC",
    CUMULATIVE_PERC: "Cumulative %",
    NO_ABC: "No ABC data available."
  },
  LOW_STOCK: {
    TITLE: "Low Stock Alerts",
    SUBTITLE: "Products below minimum required stock levels.",
    REFRESH: "Refresh",
    NO_ALERTS: "No low stock alerts at this time.",
    CURRENT_QTY: "Current Quantity",
    MIN_QTY: "Minimum Required",
    DEFICIT: "Deficit",
    WAREHOUSE: "Warehouse",
    SUPPLIER: "Primary Supplier",
    RESTOCK: "Restock Needed",
    N_A: "N/A"
  },
  PURCHASE_ORDERS: {
    TITLE: "Purchase Orders",
    SUBTITLE: "Manage your inbound stock and supplier orders",
    NEW_ORDER: "New Purchase Order",
    EXPORT_EXCEL: "Export Excel",
    EXPORT_PDF: "Export PDF",
    ORDER_NO: "Order #",
    DATE: "Date",
    SUPPLIER: "Supplier",
    WAREHOUSE: "Warehouse",
    TOTAL: "Total",
    NO_ORDERS: "No purchase orders found.",
    RECEIVE: "Receive",
    CREATE_TITLE: "Create Purchase Order",
    NOTES: "Notes",
    ADD_ITEM: "Add Item",
    PRODUCT: "Product",
    QTY: "Qty",
    UNIT_COST: "Unit Cost",
    RECEIVE_TITLE: "Receive Purchase Order",
    ORDERED: "Ordered",
    RECEIVED: "Received",
    RECEIVING: "Receiving"
  },
  SALES_ORDERS: {
    TITLE: "Sales Orders",
    SUBTITLE: "Manage outbound stock and customer orders",
    NEW_ORDER: "New Sales Order",
    EXPORT_EXCEL: "Export Excel",
    EXPORT_PDF: "Export PDF",
    ORDER_NO: "Order #",
    DATE: "Date",
    CUSTOMER: "Customer",
    WAREHOUSE: "Warehouse",
    TOTAL: "Total",
    NO_ORDERS: "No sales orders found.",
    SHIP: "Ship",
    CREATE_TITLE: "Create Sales Order",
    NOTES: "Notes",
    ADD_ITEM: "Add Item",
    PRODUCT: "Product",
    QTY: "Qty",
    UNIT_PRICE: "Unit Price"
  }
};

const arAdditions = {
  REPORTS: {
    TITLE: "التقارير",
    SUBTITLE: "نظرة عامة مالية وتحليل المخزون.",
    REFRESH: "تحديث",
    INVENTORY_VALUATION: "تقييم المخزون",
    ABC_ANALYSIS: "تحليل ABC",
    TOTAL_NETWORK_VALUE: "إجمالي قيمة الشبكة",
    WAREHOUSE: "المستودع",
    TOTAL_ITEMS: "إجمالي العناصر",
    TOTAL_VALUE: "إجمالي القيمة",
    NO_VALUATION: "لا تتوفر بيانات تقييم.",
    ABC_ANALYSIS_BY_VALUE: "تحليل ABC (حسب القيمة)",
    ABC_DESC: "يتم تصنيف المنتجات بناءً على مساهمة القيمة الإجمالية في المخزون.",
    CLASS_A: "الفئة أ:",
    CLASS_B: "الفئة ب:",
    CLASS_C: "الفئة ج:",
    TOP_80: "أعلى 80% من القيمة.",
    NEXT_15: "الـ 15% التالية من القيمة.",
    BOTTOM_5: "أدنى 5% من القيمة.",
    CLASS: "الفئة",
    PRODUCT: "المنتج",
    TOTAL_QTY: "إجمالي الكمية",
    UNIT_WAC: "متوسط التكلفة المرجح للوحدة",
    CUMULATIVE_PERC: "النسبة التراكمية",
    NO_ABC: "لا تتوفر بيانات ABC."
  },
  LOW_STOCK: {
    TITLE: "تنبيهات نقص المخزون",
    SUBTITLE: "المنتجات التي تقل عن مستويات المخزون المطلوبة.",
    REFRESH: "تحديث",
    NO_ALERTS: "لا توجد تنبيهات نقص المخزون في هذا الوقت.",
    CURRENT_QTY: "الكمية الحالية",
    MIN_QTY: "الحد الأدنى المطلوب",
    DEFICIT: "العجز",
    WAREHOUSE: "المستودع",
    SUPPLIER: "المورد الأساسي",
    RESTOCK: "بحاجة لإعادة التخزين",
    N_A: "غير متوفر"
  },
  PURCHASE_ORDERS: {
    TITLE: "طلبات الشراء",
    SUBTITLE: "إدارة المخزون الوارد وطلبات الموردين",
    NEW_ORDER: "طلب شراء جديد",
    EXPORT_EXCEL: "تصدير لإكسل",
    EXPORT_PDF: "تصدير لـ PDF",
    ORDER_NO: "رقم الطلب",
    DATE: "التاريخ",
    SUPPLIER: "المورد",
    WAREHOUSE: "المستودع",
    TOTAL: "الإجمالي",
    NO_ORDERS: "لم يتم العثور على طلبات شراء.",
    RECEIVE: "استلام",
    CREATE_TITLE: "إنشاء طلب شراء",
    NOTES: "ملاحظات",
    ADD_ITEM: "إضافة عنصر",
    PRODUCT: "المنتج",
    QTY: "الكمية",
    UNIT_COST: "تكلفة الوحدة",
    RECEIVE_TITLE: "استلام طلب شراء",
    ORDERED: "مطلوب",
    RECEIVED: "مستلم",
    RECEIVING: "قيد الاستلام"
  },
  SALES_ORDERS: {
    TITLE: "طلبات البيع",
    SUBTITLE: "إدارة المخزون الصادر وطلبات العملاء",
    NEW_ORDER: "طلب بيع جديد",
    EXPORT_EXCEL: "تصدير لإكسل",
    EXPORT_PDF: "تصدير لـ PDF",
    ORDER_NO: "رقم الطلب",
    DATE: "التاريخ",
    CUSTOMER: "العميل",
    WAREHOUSE: "المستودع",
    TOTAL: "الإجمالي",
    NO_ORDERS: "لم يتم العثور على طلبات بيع.",
    SHIP: "شحن",
    CREATE_TITLE: "إنشاء طلب بيع",
    NOTES: "ملاحظات",
    ADD_ITEM: "إضافة عنصر",
    PRODUCT: "المنتج",
    QTY: "الكمية",
    UNIT_PRICE: "سعر الوحدة"
  }
};

updateI18n(enPath, enAdditions);
updateI18n(arPath, arAdditions);
updateI18n(enSrcPath, enAdditions);
updateI18n(arSrcPath, arAdditions);

console.log("i18n JSON files updated successfully.");
