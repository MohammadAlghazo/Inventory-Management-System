using InventoryManagement.Domain.Entities;

namespace InventoryManagement.Domain.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IRepository<Product> Products { get; }
        IRepository<InventoryLog> InventoryLogs { get; }
        IRepository<User> Users { get; }
        IRepository<Branch> Branches { get; }
        IRepository<Warehouse> Warehouses { get; }
        IRepository<Category> Categories { get; }
        IRepository<Brand> Brands { get; }
        IRepository<Unit> Units { get; }
        IRepository<Supplier> Suppliers { get; }
        IRepository<Customer> Customers { get; }
        IRepository<Notification> Notifications { get; }
        IRepository<Role> Roles { get; }
        IRepository<Permission> Permissions { get; }
        IRepository<RolePermission> RolePermissions { get; }
        IRepository<ActivityLog> ActivityLogs { get; }
        IRepository<ProductStock> ProductStocks { get; }
        IRepository<PurchaseOrder> PurchaseOrders { get; }
        IRepository<SalesOrder> SalesOrders { get; }
        IRepository<PurchaseOrderItem> PurchaseOrderItems { get; }
        IRepository<SalesOrderItem> SalesOrderItems { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
        void AddNotification(string title, string message, string type, string targetRole);
    }
}
