using System;
using System.Collections.Generic;
using System.Linq;
using Inventory_Management.Models;

namespace Inventory_Management._DbContext
{
    public static class DbInitializer
    {
        public static void Seed(AppDbContext context)
        {
            // Ensure database exists
            context.Database.EnsureCreated();

            // 1. Seed Employee if not exists
            if (!context.Users.Any(u => u.Username == "Employee"))
            {
                context.Users.Add(new User
                {
                    Username = "Employee",
                    Email = "employee@inventory.com",
                    FirstName = "Staff",
                    LastName = "Member",
                    Role = "Employee",
                    IsActive = true,
                    HashedPassword = BCrypt.Net.BCrypt.HashPassword("Employee@1234"),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
                context.SaveChanges();
            }

            // 2. Categories
            var categories = new List<Category>();
            if (!context.Categories.Any())
            {
                categories.AddRange(new List<Category>
                {
                    new Category { Name = "Electronics", Description = "Phones, laptops, tablets, and accessories" },
                    new Category { Name = "Furniture", Description = "Desks, chairs, tables, and cabinets" },
                    new Category { Name = "Food & Beverages", Description = "Packaged goods, fresh produce, and drinks" },
                    new Category { Name = "Clothing", Description = "Apparel, footwear, and accessories" },
                    new Category { Name = "Office Supplies", Description = "Stationery, paper, and printers" }
                });
                context.Categories.AddRange(categories);
                context.SaveChanges();
            }
            else
            {
                categories = context.Categories.ToList();
            }

            // 3. Brands
            var brands = new List<Brand>();
            if (!context.Brands.Any())
            {
                brands.AddRange(new List<Brand>
                {
                    new Brand { Name = "Apple", Description = "Consumer electronics company" },
                    new Brand { Name = "Samsung", Description = "South Korean electronics multinational" },
                    new Brand { Name = "Dell", Description = "Computer technology company" },
                    new Brand { Name = "Ikea", Description = "Swedish ready-to-assemble furniture" },
                    new Brand { Name = "Generic", Description = "Non-branded general items" }
                });
                context.Brands.AddRange(brands);
                context.SaveChanges();
            }
            else
            {
                brands = context.Brands.ToList();
            }

            // 4. Units
            var units = new List<Unit>();
            if (!context.Units.Any())
            {
                units.AddRange(new List<Unit>
                {
                    new Unit { Name = "Pieces", Abbreviation = "pcs" },
                    new Unit { Name = "Kilograms", Abbreviation = "kg" },
                    new Unit { Name = "Boxes", Abbreviation = "box" },
                    new Unit { Name = "Packs", Abbreviation = "pack" }
                });
                context.Units.AddRange(units);
                context.SaveChanges();
            }
            else
            {
                units = context.Units.ToList();
            }

            // 5. Suppliers
            var suppliers = new List<Supplier>();
            if (!context.Suppliers.Any())
            {
                suppliers.AddRange(new List<Supplier>
                {
                    new Supplier { Name = "Tech Distributors Ltd", Phone = "+15550192", Email = "sales@techdist.com", Address = "100 Silicon Valley Way", TaxNumber = "TX-998877", IsActive = true },
                    new Supplier { Name = "Global Furniture Corp", Phone = "+15550183", Email = "contact@globalfurn.com", Address = "45 Timberland Ave", TaxNumber = "TX-445566", IsActive = true },
                    new Supplier { Name = "Fresh Foods Wholesale", Phone = "+15550144", Email = "orders@freshwholesale.com", Address = "88 Farm Lane", TaxNumber = "TX-112233", IsActive = true },
                    new Supplier { Name = "Office Depot Suppliers", Phone = "+15550155", Email = "support@officesupplies.com", Address = "22 Stationery Blvd", TaxNumber = "TX-334455", IsActive = true },
                    new Supplier { Name = "Fashion Hub Inc", Phone = "+15550166", Email = "info@fashionhub.com", Address = "90 Trendy St", TaxNumber = "TX-778899", IsActive = true }
                });
                context.Suppliers.AddRange(suppliers);
                context.SaveChanges();
            }
            else
            {
                suppliers = context.Suppliers.ToList();
            }

            // 6. Customers
            var customers = new List<Customer>();
            if (!context.Customers.Any())
            {
                customers.AddRange(new List<Customer>
                {
                    new Customer { Name = "John Doe", Phone = "+15550991", Email = "johndoe@gmail.com", Address = "12 Main St", IsActive = true },
                    new Customer { Name = "Jane Smith", Phone = "+15550992", Email = "janesmith@yahoo.com", Address = "34 Oak Rd", IsActive = true },
                    new Customer { Name = "Acme Corp", Phone = "+15550993", Email = "purchasing@acme.com", Address = "55 Enterprise Pkwy", IsActive = true },
                    new Customer { Name = "Retail Inc", Phone = "+15550994", Email = "store@retailinc.com", Address = "77 Commerce Blvd", IsActive = true },
                    new Customer { Name = "Tech Solutions", Phone = "+15550995", Email = "it@techsolutions.com", Address = "99 Innovation Dr", IsActive = true }
                });
                context.Customers.AddRange(customers);
                context.SaveChanges();
            }
            else
            {
                customers = context.Customers.ToList();
            }

            // 7. Products
            if (!context.Products.Any() && categories.Any() && brands.Any() && units.Any() && suppliers.Any())
            {
                var p1 = new Product { Name = "iPhone 15 Pro", SKU = "APP-IP15P", Description = "Apple iPhone 15 Pro 256GB", PurchasePrice = 899.00m, Price = 1099.00m, Quantity = 45, MinQuantity = 10, CategoryId = categories[0].Id, BrandId = brands[0].Id, UnitId = units[0].Id, SupplierId = suppliers[0].Id, IsActive = true };
                var p2 = new Product { Name = "Samsung Galaxy S24", SKU = "SAM-S24", Description = "Samsung Galaxy S24 Ultra", PurchasePrice = 950.00m, Price = 1199.00m, Quantity = 3, MinQuantity = 5, CategoryId = categories[0].Id, BrandId = brands[1].Id, UnitId = units[0].Id, SupplierId = suppliers[0].Id, IsActive = true }; // LOW STOCK
                var p3 = new Product { Name = "Dell Latitude 5440", SKU = "DEL-LAT5440", Description = "Dell Latitude Laptop 16GB RAM", PurchasePrice = 700.00m, Price = 899.00m, Quantity = 12, MinQuantity = 3, CategoryId = categories[0].Id, BrandId = brands[2].Id, UnitId = units[0].Id, SupplierId = suppliers[0].Id, IsActive = true };
                var p4 = new Product { Name = "Office Standing Desk", SKU = "IKE-STDESK", Description = "Adjustable height standing desk", PurchasePrice = 180.00m, Price = 299.00m, Quantity = 15, MinQuantity = 5, CategoryId = categories[1 % categories.Count].Id, BrandId = brands[3 % brands.Count].Id, UnitId = units[0].Id, SupplierId = suppliers[1 % suppliers.Count].Id, IsActive = true };
                var p5 = new Product { Name = "Ergonomic Office Chair", SKU = "IKE-ERGCHAIR", Description = "Mesh back ergonomic chair", PurchasePrice = 90.00m, Price = 150.00m, Quantity = 2, MinQuantity = 5, CategoryId = categories[1 % categories.Count].Id, BrandId = brands[3 % brands.Count].Id, UnitId = units[0].Id, SupplierId = suppliers[1 % suppliers.Count].Id, IsActive = true }; // LOW STOCK
                var p6 = new Product { Name = "Premium Arabica Coffee", SKU = "FOOD-COFFEE", Description = "1kg bag of roasted coffee beans", PurchasePrice = 12.00m, Price = 24.99m, Quantity = 120, MinQuantity = 20, CategoryId = categories[2 % categories.Count].Id, BrandId = brands[4 % brands.Count].Id, UnitId = units[1 % units.Count].Id, SupplierId = suppliers[2 % suppliers.Count].Id, IsActive = true };
                var p7 = new Product { Name = "Leather Jacket", SKU = "CLO-LTHJCKT", Description = "Genuine brown leather jacket", PurchasePrice = 60.00m, Price = 120.00m, Quantity = 0, MinQuantity = 5, CategoryId = categories[3 % categories.Count].Id, BrandId = brands[4 % brands.Count].Id, UnitId = units[0].Id, SupplierId = suppliers[4 % suppliers.Count].Id, IsActive = true }; // OUT OF STOCK
                var p8 = new Product { Name = "A4 Printer Paper", SKU = "OFF-PAPER", Description = "Ream of A4 printing paper 500 sheets", PurchasePrice = 3.00m, Price = 6.99m, Quantity = 250, MinQuantity = 50, CategoryId = categories[4 % categories.Count].Id, BrandId = brands[4 % brands.Count].Id, UnitId = units[2 % units.Count].Id, SupplierId = suppliers[3 % suppliers.Count].Id, IsActive = true };
                var p9 = new Product { Name = "Wireless Earbuds", SKU = "SAM-WIREAR", Description = "Samsung Galaxy Buds Pro", PurchasePrice = 80.00m, Price = 149.00m, Quantity = 4, MinQuantity = 10, CategoryId = categories[0].Id, BrandId = brands[1].Id, UnitId = units[0].Id, SupplierId = suppliers[0].Id, IsActive = true }; // LOW STOCK
                var p10 = new Product { Name = "Wireless Mouse", SKU = "GEN-MOUSE", Description = "Ergonomic 2.4G wireless mouse", PurchasePrice = 8.00m, Price = 19.99m, Quantity = 80, MinQuantity = 15, CategoryId = categories[0].Id, BrandId = brands[4].Id, UnitId = units[0].Id, SupplierId = suppliers[0].Id, IsActive = true };

                var products = new List<Product> { p1, p2, p3, p4, p5, p6, p7, p8, p9, p10 };
                context.Products.AddRange(products);
                context.SaveChanges();

                // 8. Inventory Logs (spanning past 7 days for charts)
                var adminUser = context.Users.FirstOrDefault(u => u.Role == "Manager") ?? context.Users.First();
                var staffUser = context.Users.FirstOrDefault(u => u.Role == "Employee") ?? context.Users.First();
                var logs = new List<InventoryLog>
                {
                    new InventoryLog { ProductId = p1.Id, UserId = adminUser.Id, Action = InventoryAction.Add, QuantityChanged = 50, PreviousQuantity = 0, NewQuantity = 50, Notes = "Initial batch import", ActionDate = DateTime.UtcNow.AddDays(-6) },
                    new InventoryLog { ProductId = p1.Id, UserId = staffUser.Id, Action = InventoryAction.Sell, QuantityChanged = 5, PreviousQuantity = 50, NewQuantity = 45, Notes = "Order #1001", ActionDate = DateTime.UtcNow.AddDays(-5) },
                    new InventoryLog { ProductId = p2.Id, UserId = adminUser.Id, Action = InventoryAction.Add, QuantityChanged = 10, PreviousQuantity = 0, NewQuantity = 10, Notes = "Supplier delivery", ActionDate = DateTime.UtcNow.AddDays(-5) },
                    new InventoryLog { ProductId = p2.Id, UserId = staffUser.Id, Action = InventoryAction.Sell, QuantityChanged = 7, PreviousQuantity = 10, NewQuantity = 3, Notes = "Order #1002 - stock below minimum threshold", ActionDate = DateTime.UtcNow.AddDays(-4) },
                    new InventoryLog { ProductId = p3.Id, UserId = adminUser.Id, Action = InventoryAction.Add, QuantityChanged = 15, PreviousQuantity = 0, NewQuantity = 15, Notes = "Office setup batch", ActionDate = DateTime.UtcNow.AddDays(-4) },
                    new InventoryLog { ProductId = p3.Id, UserId = staffUser.Id, Action = InventoryAction.Sell, QuantityChanged = 3, PreviousQuantity = 15, NewQuantity = 12, Notes = "Issued to developer team", ActionDate = DateTime.UtcNow.AddDays(-3) },
                    new InventoryLog { ProductId = p4.Id, UserId = adminUser.Id, Action = InventoryAction.Add, QuantityChanged = 15, PreviousQuantity = 0, NewQuantity = 15, Notes = "Initial stocking", ActionDate = DateTime.UtcNow.AddDays(-3) },
                    new InventoryLog { ProductId = p5.Id, UserId = adminUser.Id, Action = InventoryAction.Add, QuantityChanged = 5, PreviousQuantity = 0, NewQuantity = 5, Notes = "Initial stocking", ActionDate = DateTime.UtcNow.AddDays(-2) },
                    new InventoryLog { ProductId = p5.Id, UserId = staffUser.Id, Action = InventoryAction.Sell, QuantityChanged = 3, PreviousQuantity = 5, NewQuantity = 2, Notes = "Customer pick up", ActionDate = DateTime.UtcNow.AddDays(-2) },
                    new InventoryLog { ProductId = p6.Id, UserId = adminUser.Id, Action = InventoryAction.Add, QuantityChanged = 120, PreviousQuantity = 0, NewQuantity = 120, Notes = "Initial coffee shipment", ActionDate = DateTime.UtcNow.AddDays(-1) },
                    new InventoryLog { ProductId = p8.Id, UserId = staffUser.Id, Action = InventoryAction.Add, QuantityChanged = 250, PreviousQuantity = 0, NewQuantity = 250, Notes = "Ream delivery", ActionDate = DateTime.UtcNow.AddDays(-1) },
                    new InventoryLog { ProductId = p9.Id, UserId = adminUser.Id, Action = InventoryAction.Add, QuantityChanged = 10, PreviousQuantity = 0, NewQuantity = 10, Notes = "Supplier delivery", ActionDate = DateTime.UtcNow.AddDays(-1) },
                    new InventoryLog { ProductId = p9.Id, UserId = staffUser.Id, Action = InventoryAction.Sell, QuantityChanged = 6, PreviousQuantity = 10, NewQuantity = 4, Notes = "Order #1003", ActionDate = DateTime.UtcNow },
                    new InventoryLog { ProductId = p10.Id, UserId = staffUser.Id, Action = InventoryAction.Add, QuantityChanged = 80, PreviousQuantity = 0, NewQuantity = 80, Notes = "Restocked", ActionDate = DateTime.UtcNow }
                };
                context.InventoryLogs.AddRange(logs);
                context.SaveChanges();
            }
        }
    }
}
