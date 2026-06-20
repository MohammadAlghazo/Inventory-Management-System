export interface SalesOrder {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName: string;
  warehouseId: number;
  warehouseName: string;
  status: string;
  statusCode: number;
  orderDate: string;
  expectedShipDate?: string;
  totalAmount: number;
  createdByName?: string;
  items: SalesOrderItem[];
}

export interface SalesOrderItem {
  id: number;
  productId: number;
  productName: string;
  productSKU: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface CreateSalesOrderDto {
  customerId: number;
  warehouseId: number;
  expectedShipDate?: string;
  items: CreateSalesOrderItemDto[];
}

export interface CreateSalesOrderItemDto {
  productId: number;
  quantity: number;
  unitPrice: number;
  discount: number;
}

export interface ShipSalesOrderDto {
  salesOrderId: number;
  trackingNumber: string;
  notes: string;
}
