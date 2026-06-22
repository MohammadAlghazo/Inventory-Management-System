using System;
using System.Collections.Generic;
using System.Linq;
using InventoryManagement.Domain.Entities;

namespace InventoryManagement.Infrastructure.Data
{
    public static class DbInitializer
    {
        public static void Seed(AppDbContext context)
        {
            context.Database.EnsureCreated();

            // Ensure all 7 roles exist in case the DB was already created before we added them
            if (context.Roles.Count() < 7)
            {
                var existingRoleNames = context.Roles.Select(r => r.Name).ToList();
                var allRoles = new List<Role>
                {
                    new Role { Id = 1, Name = "SuperAdmin", Description = "Full system access" },
                    new Role { Id = 2, Name = "InventoryManager", Description = "Manage inventory and reports" },
                    new Role { Id = 3, Name = "WarehouseStaff", Description = "Daily warehouse operations" },
                    new Role { Id = 4, Name = "PurchasingOfficer", Description = "Manage suppliers and purchase orders" },
                    new Role { Id = 5, Name = "Sales", Description = "Manage customers and sales orders" },
                    new Role { Id = 6, Name = "Accountant", Description = "Financial reporting and analysis" },
                    new Role { Id = 7, Name = "Auditor", Description = "Read-only access for auditing" }
                };

                foreach (var role in allRoles)
                {
                    if (!existingRoleNames.Contains(role.Name))
                    {
                        // Ensure we don't insert explicit ID if Identity Insert is OFF (usually EF handles it)
                        // If it fails due to explicit ID, we can remove the ID assignment
                        context.Roles.Add(new Role { Name = role.Name, Description = role.Description });
                    }
                }
                context.SaveChanges();
            }

            // 1. Seed Users (Managers and Employees)
            var seededUsers = new List<User>();
            if (!context.Users.Any(u => u.Username == "rania"))
            {
                var usersToSeed = new List<User>
                {
                    new User
                    {
                        Username = "rania",
                        Email = "rania.kamal@stockmaster.com",
                        FirstName = "Rania",
                        LastName = "Kamal",
                        RoleId = 2,
                        IsActive = true,
                        HashedPassword = BCrypt.Net.BCrypt.HashPassword("User@123"),
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        Username = "ahmad",
                        Email = "ahmad.masri@stockmaster.com",
                        FirstName = "Ahmad",
                        LastName = "Masri",
                        RoleId = 2,
                        IsActive = true,
                        HashedPassword = BCrypt.Net.BCrypt.HashPassword("User@123"),
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        Username = "youssef",
                        Email = "youssef.mansour@stockmaster.com",
                        FirstName = "Youssef",
                        LastName = "Mansour",
                        RoleId = 3,
                        IsActive = true,
                        HashedPassword = BCrypt.Net.BCrypt.HashPassword("User@123"),
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        Username = "fatima",
                        Email = "fatima.hariri@stockmaster.com",
                        FirstName = "Fatima",
                        LastName = "Al-Hariri",
                        RoleId = 3,
                        IsActive = true,
                        HashedPassword = BCrypt.Net.BCrypt.HashPassword("User@123"),
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        Username = "layla",
                        Email = "layla.haddad@stockmaster.com",
                        FirstName = "Layla",
                        LastName = "Haddad",
                        RoleId = 3,
                        IsActive = true,
                        HashedPassword = BCrypt.Net.BCrypt.HashPassword("User@123"),
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        Username = "tareq",
                        Email = "tareq.othman@stockmaster.com",
                        FirstName = "Tareq",
                        LastName = "Othman",
                        RoleId = 3,
                        IsActive = true,
                        HashedPassword = BCrypt.Net.BCrypt.HashPassword("User@123"),
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        Username = "ziad",
                        Email = "ziad.nabulsi@stockmaster.com",
                        FirstName = "Ziad",
                        LastName = "Nabulsi",
                        RoleId = 3,
                        IsActive = true,
                        HashedPassword = BCrypt.Net.BCrypt.HashPassword("User@123"),
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        Username = "mona",
                        Email = "mona.sabah@stockmaster.com",
                        FirstName = "Mona",
                        LastName = "Sabah",
                        RoleId = 3,
                        IsActive = true,
                        HashedPassword = BCrypt.Net.BCrypt.HashPassword("User@123"),
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    }
                };

                context.Users.AddRange(usersToSeed);
                context.SaveChanges();
            }

            // EMERGENCY ADMIN ACCOUNT (Or reset if exists)
            var emergencyAdmin = context.Users.FirstOrDefault(u => u.Username == "admin");
            if (emergencyAdmin == null)
            {
                context.Users.Add(new User
                {
                    Username = "admin",
                    Email = "admin@stockmaster.com",
                    FirstName = "System",
                    LastName = "Admin",
                    RoleId = 1, // SuperAdmin
                    IsActive = true,
                    HashedPassword = BCrypt.Net.BCrypt.HashPassword("Admin@123!"),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
                context.SaveChanges();
            }


            // Also ensure the default Employee exists
            if (!context.Users.Any(u => u.Username == "Employee"))
            {
                context.Users.Add(new User
                {
                    Username = "Employee",
                    Email = "employee@inventory.com",
                    FirstName = "Staff",
                    LastName = "Member",
                    RoleId = 3,
                    IsActive = true,
                    HashedPassword = BCrypt.Net.BCrypt.HashPassword("Employee@1234"),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
                context.SaveChanges();
            }

            seededUsers = context.Users.ToList();

            // 2. Seed Lookups: Categories
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

            // Lookups: Brands
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

            // Lookups: Units
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

            // Lookups: Warehouses
            var warehouses = new List<Warehouse>();
            if (!context.Warehouses.Any())
            {
                warehouses.AddRange(new List<Warehouse>
                {
                    new Warehouse { Name = "Amman Central Warehouse", Location = "Jabal Amman, Amman", ManagerName = "Samer Halabi", Capacity = 10000, IsActive = true, CreatedAt = DateTime.UtcNow },
                    new Warehouse { Name = "Zarqa Northern Hub", Location = "Zarqa Free Zone, Zarqa", ManagerName = "Bashar Al-Masri", Capacity = 5000, IsActive = true, CreatedAt = DateTime.UtcNow },
                    new Warehouse { Name = "Aqaba Shipping Depot", Location = "Aqaba Port, Aqaba", ManagerName = "Fadi Haddad", Capacity = 15000, IsActive = true, CreatedAt = DateTime.UtcNow }
                });
                context.Warehouses.AddRange(warehouses);
                context.SaveChanges();
            }
            else
            {
                warehouses = context.Warehouses.ToList();
            }

            // 3. Seed Suppliers
            var suppliers = new List<Supplier>();
            if (!context.Suppliers.Any(s => s.Email.Contains("alhuda") || s.Email.Contains("modernfurn")))
            {
                var suppliersToSeed = new List<Supplier>
                {
                    new Supplier { Name = "Al-Huda Electronics", Phone = "+962791111111", Email = "info@alhuda-tech.com", Address = "Amman, Jordan", TaxNumber = "JO-112233", IsActive = true },
                    new Supplier { Name = "Modern Furniture Jordan", Phone = "+962792222222", Email = "sales@modernfurn.com", Address = "Zarqa, Jordan", TaxNumber = "JO-445566", IsActive = true },
                    new Supplier { Name = "Petra Food Distributors", Phone = "+962793333333", Email = "orders@petrafood.com", Address = "Aqaba, Jordan", TaxNumber = "JO-778899", IsActive = true },
                    new Supplier { Name = "Al-Waha Office Solutions", Phone = "+962794444444", Email = "support@alwaha-office.com", Address = "Irbid, Jordan", TaxNumber = "JO-334455", IsActive = true },
                    new Supplier { Name = "Amman Clothes Wholesalers", Phone = "+962795555555", Email = "sales@ammanclothes.com", Address = "Amman, Jordan", TaxNumber = "JO-998877", IsActive = true },
                    new Supplier { Name = "Red Sea Trading Company", Phone = "+962796666666", Email = "trade@redsea.com", Address = "Aqaba, Jordan", TaxNumber = "JO-556677", IsActive = true },
                    new Supplier { Name = "Al-Quds Paper & Stationery", Phone = "+962797777777", Email = "info@alqudsstationery.com", Address = "Salt, Jordan", TaxNumber = "JO-223344", IsActive = true },
                    new Supplier { Name = "Jabal Amman Brands", Phone = "+962798888888", Email = "contact@jabalamman.com", Address = "Amman, Jordan", TaxNumber = "JO-889900", IsActive = true }
                };
                context.Suppliers.AddRange(suppliersToSeed);
                context.SaveChanges();
            }

            // Also keep original suppliers if they existed
            if (!context.Suppliers.Any(s => s.Email == "sales@techdist.com"))
            {
                context.Suppliers.AddRange(new List<Supplier>
                {
                    new Supplier { Name = "Tech Distributors Ltd", Phone = "+15550192", Email = "sales@techdist.com", Address = "100 Silicon Valley Way", TaxNumber = "TX-998877", IsActive = true },
                    new Supplier { Name = "Global Furniture Corp", Phone = "+15550183", Email = "contact@globalfurn.com", Address = "45 Timberland Ave", TaxNumber = "TX-445566", IsActive = true },
                    new Supplier { Name = "Fresh Foods Wholesale", Phone = "+15550144", Email = "orders@freshwholesale.com", Address = "88 Farm Lane", TaxNumber = "TX-112233", IsActive = true },
                    new Supplier { Name = "Office Depot Suppliers", Phone = "+15550155", Email = "support@officesupplies.com", Address = "22 Stationery Blvd", TaxNumber = "TX-334455", IsActive = true },
                    new Supplier { Name = "Fashion Hub Inc", Phone = "+15550166", Email = "info@fashionhub.com", Address = "90 Trendy St", TaxNumber = "TX-778899", IsActive = true }
                });
                context.SaveChanges();
            }

            suppliers = context.Suppliers.ToList();

            // 4. Seed Customers
            var customers = new List<Customer>();
            if (!context.Customers.Any(c => c.Email.Contains("saeed") || c.Email.Contains("nabulsi")))
            {
                var customersToSeed = new List<Customer>
                {
                    new Customer { Name = "Khalid Al-Saeed", Phone = "+962781111111", Email = "khalid.saeed@gmail.com", Address = "Amman, Jordan", IsActive = true },
                    new Customer { Name = "Mona Al-Sabah", Phone = "+962782222222", Email = "mona.sabah@gmail.com", Address = "Irbid, Jordan", IsActive = true },
                    new Customer { Name = "Ziad Al-Nabulsi", Phone = "+962783333333", Email = "ziad.nabulsi@yahoo.com", Address = "Zarqa, Jordan", IsActive = true },
                    new Customer { Name = "Salma Jaber", Phone = "+962784444444", Email = "salma.jaber@outlook.com", Address = "Salt, Jordan", IsActive = true },
                    new Customer { Name = "Hasan Al-Khoury", Phone = "+962785555555", Email = "hasan.khoury@gmail.com", Address = "Madaba, Jordan", IsActive = true },
                    new Customer { Name = "Huda Al-Fayez", Phone = "+962786666666", Email = "huda.fayez@gmail.com", Address = "Amman, Jordan", IsActive = true },
                    new Customer { Name = "Marwan Al-Sharif", Phone = "+962787777777", Email = "marwan.sharif@gmail.com", Address = "Karak, Jordan", IsActive = true },
                    new Customer { Name = "Dina Al-Masri", Phone = "+962788888888", Email = "dina.masri@gmail.com", Address = "Amman, Jordan", IsActive = true }
                };
                context.Customers.AddRange(customersToSeed);
                context.SaveChanges();
            }

            if (!context.Customers.Any(c => c.Email == "johndoe@gmail.com"))
            {
                context.Customers.AddRange(new List<Customer>
                {
                    new Customer { Name = "John Doe", Phone = "+15550991", Email = "johndoe@gmail.com", Address = "12 Main St", IsActive = true },
                    new Customer { Name = "Jane Smith", Phone = "+15550992", Email = "janesmith@yahoo.com", Address = "34 Oak Rd", IsActive = true },
                    new Customer { Name = "Acme Corp", Phone = "+15550993", Email = "purchasing@acme.com", Address = "55 Enterprise Pkwy", IsActive = true },
                    new Customer { Name = "Retail Inc", Phone = "+15550994", Email = "store@retailinc.com", Address = "77 Commerce Blvd", IsActive = true },
                    new Customer { Name = "Tech Solutions", Phone = "+15550995", Email = "it@techsolutions.com", Address = "99 Innovation Dr", IsActive = true }
                });
                context.SaveChanges();
            }

            customers = context.Customers.ToList();

            // 5. Seed Products
            var products = new List<Product>();
            if (!context.Products.Any(p => p.SKU == "ELE-TV55"))
            {
                // Find helper IDs
                int catElectronics = categories.FirstOrDefault(c => c.Name == "Electronics")?.Id ?? categories[0].Id;
                int catFurniture = categories.FirstOrDefault(c => c.Name == "Furniture")?.Id ?? categories[0].Id;
                int catFood = categories.FirstOrDefault(c => c.Name == "Food & Beverages")?.Id ?? categories[0].Id;
                int catClothing = categories.FirstOrDefault(c => c.Name == "Clothing")?.Id ?? categories[0].Id;
                int catOffice = categories.FirstOrDefault(c => c.Name == "Office Supplies")?.Id ?? categories[0].Id;

                int brandSamsung = brands.FirstOrDefault(b => b.Name == "Samsung")?.Id ?? brands[0].Id;
                int brandApple = brands.FirstOrDefault(b => b.Name == "Apple")?.Id ?? brands[0].Id;
                int brandDell = brands.FirstOrDefault(b => b.Name == "Dell")?.Id ?? brands[0].Id;
                int brandIkea = brands.FirstOrDefault(b => b.Name == "Ikea")?.Id ?? brands[0].Id;
                int brandGeneric = brands.FirstOrDefault(b => b.Name == "Generic")?.Id ?? brands[0].Id;

                int unitPieces = units.FirstOrDefault(u => u.Name == "Pieces")?.Id ?? units[0].Id;
                int unitBoxes = units.FirstOrDefault(u => u.Name == "Boxes")?.Id ?? units[0].Id;
                int unitPacks = units.FirstOrDefault(u => u.Name == "Packs")?.Id ?? units[0].Id;

                int supHuda = suppliers.FirstOrDefault(s => s.Name == "Al-Huda Electronics")?.Id ?? suppliers[0].Id;
                int supModern = suppliers.FirstOrDefault(s => s.Name == "Modern Furniture Jordan")?.Id ?? suppliers[0].Id;
                int supPetra = suppliers.FirstOrDefault(s => s.Name == "Petra Food Distributors")?.Id ?? suppliers[0].Id;
                int supWaha = suppliers.FirstOrDefault(s => s.Name == "Al-Waha Office Solutions")?.Id ?? suppliers[0].Id;
                int supAmman = suppliers.FirstOrDefault(s => s.Name == "Amman Clothes Wholesalers")?.Id ?? suppliers[0].Id;
                int supQuds = suppliers.FirstOrDefault(s => s.Name == "Al-Quds Paper & Stationery")?.Id ?? suppliers[0].Id;

                int defaultWarehouseId = warehouses.First().Id;

                var productsToSeed = new List<Product>
                {
                    new Product { Name = "Smart LED TV 55 Inch", SKU = "ELE-TV55", CategoryId = catElectronics, BrandId = brandSamsung, UnitId = unitPieces, SupplierId = supHuda, Price = 450.00m, PurchasePrice = 320.00m, Description = "Samsung 55 Inch Ultra HD Smart TV", IsActive = true, ProductStocks = new List<ProductStock> { new ProductStock { WarehouseId = defaultWarehouseId, Quantity = 25, MinQuantity = 5 } } },
                    new Product { Name = "Laptop Stand Aluminum", SKU = "ELE-STAND", CategoryId = catElectronics, BrandId = brandGeneric, UnitId = unitPieces, SupplierId = supHuda, Price = 25.00m, PurchasePrice = 15.00m, Description = "Adjustable ergonomic laptop stand", IsActive = true, ProductStocks = new List<ProductStock> { new ProductStock { WarehouseId = defaultWarehouseId, Quantity = 40, MinQuantity = 10 } } },
                    new Product { Name = "Coffee Table Walnut", SKU = "FUR-CTABLE", CategoryId = catFurniture, BrandId = brandIkea, UnitId = unitPieces, SupplierId = supModern, Price = 120.00m, PurchasePrice = 75.00m, Description = "Solid walnut wood coffee table", IsActive = true, ProductStocks = new List<ProductStock> { new ProductStock { WarehouseId = defaultWarehouseId, Quantity = 12, MinQuantity = 3 } } },
                    new Product { Name = "Leather Office Chair", SKU = "FUR-LCHAIR", CategoryId = catFurniture, BrandId = brandIkea, UnitId = unitPieces, SupplierId = supModern, Price = 180.00m, PurchasePrice = 110.00m, Description = "High back executive office chair", IsActive = true, ProductStocks = new List<ProductStock> { new ProductStock { WarehouseId = defaultWarehouseId, Quantity = 18, MinQuantity = 5 } } },
                    new Product { Name = "Jordanian Olive Oil 5L", SKU = "FOD-OIV5L", CategoryId = catFood, BrandId = brandGeneric, UnitId = unitPieces, SupplierId = supPetra, Price = 35.00m, PurchasePrice = 22.00m, Description = "Extra virgin cold-pressed olive oil", IsActive = true, ProductStocks = new List<ProductStock> { new ProductStock { WarehouseId = defaultWarehouseId, Quantity = 60, MinQuantity = 10 } } },
                    new Product { Name = "Halva Plain 1kg", SKU = "FOD-HLV1K", CategoryId = catFood, BrandId = brandGeneric, UnitId = unitPieces, SupplierId = supPetra, Price = 8.00m, PurchasePrice = 5.00m, Description = "Premium quality traditional plain sesame halva", IsActive = true, ProductStocks = new List<ProductStock> { new ProductStock { WarehouseId = defaultWarehouseId, Quantity = 80, MinQuantity = 15 } } },
                    new Product { Name = "Classic Polo T-Shirt", SKU = "CLO-POLO", CategoryId = catClothing, BrandId = brandGeneric, UnitId = unitPieces, SupplierId = supAmman, Price = 15.00m, PurchasePrice = 8.00m, Description = "Cotton blend comfortable polo shirt", IsActive = true, ProductStocks = new List<ProductStock> { new ProductStock { WarehouseId = defaultWarehouseId, Quantity = 100, MinQuantity = 20 } } },
                    new Product { Name = "Casual Denim Jeans", SKU = "CLO-JEANS", CategoryId = catClothing, BrandId = brandGeneric, UnitId = unitPieces, SupplierId = supAmman, Price = 25.00m, PurchasePrice = 12.00m, Description = "Straight-fit durable blue jeans", IsActive = true, ProductStocks = new List<ProductStock> { new ProductStock { WarehouseId = defaultWarehouseId, Quantity = 75, MinQuantity = 15 } } },
                    new Product { Name = "Ergonomic Keyboard", SKU = "ELE-KEYBD", CategoryId = catElectronics, BrandId = brandDell, UnitId = unitPieces, SupplierId = supHuda, Price = 45.00m, PurchasePrice = 30.00m, Description = "Wireless split ergonomic comfort keyboard", IsActive = true, ProductStocks = new List<ProductStock> { new ProductStock { WarehouseId = defaultWarehouseId, Quantity = 30, MinQuantity = 5 } } },
                    new Product { Name = "Noise Cancelling Headphones", SKU = "ELE-HEADPH", CategoryId = catElectronics, BrandId = brandSamsung, UnitId = unitPieces, SupplierId = supHuda, Price = 130.00m, PurchasePrice = 90.00m, Description = "Over-ear active noise cancelling bluetooth headphones", IsActive = true, ProductStocks = new List<ProductStock> { new ProductStock { WarehouseId = defaultWarehouseId, Quantity = 15, MinQuantity = 8 } } },
                    new Product { Name = "Standing Desk Mat", SKU = "OFF-MAT", CategoryId = catOffice, BrandId = brandGeneric, UnitId = unitPieces, SupplierId = supWaha, Price = 30.00m, PurchasePrice = 18.00m, Description = "Anti-fatigue comfort floor mat", IsActive = true, ProductStocks = new List<ProductStock> { new ProductStock { WarehouseId = defaultWarehouseId, Quantity = 22, MinQuantity = 5 } } },
                    new Product { Name = "Gel Pen Box Blue (50 pcs)", SKU = "OFF-PENS", CategoryId = catOffice, BrandId = brandGeneric, UnitId = unitBoxes, SupplierId = supQuds, Price = 12.00m, PurchasePrice = 7.00m, Description = "Smooth writing blue gel pens", IsActive = true, ProductStocks = new List<ProductStock> { new ProductStock { WarehouseId = defaultWarehouseId, Quantity = 50, MinQuantity = 10 } } },
                    new Product { Name = "Thermal Paper Roll (10 pcs)", SKU = "OFF-TROLL", CategoryId = catOffice, BrandId = brandGeneric, UnitId = unitPacks, SupplierId = supQuds, Price = 10.00m, PurchasePrice = 6.00m, Description = "57mm POS printer thermal rolls", IsActive = true, ProductStocks = new List<ProductStock> { new ProductStock { WarehouseId = defaultWarehouseId, Quantity = 70, MinQuantity = 12 } } },
                    new Product { Name = "Spicy Arabic Falafel Mix", SKU = "FOD-FLFL", CategoryId = catFood, BrandId = brandGeneric, UnitId = unitPacks, SupplierId = supPetra, Price = 4.00m, PurchasePrice = 2.00m, Description = "Instant ready-to-fry falafel mix with spices", IsActive = true, ProductStocks = new List<ProductStock> { new ProductStock { WarehouseId = defaultWarehouseId, Quantity = 120, MinQuantity = 25 } } },
                    new Product { Name = "Woolen Winter Scarf", SKU = "CLO-SCARF", CategoryId = catClothing, BrandId = brandGeneric, UnitId = unitPieces, SupplierId = supAmman, Price = 12.00m, PurchasePrice = 6.00m, Description = "Warm premium knit woolen winter scarf", IsActive = true, ProductStocks = new List<ProductStock> { new ProductStock { WarehouseId = defaultWarehouseId, Quantity = 45, MinQuantity = 10 } } }
                };

                context.Products.AddRange(productsToSeed);
                context.SaveChanges();
            }

            // Load original products if missing
            if (!context.Products.Any(p => p.SKU == "APP-IP15P"))
            {
                int defaultWarehouseId = warehouses.First().Id;
                var p1 = new Product { Name = "iPhone 15 Pro", SKU = "APP-IP15P", Description = "Apple iPhone 15 Pro 256GB", PurchasePrice = 899.00m, Price = 1099.00m, CategoryId = categories[0].Id, BrandId = brands[0].Id, UnitId = units[0].Id, SupplierId = suppliers[0].Id, IsActive = true, ProductStocks = new List<ProductStock> { new ProductStock { WarehouseId = defaultWarehouseId, Quantity = 45, MinQuantity = 10 } } };
                var p2 = new Product { Name = "Samsung Galaxy S24", SKU = "SAM-S24", Description = "Samsung Galaxy S24 Ultra", PurchasePrice = 950.00m, Price = 1199.00m, CategoryId = categories[0].Id, BrandId = brands[1].Id, UnitId = units[0].Id, SupplierId = suppliers[0].Id, IsActive = true, ProductStocks = new List<ProductStock> { new ProductStock { WarehouseId = defaultWarehouseId, Quantity = 3, MinQuantity = 5 } } }; 
                var p3 = new Product { Name = "Dell Latitude 5440", SKU = "DEL-LAT5440", Description = "Dell Latitude Laptop 16GB RAM", PurchasePrice = 700.00m, Price = 899.00m, CategoryId = categories[0].Id, BrandId = brands[2].Id, UnitId = units[0].Id, SupplierId = suppliers[0].Id, IsActive = true, ProductStocks = new List<ProductStock> { new ProductStock { WarehouseId = defaultWarehouseId, Quantity = 12, MinQuantity = 3 } } };
                var p4 = new Product { Name = "Office Standing Desk", SKU = "IKE-STDESK", Description = "Adjustable height standing desk", PurchasePrice = 180.00m, Price = 299.00m, CategoryId = categories[1 % categories.Count].Id, BrandId = brands[3 % brands.Count].Id, UnitId = units[0].Id, SupplierId = suppliers[1 % suppliers.Count].Id, IsActive = true, ProductStocks = new List<ProductStock> { new ProductStock { WarehouseId = defaultWarehouseId, Quantity = 15, MinQuantity = 5 } } };
                var p5 = new Product { Name = "Ergonomic Office Chair", SKU = "IKE-ERGCHAIR", Description = "Mesh back ergonomic chair", PurchasePrice = 90.00m, Price = 150.00m, CategoryId = categories[1 % categories.Count].Id, BrandId = brands[3 % brands.Count].Id, UnitId = units[0].Id, SupplierId = suppliers[1 % suppliers.Count].Id, IsActive = true, ProductStocks = new List<ProductStock> { new ProductStock { WarehouseId = defaultWarehouseId, Quantity = 2, MinQuantity = 5 } } }; 
                var p6 = new Product { Name = "Premium Arabica Coffee", SKU = "FOOD-COFFEE", Description = "1kg bag of roasted coffee beans", PurchasePrice = 12.00m, Price = 24.99m, CategoryId = categories[2 % categories.Count].Id, BrandId = brands[4 % brands.Count].Id, UnitId = units[1 % units.Count].Id, SupplierId = suppliers[2 % suppliers.Count].Id, IsActive = true, ProductStocks = new List<ProductStock> { new ProductStock { WarehouseId = defaultWarehouseId, Quantity = 120, MinQuantity = 20 } } };
                var p7 = new Product { Name = "Leather Jacket", SKU = "CLO-LTHJCKT", Description = "Genuine brown leather jacket", PurchasePrice = 60.00m, Price = 120.00m, CategoryId = categories[3 % categories.Count].Id, BrandId = brands[4 % brands.Count].Id, UnitId = units[0].Id, SupplierId = suppliers[4 % suppliers.Count].Id, IsActive = true, ProductStocks = new List<ProductStock> { new ProductStock { WarehouseId = defaultWarehouseId, Quantity = 0, MinQuantity = 5 } } }; 
                var p8 = new Product { Name = "A4 Printer Paper", SKU = "OFF-PAPER", Description = "Ream of A4 printing paper 500 sheets", PurchasePrice = 3.00m, Price = 6.99m, CategoryId = categories[4 % categories.Count].Id, BrandId = brands[4 % brands.Count].Id, UnitId = units[2 % units.Count].Id, SupplierId = suppliers[3 % suppliers.Count].Id, IsActive = true, ProductStocks = new List<ProductStock> { new ProductStock { WarehouseId = defaultWarehouseId, Quantity = 250, MinQuantity = 50 } } };
                var p9 = new Product { Name = "Wireless Earbuds", SKU = "SAM-WIREAR", Description = "Samsung Galaxy Buds Pro", PurchasePrice = 80.00m, Price = 149.00m, CategoryId = categories[0].Id, BrandId = brands[1].Id, UnitId = units[0].Id, SupplierId = suppliers[0].Id, IsActive = true, ProductStocks = new List<ProductStock> { new ProductStock { WarehouseId = defaultWarehouseId, Quantity = 4, MinQuantity = 10 } } }; 
                var p10 = new Product { Name = "Wireless Mouse", SKU = "GEN-MOUSE", Description = "Ergonomic 2.4G wireless mouse", PurchasePrice = 8.00m, Price = 19.99m, CategoryId = categories[0].Id, BrandId = brands[4].Id, UnitId = units[0].Id, SupplierId = suppliers[0].Id, IsActive = true, ProductStocks = new List<ProductStock> { new ProductStock { WarehouseId = defaultWarehouseId, Quantity = 80, MinQuantity = 15 } } };

                context.Products.AddRange(new List<Product> { p1, p2, p3, p4, p5, p6, p7, p8, p9, p10 });
                context.SaveChanges();
            }

            products = context.Products.ToList();

            // 6. Seed Inventory Logs programmatically for the new products
            // Check if logs already exist for our new products to avoid duplication
            var firstNewProd = products.FirstOrDefault(p => p.SKU == "ELE-TV55");
            if (firstNewProd != null && !context.InventoryLogs.Any(l => l.ProductId == firstNewProd.Id))
            {
                var newProducts = products.Where(p => p.SKU.StartsWith("ELE-") || p.SKU.StartsWith("FUR-") || p.SKU.StartsWith("FOD-") || p.SKU.StartsWith("CLO-") || p.SKU.StartsWith("OFF-")).ToList();
                var logsToSeed = new List<InventoryLog>();
                
                // Get some users for attribution
                var userRania = seededUsers.FirstOrDefault(u => u.Username == "rania") ?? seededUsers.First();
                var userAhmad = seededUsers.FirstOrDefault(u => u.Username == "ahmad") ?? seededUsers.First();
                var userYoussef = seededUsers.FirstOrDefault(u => u.Username == "youssef") ?? seededUsers.First();
                var userFatima = seededUsers.FirstOrDefault(u => u.Username == "fatima") ?? seededUsers.First();
                var userLayla = seededUsers.FirstOrDefault(u => u.Username == "layla") ?? seededUsers.First();
                var userTareq = seededUsers.FirstOrDefault(u => u.Username == "tareq") ?? seededUsers.First();
                var userZiad = seededUsers.FirstOrDefault(u => u.Username == "ziad") ?? seededUsers.First();
                var userMona = seededUsers.FirstOrDefault(u => u.Username == "mona") ?? seededUsers.First();

                var userCycle = new[] { userRania, userAhmad, userYoussef, userFatima, userLayla, userTareq, userZiad, userMona };

                int userIndex = 0;

                foreach (var product in newProducts)
                {
                    int qFinal = product.ProductStocks.Sum(s => s.Quantity);
                    if (qFinal < 5) continue; // Safety check for math

                    // Log 1: Day -28 (Add)
                    var u1 = userCycle[userIndex++ % userCycle.Length];
                    logsToSeed.Add(new InventoryLog
                    {
                        ProductId = product.Id,
                        UserId = u1.Id,
                        Action = InventoryAction.Add,
                        QuantityChanged = qFinal + 10,
                        PreviousQuantity = 0,
                        NewQuantity = qFinal + 10,
                        Notes = "Initial stocking shipment received from supplier.",
                        ActionDate = DateTime.UtcNow.Date.AddDays(-28).AddHours(9)
                    });

                    // Log 2: Day -20 (Sell)
                    var u2 = userCycle[userIndex++ % userCycle.Length];
                    logsToSeed.Add(new InventoryLog
                    {
                        ProductId = product.Id,
                        UserId = u2.Id,
                        Action = InventoryAction.Sell,
                        QuantityChanged = 15,
                        PreviousQuantity = qFinal + 10,
                        NewQuantity = qFinal - 5,
                        Notes = "Customer sales invoice created.",
                        ActionDate = DateTime.UtcNow.Date.AddDays(-20).AddHours(14)
                    });

                    // Log 3: Day -12 (Add)
                    var u3 = userCycle[userIndex++ % userCycle.Length];
                    logsToSeed.Add(new InventoryLog
                    {
                        ProductId = product.Id,
                        UserId = u3.Id,
                        Action = InventoryAction.Add,
                        QuantityChanged = 20,
                        PreviousQuantity = qFinal - 5,
                        NewQuantity = qFinal + 15,
                        Notes = "Mid-month restock delivery verified.",
                        ActionDate = DateTime.UtcNow.Date.AddDays(-12).AddHours(11)
                    });

                    // Log 4: Day -4 (Sell)
                    var u4 = userCycle[userIndex++ % userCycle.Length];
                    logsToSeed.Add(new InventoryLog
                    {
                        ProductId = product.Id,
                        UserId = u4.Id,
                        Action = InventoryAction.Sell,
                        QuantityChanged = 15,
                        PreviousQuantity = qFinal + 15,
                        NewQuantity = qFinal,
                        Notes = "Bulk order processed for corporate client.",
                        ActionDate = DateTime.UtcNow.Date.AddDays(-4).AddHours(16)
                    });
                }

                context.InventoryLogs.AddRange(logsToSeed);
                context.SaveChanges();
            }
        }
    }
}
