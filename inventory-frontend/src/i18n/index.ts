import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const en = {
  translation: {
    // Nav
    dashboard: 'Dashboard',
    products: 'Products',
    inventory: 'Inventory',
    reports: 'Reports',
    users: 'Users',
    settings: 'Settings',
    logout: 'Logout',

    // Auth
    login: 'Login',
    username: 'Username',
    password: 'Password',
    loginTitle: 'Welcome Back',
    loginSubtitle: 'Sign in to your account',
    loginBtn: 'Sign In',
    loggingIn: 'Signing in...',
    invalidCredentials: 'Invalid username or password',

    // Dashboard
    totalProducts: 'Total Products',
    lowStock: 'Low Stock',
    outOfStock: 'Out of Stock',
    inventoryValue: 'Inventory Value',
    todayMovements: "Today's Movements",
    totalUsers: 'Total Users',
    categories: 'Categories',
    activityChart: 'Stock Activity (Last 30 Days)',
    categoryBreakdown: 'Inventory by Category',
    topProducts: 'Most Active Products',
    recentMovements: 'Recent Movements',

    // Products
    addProduct: 'Add Product',
    editProduct: 'Edit Product',
    deleteProduct: 'Delete Product',
    productName: 'Product Name',
    sku: 'SKU',
    price: 'Price',
    quantity: 'Quantity',
    minQuantity: 'Min. Quantity',
    category: 'Category',
    description: 'Description',
    unit: 'Unit',
    supplier: 'Supplier',
    imageUrl: 'Image URL',
    search: 'Search...',
    allCategories: 'All Categories',
    inStock: 'In Stock',
    lowStockBadge: 'Low Stock',
    outOfStockBadge: 'Out of Stock',
    actions: 'Actions',
    edit: 'Edit',
    delete: 'Delete',
    cancel: 'Cancel',
    save: 'Save',
    saving: 'Saving...',
    confirm: 'Confirm',
    confirmDelete: 'Are you sure you want to delete this product?',
    noProducts: 'No products found',

    // Inventory
    addStock: 'Add Stock',
    sellStock: 'Sell',
    adjustStock: 'Adjust',
    returnStock: 'Return',
    quantityToAdd: 'Quantity to Add',
    quantityToSell: 'Quantity to Sell',
    newQuantity: 'New Quantity',
    quantityToReturn: 'Quantity to Return',
    notes: 'Notes (optional)',
    allActions: 'All Actions',
    from: 'From',
    to: 'To',
    action: 'Action',
    product: 'Product',
    changedBy: 'Changed By',
    date: 'Date',
    previous: 'Previous',
    new: 'New',
    change: 'Change',
    noLogs: 'No inventory movements found',

    // Users
    addUser: 'Add User',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    role: 'Role',
    manager: 'Manager',
    employee: 'Employee',
    active: 'Active',
    inactive: 'Inactive',
    toggleStatus: 'Toggle Status',
    noUsers: 'No users found',

    // Common
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success',
    total: 'Total',
    page: 'Page',
    of: 'of',
    items: 'items',
    showing: 'Showing',

    // Units
    piece: 'Piece',
    kg: 'Kilogram',
    liter: 'Liter',
    box: 'Box',
    meter: 'Meter',

    // Theme & Language
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    arabic: 'عربي',
    english: 'English',
  }
}

