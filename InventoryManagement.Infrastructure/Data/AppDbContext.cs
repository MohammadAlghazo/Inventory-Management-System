using InventoryManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Infrastructure.Data
{
    using InventoryManagement.Application.Common.Interfaces;
    public class AppDbContext : DbContext, IAppDbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(u => u.Username).IsUnique();
                entity.HasIndex(u => u.Email).IsUnique();

                entity.HasOne(u => u.Role).WithMany(r => r.Users).HasForeignKey(u => u.RoleId).OnDelete(DeleteBehavior.SetNull);
                entity.Property(u => u.IsActive).HasDefaultValue(true);
                entity.Property(u => u.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(u => u.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasData(new User
                {
                    Id = 1,
                    Username = "Admin",
                    Email = "admin@inventory.com",
                    FirstName = "Admin",
                    LastName = "User",
                    IsActive = true,
                    HashedPassword = "$2a$11$FodwrXysOiJ9lFlf1PZGZOQZH1fvBzBivVnSewumv5QTqlDIXh1/e",
                    RoleId = 1,
                    CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                });
            });

            modelBuilder.Entity<Product>(entity =>
            {
                entity.Property(p => p.Price).HasColumnType("decimal(18,2)");
                entity.Property(p => p.PurchasePrice).HasColumnType("decimal(18,2)");
                entity.Property(p => p.Tax).HasColumnType("decimal(18,2)");
                entity.Property(p => p.Weight).HasColumnType("decimal(18,2)");
                entity.Property(p => p.IsActive).HasDefaultValue(true);
                entity.Property(p => p.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(p => p.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.Ignore(p => p.IsLowStock);
                entity.Ignore(p => p.TotalValue);

                entity.HasOne(p => p.Category).WithMany(c => c.Products).HasForeignKey(p => p.CategoryId).OnDelete(DeleteBehavior.SetNull);
                entity.HasOne(p => p.Brand).WithMany(b => b.Products).HasForeignKey(p => p.BrandId).OnDelete(DeleteBehavior.SetNull);
                entity.HasOne(p => p.Unit).WithMany(u => u.Products).HasForeignKey(p => p.UnitId).OnDelete(DeleteBehavior.SetNull);
                entity.HasOne(p => p.Supplier).WithMany(s => s.Products).HasForeignKey(p => p.SupplierId).OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<InventoryLog>(entity =>
            {
                entity.Property(l => l.Action).HasConversion<string>(); 

                entity.HasOne(l => l.Product)
                      .WithMany(p => p.InventoryLogs)
                      .HasForeignKey(l => l.ProductId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(l => l.User)
                      .WithMany(u => u.InventoryLogs)
                      .HasForeignKey(l => l.UserId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(l => l.Warehouse).WithMany(w => w.InventoryLogs).HasForeignKey(l => l.WarehouseId).OnDelete(DeleteBehavior.SetNull);
                entity.HasOne(l => l.TargetWarehouse).WithMany().HasForeignKey(l => l.TargetWarehouseId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(l => l.Branch).WithMany().HasForeignKey(l => l.BranchId).OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasOne(c => c.ParentCategory)
                      .WithMany(c => c.SubCategories)
                      .HasForeignKey(c => c.ParentCategoryId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<RolePermission>(entity =>
            {
                entity.HasKey(rp => new { rp.RoleId, rp.PermissionId });
                entity.HasOne(rp => rp.Role).WithMany(r => r.RolePermissions).HasForeignKey(rp => rp.RoleId).OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(rp => rp.Permission).WithMany(p => p.RolePermissions).HasForeignKey(rp => rp.PermissionId).OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Role>().HasData(
                new Role { Id = 1, Name = "SuperAdmin", Description = "Full system access" },
                new Role { Id = 2, Name = "InventoryManager", Description = "Manage inventory and reports" },
                new Role { Id = 3, Name = "WarehouseStaff", Description = "Daily warehouse operations" }
            );

            modelBuilder.Entity<ProductStock>(entity =>
            {
                entity.HasKey(ps => new { ps.ProductId, ps.WarehouseId });
                entity.HasOne(ps => ps.Product).WithMany(p => p.ProductStocks).HasForeignKey(ps => ps.ProductId).OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(ps => ps.Warehouse).WithMany(w => w.ProductStocks).HasForeignKey(ps => ps.WarehouseId).OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<PurchaseOrder>(entity =>
            {
                entity.HasIndex(p => p.OrderNumber).IsUnique();
                entity.Property(p => p.TotalAmount).HasColumnType("decimal(18,2)");
                entity.HasOne(p => p.Supplier).WithMany().HasForeignKey(p => p.SupplierId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(p => p.Warehouse).WithMany().HasForeignKey(p => p.WarehouseId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(p => p.CreatedBy).WithMany().HasForeignKey(p => p.CreatedById).OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<PurchaseOrderItem>(entity =>
            {
                entity.Property(p => p.UnitCost).HasColumnType("decimal(18,2)");
                entity.Property(p => p.TotalCost).HasColumnType("decimal(18,2)");
                entity.HasOne(p => p.PurchaseOrder).WithMany(po => po.Items).HasForeignKey(p => p.PurchaseOrderId).OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(p => p.Product).WithMany().HasForeignKey(p => p.ProductId).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<SalesOrder>(entity =>
            {
                entity.HasIndex(s => s.OrderNumber).IsUnique();
                entity.Property(s => s.TotalAmount).HasColumnType("decimal(18,2)");
                entity.HasOne(s => s.Customer).WithMany().HasForeignKey(s => s.CustomerId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(s => s.Warehouse).WithMany().HasForeignKey(s => s.WarehouseId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(s => s.CreatedBy).WithMany().HasForeignKey(s => s.CreatedById).OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<SalesOrderItem>(entity =>
            {
                entity.Property(s => s.UnitPrice).HasColumnType("decimal(18,2)");
                entity.Property(s => s.Discount).HasColumnType("decimal(18,2)");
                entity.Property(s => s.Total).HasColumnType("decimal(18,2)");
                entity.HasOne(s => s.SalesOrder).WithMany(so => so.Items).HasForeignKey(s => s.SalesOrderId).OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(s => s.Product).WithMany().HasForeignKey(s => s.ProductId).OnDelete(DeleteBehavior.Restrict);
            });
        }

        public DbSet<Product> Products { get; set; }
        public DbSet<InventoryLog> InventoryLogs { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Branch> Branches { get; set; }
        public DbSet<Warehouse> Warehouses { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Brand> Brands { get; set; }
        public DbSet<Unit> Units { get; set; }
        public DbSet<Supplier> Suppliers { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<ActivityLog> ActivityLogs { get; set; }
        public DbSet<ProductStock> ProductStocks { get; set; }
        public DbSet<PurchaseOrder> PurchaseOrders { get; set; }
        public DbSet<PurchaseOrderItem> PurchaseOrderItems { get; set; }
        public DbSet<SalesOrder> SalesOrders { get; set; }
        public DbSet<SalesOrderItem> SalesOrderItems { get; set; }
    }
}