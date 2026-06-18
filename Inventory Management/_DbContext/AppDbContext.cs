using Inventory_Management.Models;
using Microsoft.EntityFrameworkCore;

namespace Inventory_Management._DbContext
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ── User ──────────────────────────────────────────
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(u => u.Username).IsUnique();
                entity.HasIndex(u => u.Email).IsUnique();

                entity.Property(u => u.Role).HasDefaultValue("Employee");
                entity.Property(u => u.IsActive).HasDefaultValue(true);
                entity.Property(u => u.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(u => u.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                // Seed default admin — password: Admin@123
                entity.HasData(new User
                {
                    Id = 1,
                    Username = "Admin",
                    Email = "admin@inventory.com",
                    FirstName = "Admin",
                    LastName = "User",
                    IsActive = true,
                    HashedPassword = "$2a$11$FodwrXysOiJ9lFlf1PZGZOQZH1fvBzBivVnSewumv5QTqlDIXh1/e",
                    Role = "Manager",
                    CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                });
            });

            // ── Product ───────────────────────────────────────
            modelBuilder.Entity<Product>(entity =>
            {
                entity.Property(p => p.Price).HasColumnType("decimal(18,2)");
                entity.Property(p => p.PurchasePrice).HasColumnType("decimal(18,2)");
                entity.Property(p => p.Tax).HasColumnType("decimal(18,2)");
                entity.Property(p => p.Weight).HasColumnType("decimal(18,2)");
                entity.Property(p => p.IsActive).HasDefaultValue(true);
                entity.Property(p => p.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(p => p.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

                // Ignore computed properties (not stored in DB)
                entity.Ignore(p => p.IsLowStock);
                entity.Ignore(p => p.TotalValue);

                // Relationships
                entity.HasOne(p => p.Category).WithMany(c => c.Products).HasForeignKey(p => p.CategoryId).OnDelete(DeleteBehavior.SetNull);
                entity.HasOne(p => p.Brand).WithMany(b => b.Products).HasForeignKey(p => p.BrandId).OnDelete(DeleteBehavior.SetNull);
                entity.HasOne(p => p.Unit).WithMany(u => u.Products).HasForeignKey(p => p.UnitId).OnDelete(DeleteBehavior.SetNull);
                entity.HasOne(p => p.Supplier).WithMany(s => s.Products).HasForeignKey(p => p.SupplierId).OnDelete(DeleteBehavior.SetNull);
            });

            // ── InventoryLog ──────────────────────────────────
            modelBuilder.Entity<InventoryLog>(entity =>
            {
                entity.Property(l => l.Action).HasConversion<string>(); // Store enum as string

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

            // ── Category ──────────────────────────────────────
            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasOne(c => c.ParentCategory)
                      .WithMany(c => c.SubCategories)
                      .HasForeignKey(c => c.ParentCategoryId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
        }

        // ── Tables ────────────────────────────────────────────
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
    }
}