const ar = {
  translation: {
    // Nav
    dashboard: 'لوحة التحكم',
    products: 'المنتجات',
    inventory: 'المخزون',
    reports: 'التقارير',
    users: 'المستخدمون',
    settings: 'الإعدادات',
    logout: 'تسجيل الخروج',

    // Auth
    login: 'تسجيل الدخول',
    username: 'اسم المستخدم',
    password: 'كلمة المرور',
    loginTitle: 'مرحباً بعودتك',
    loginSubtitle: 'سجّل دخولك إلى حسابك',
    loginBtn: 'دخول',
    loggingIn: 'جارٍ تسجيل الدخول...',
    invalidCredentials: 'اسم مستخدم أو كلمة مرور غير صحيحة',

    // Dashboard
    totalProducts: 'إجمالي المنتجات',
    lowStock: 'مخزون منخفض',
    outOfStock: 'نفد المخزون',
    inventoryValue: 'قيمة المخزون',
    todayMovements: 'حركات اليوم',
    totalUsers: 'إجمالي المستخدمين',
    categories: 'الفئات',
    activityChart: 'نشاط المخزون (آخر 30 يوماً)',
    categoryBreakdown: 'المخزون حسب الفئة',
    topProducts: 'المنتجات الأكثر حركة',
    recentMovements: 'آخر الحركات',

    // Products
    addProduct: 'إضافة منتج',
    editProduct: 'تعديل المنتج',
    deleteProduct: 'حذف المنتج',
    productName: 'اسم المنتج',
    sku: 'كود المنتج (SKU)',
    price: 'السعر',
    quantity: 'الكمية',
    minQuantity: 'الحد الأدنى للكمية',
    category: 'الفئة',
    description: 'الوصف',
    unit: 'الوحدة',
    supplier: 'المورد',
    imageUrl: 'رابط الصورة',
    search: 'بحث...',
    allCategories: 'جميع الفئات',
    inStock: 'متوفر',
    lowStockBadge: 'مخزون منخفض',
    outOfStockBadge: 'نفد المخزون',
    actions: 'الإجراءات',
    edit: 'تعديل',
    delete: 'حذف',
    cancel: 'إلغاء',
    save: 'حفظ',
    saving: 'جارٍ الحفظ...',
    confirm: 'تأكيد',
    confirmDelete: 'هل أنت متأكد من حذف هذا المنتج؟',
    noProducts: 'لا توجد منتجات',

    // Inventory
    addStock: 'إضافة للمخزون',
    sellStock: 'بيع',
    adjustStock: 'تعديل',
    returnStock: 'إرجاع',
    quantityToAdd: 'الكمية المضافة',
    quantityToSell: 'الكمية المباعة',
    newQuantity: 'الكمية الجديدة',
    quantityToReturn: 'الكمية المرجعة',
    notes: 'ملاحظات (اختياري)',
    allActions: 'جميع الإجراءات',
    from: 'من',
    to: 'إلى',
    action: 'الإجراء',
    product: 'المنتج',
    changedBy: 'بواسطة',
    date: 'التاريخ',
    previous: 'السابق',
    new: 'الجديد',
    change: 'التغيير',
    noLogs: 'لا توجد حركات مخزون',

    // Users
    addUser: 'إضافة مستخدم',
    firstName: 'الاسم الأول',
    lastName: 'اسم العائلة',
    email: 'البريد الإلكتروني',
    role: 'الدور',
    manager: 'مدير',
    employee: 'موظف',
    active: 'نشط',
    inactive: 'معطّل',
    toggleStatus: 'تغيير الحالة',
    noUsers: 'لا يوجد مستخدمون',

    // Common
    loading: 'جارٍ التحميل...',
    error: 'حدث خطأ',
    success: 'تمت العملية بنجاح',
    total: 'الإجمالي',
    page: 'صفحة',
    of: 'من',
    items: 'عنصر',
    showing: 'عرض',

    // Units
    piece: 'قطعة',
    kg: 'كيلوجرام',
    liter: 'لتر',
    box: 'صندوق',
    meter: 'متر',

    // Theme & Language
    darkMode: 'الوضع الداكن',
    lightMode: 'الوضع الفاتح',
    arabic: 'عربي',
    english: 'English',
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources: { en, ar },
    lng: localStorage.getItem('inv-lang')
      ? JSON.parse(localStorage.getItem('inv-lang')!).state?.lang || 'en'
      : 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  })

export default i18n
