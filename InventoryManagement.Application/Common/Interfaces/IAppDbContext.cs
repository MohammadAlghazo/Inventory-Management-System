using InventoryManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Application.Common.Interfaces
{
    public interface IAppDbContext
    {
        DbSet<Product> Products { get; }
        DbSet<InventoryLog> InventoryLogs { get; }
        DbSet<User> Users { get; }
        DbSet<Branch> Branches { get; }
        DbSet<Warehouse> Warehouses { get; }
        DbSet<Category> Categories { get; }
        DbSet<Brand> Brands { get; }
        DbSet<Unit> Units { get; }
        DbSet<Supplier> Suppliers { get; }
        DbSet<Customer> Customers { get; }
        DbSet<Notification> Notifications { get; }
        DbSet<Role> Roles { get; }
        DbSet<Permission> Permissions { get; }
        DbSet<RolePermission> RolePermissions { get; }
        DbSet<ActivityLog> ActivityLogs { get; set; }
        DbSet<ProductStock> ProductStocks { get; set; }
        DbSet<PurchaseOrder> PurchaseOrders { get; set; }
        DbSet<SalesOrder> SalesOrders { get; set; }
        DbSet<PurchaseOrderItem> PurchaseOrderItems { get; set; }
        DbSet<SalesOrderItem> SalesOrderItems { get; set; }
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
        Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry<TEntity> Entry<TEntity>(TEntity entity) where TEntity : class;
    }
}
