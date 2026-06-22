export interface PurchaseOrder {
  id: number;
  orderNumber: string;
  supplierId: number;
  supplierName: string;
  warehouseId: number;
  warehouseName: string;
  status: string;
  statusCode: number;
  orderDate: string;
  expectedDate?: string;
  totalAmount: number;
  createdByName?: string;
  items: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: number;
  productId: number;
  productName: string;
  productSKU: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  totalCost: number;
}

export interface CreatePurchaseOrderDto {
  supplierId: number;
  warehouseId: number;
  expectedDate?: string;
  items: CreatePurchaseOrderItemDto[];
}

export interface CreatePurchaseOrderItemDto {
  productId: number;
  quantity: number;
  unitCost: number;
}

export interface ReceivePurchaseOrderDto {
  purchaseOrderId: number;
  notes: string;
  items: ReceivePurchaseOrderItemDto[];
}

export interface ReceivePurchaseOrderItemDto {
  productId: number;
  quantityReceived: number;
}
