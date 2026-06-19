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

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
        Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry<TEntity> Entry<TEntity>(TEntity entity) where TEntity : class;
    }
}
