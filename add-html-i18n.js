const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'inventory-frontend/src/app/features');

// Helper to replace text in files
function replaceText(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    for (const [search, replace] of replacements) {
        // Use split/join to replace all occurrences
        if (search instanceof RegExp) {
            content = content.replace(search, replace);
        } else {
            content = content.split(search).join(replace);
        }
    }
    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${filePath}`);
    }
}

// 1. Reports Component
const reportsHtml = path.join(srcDir, 'reports/reports.component.html');
replaceText(reportsHtml, [
    ['Financial overview and inventory analysis.', "{{ 'REPORTS.SUBTITLE' | translate }}"],
    ['Refresh\n      </button>', "{{ 'REPORTS.REFRESH' | translate }}\n      </button>"],
    ['Inventory Valuation', "{{ 'REPORTS.INVENTORY_VALUATION' | translate }}"],
    ['ABC Analysis\n      </button>', "{{ 'REPORTS.ABC_ANALYSIS' | translate }}\n      </button>"],
    ['Total Network Value', "{{ 'REPORTS.TOTAL_NETWORK_VALUE' | translate }}"],
    ['<th>Warehouse</th>', "<th>{{ 'REPORTS.WAREHOUSE' | translate }}</th>"],
    ['>Total Items</th>', ">{{ 'REPORTS.TOTAL_ITEMS' | translate }}</th>"],
    ['>Total Value</th>', ">{{ 'REPORTS.TOTAL_VALUE' | translate }}</th>"],
    ['No valuation data available.', "{{ 'REPORTS.NO_VALUATION' | translate }}"],
    ['ABC Analysis (by Value)', "{{ 'REPORTS.ABC_ANALYSIS_BY_VALUE' | translate }}"],
    ['Products are classified based on their total value contribution to the inventory.', "{{ 'REPORTS.ABC_DESC' | translate }}"],
    ['Class A:', "{{ 'REPORTS.CLASS_A' | translate }}"],
    ['Class B:', "{{ 'REPORTS.CLASS_B' | translate }}"],
    ['Class C:', "{{ 'REPORTS.CLASS_C' | translate }}"],
    ['Top 80% of value.', "{{ 'REPORTS.TOP_80' | translate }}"],
    ['Next 15% of value.', "{{ 'REPORTS.NEXT_15' | translate }}"],
    ['Bottom 5% of value.', "{{ 'REPORTS.BOTTOM_5' | translate }}"],
    ['<th>Class</th>', "<th>{{ 'REPORTS.CLASS' | translate }}</th>"],
    ['<th>Product</th>', "<th>{{ 'REPORTS.PRODUCT' | translate }}</th>"],
    ['>Total Qty</th>', ">{{ 'REPORTS.TOTAL_QTY' | translate }}</th>"],
    ['>Unit WAC</th>', ">{{ 'REPORTS.UNIT_WAC' | translate }}</th>"],
    ['>Cumulative %</th>', ">{{ 'REPORTS.CUMULATIVE_PERC' | translate }}</th>"],
    ['No ABC data available.', "{{ 'REPORTS.NO_ABC' | translate }}"]
]);

// 2. Low Stock Component
const lowStockHtml = path.join(srcDir, 'reports/low-stock/low-stock.component.html');
if (fs.existsSync(lowStockHtml)) {
    replaceText(lowStockHtml, [
        ['<h1 class="page-title">Low Stock Alerts</h1>', '<h1 class="page-title">{{ \'LOW_STOCK.TITLE\' | translate }}</h1>'],
        ['<p class="page-subtitle">Products below minimum required stock levels.</p>', '<p class="page-subtitle">{{ \'LOW_STOCK.SUBTITLE\' | translate }}</p>'],
        ['Refresh\n      </button>', "{{ 'LOW_STOCK.REFRESH' | translate }}\n      </button>"],
        ['No low stock alerts at this time.', "{{ 'LOW_STOCK.NO_ALERTS' | translate }}"],
        ['<span class="detail-label">Current Quantity</span>', '<span class="detail-label">{{ \'LOW_STOCK.CURRENT_QTY\' | translate }}</span>'],
        ['<span class="detail-label">Minimum Required</span>', '<span class="detail-label">{{ \'LOW_STOCK.MIN_QTY\' | translate }}</span>'],
        ['<span class="detail-label">Deficit</span>', '<span class="detail-label">{{ \'LOW_STOCK.DEFICIT\' | translate }}</span>'],
        ['<span class="detail-label">Warehouse</span>', '<span class="detail-label">{{ \'LOW_STOCK.WAREHOUSE\' | translate }}</span>'],
        ['<span class="detail-label">Primary Supplier</span>', '<span class="detail-label">{{ \'LOW_STOCK.SUPPLIER\' | translate }}</span>'],
        ['<span class="restock-badge">Restock Needed</span>', '<span class="restock-badge">{{ \'LOW_STOCK.RESTOCK\' | translate }}</span>'],
        ['N/A', "{{ 'LOW_STOCK.N_A' | translate }}"]
    ]);
}

// 3. Purchase Orders Component
const purchaseOrdersHtml = path.join(srcDir, 'purchase-orders/purchase-orders.component.html');
if (fs.existsSync(purchaseOrdersHtml)) {
    replaceText(purchaseOrdersHtml, [
        ['<h1 class="page-title">Purchase Orders</h1>', '<h1 class="page-title">{{ \'PURCHASE_ORDERS.TITLE\' | translate }}</h1>'],
        ['<p class="page-subtitle">Manage your inbound stock and supplier orders</p>', '<p class="page-subtitle">{{ \'PURCHASE_ORDERS.SUBTITLE\' | translate }}</p>'],
        ['New Purchase Order\n      </button>', "{{ 'PURCHASE_ORDERS.NEW_ORDER' | translate }}\n      </button>"],
        ['Export Excel\n        </button>', "{{ 'PURCHASE_ORDERS.EXPORT_EXCEL' | translate }}\n        </button>"],
        ['Export PDF\n        </button>', "{{ 'PURCHASE_ORDERS.EXPORT_PDF' | translate }}\n        </button>"],
        ['<th>Order #</th>', "<th>{{ 'PURCHASE_ORDERS.ORDER_NO' | translate }}</th>"],
        ['<th>Date</th>', "<th>{{ 'PURCHASE_ORDERS.DATE' | translate }}</th>"],
        ['<th>Supplier</th>', "<th>{{ 'PURCHASE_ORDERS.SUPPLIER' | translate }}</th>"],
        ['<th>Warehouse</th>', "<th>{{ 'PURCHASE_ORDERS.WAREHOUSE' | translate }}</th>"],
        ['<th>Total</th>', "<th>{{ 'PURCHASE_ORDERS.TOTAL' | translate }}</th>"],
        ['<th>Status</th>', "<th>{{ 'COMMON.STATUS' | translate }}</th>"],
        ['<th>Actions</th>', "<th>{{ 'COMMON.ACTIONS' | translate }}</th>"],
        ['No purchase orders found.', "{{ 'PURCHASE_ORDERS.NO_ORDERS' | translate }}"],
        ['Receive\n                  </button>', "{{ 'PURCHASE_ORDERS.RECEIVE' | translate }}\n                  </button>"],
        ['Create Purchase Order', "{{ 'PURCHASE_ORDERS.CREATE_TITLE' | translate }}"],
        ['>Supplier<', ">{{ 'PURCHASE_ORDERS.SUPPLIER' | translate }}<"],
        ['>Warehouse<', ">{{ 'PURCHASE_ORDERS.WAREHOUSE' | translate }}<"],
        ['>Notes<', ">{{ 'PURCHASE_ORDERS.NOTES' | translate }}<"],
        ['>Product<', ">{{ 'PURCHASE_ORDERS.PRODUCT' | translate }}<"],
        ['>Qty<', ">{{ 'PURCHASE_ORDERS.QTY' | translate }}<"],
        ['>Unit Cost<', ">{{ 'PURCHASE_ORDERS.UNIT_COST' | translate }}<"],
        ['Add Item\n            </button>', "{{ 'PURCHASE_ORDERS.ADD_ITEM' | translate }}\n            </button>"],
        ['Receive Purchase Order', "{{ 'PURCHASE_ORDERS.RECEIVE_TITLE' | translate }}"],
        ['>Ordered<', ">{{ 'PURCHASE_ORDERS.ORDERED' | translate }}<"],
        ['>Received<', ">{{ 'PURCHASE_ORDERS.RECEIVED' | translate }}<"],
        ['>Receiving<', ">{{ 'PURCHASE_ORDERS.RECEIVING' | translate }}<"]
    ]);
}

// 4. Sales Orders Component
const salesOrdersHtml = path.join(srcDir, 'sales-orders/sales-orders.component.html');
if (fs.existsSync(salesOrdersHtml)) {
    replaceText(salesOrdersHtml, [
        ['<h1 class="page-title">Sales Orders</h1>', '<h1 class="page-title">{{ \'SALES_ORDERS.TITLE\' | translate }}</h1>'],
        ['<p class="page-subtitle">Manage outbound stock and customer orders</p>', '<p class="page-subtitle">{{ \'SALES_ORDERS.SUBTITLE\' | translate }}</p>'],
        ['New Sales Order\n      </button>', "{{ 'SALES_ORDERS.NEW_ORDER' | translate }}\n      </button>"],
        ['Export Excel\n        </button>', "{{ 'SALES_ORDERS.EXPORT_EXCEL' | translate }}\n        </button>"],
        ['Export PDF\n        </button>', "{{ 'SALES_ORDERS.EXPORT_PDF' | translate }}\n        </button>"],
        ['<th>Order #</th>', "<th>{{ 'SALES_ORDERS.ORDER_NO' | translate }}</th>"],
        ['<th>Date</th>', "<th>{{ 'SALES_ORDERS.DATE' | translate }}</th>"],
        ['<th>Customer</th>', "<th>{{ 'SALES_ORDERS.CUSTOMER' | translate }}</th>"],
        ['<th>Warehouse</th>', "<th>{{ 'SALES_ORDERS.WAREHOUSE' | translate }}</th>"],
        ['<th>Total</th>', "<th>{{ 'SALES_ORDERS.TOTAL' | translate }}</th>"],
        ['<th>Status</th>', "<th>{{ 'COMMON.STATUS' | translate }}</th>"],
        ['<th>Actions</th>', "<th>{{ 'COMMON.ACTIONS' | translate }}</th>"],
        ['No sales orders found.', "{{ 'SALES_ORDERS.NO_ORDERS' | translate }}"],
        ['Ship\n                  </button>', "{{ 'SALES_ORDERS.SHIP' | translate }}\n                  </button>"],
        ['Create Sales Order', "{{ 'SALES_ORDERS.CREATE_TITLE' | translate }}"],
        ['>Customer<', ">{{ 'SALES_ORDERS.CUSTOMER' | translate }}<"],
        ['>Warehouse<', ">{{ 'SALES_ORDERS.WAREHOUSE' | translate }}<"],
        ['>Notes<', ">{{ 'SALES_ORDERS.NOTES' | translate }}<"],
        ['>Product<', ">{{ 'SALES_ORDERS.PRODUCT' | translate }}<"],
        ['>Qty<', ">{{ 'SALES_ORDERS.QTY' | translate }}<"],
        ['>Unit Price<', ">{{ 'SALES_ORDERS.UNIT_PRICE' | translate }}<"],
        ['Add Item\n            </button>', "{{ 'SALES_ORDERS.ADD_ITEM' | translate }}\n            </button>"]
    ]);
}
