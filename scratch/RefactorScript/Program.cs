using System;
using System.IO;
using System.Text.RegularExpressions;

namespace RefactorScript
{
    class Program
    {
        static void Main(string[] args)
        {
            string servicesDir = @"D:\Projects\Inventory Management\Inventory-Management\InventoryManagement.Application\Services";
            string[] dbsets = { "Products", "InventoryLogs", "Users", "Branches", "Warehouses", "Categories", "Brands", "Units", "Suppliers", "Customers", "Notifications", "Roles", "Permissions", "RolePermissions", "ActivityLogs", "ProductStocks", "PurchaseOrders", "SalesOrders", "PurchaseOrderItems", "SalesOrderItems" };

            foreach (var file in Directory.GetFiles(servicesDir, "*.cs", SearchOption.AllDirectories))
            {
                string content = File.ReadAllText(file);

                if (content.Contains("IAppDbContext"))
                {
                    Console.WriteLine($"Processing {Path.GetFileName(file)}...");

                    // Imports
                    content = content.Replace("using InventoryManagement.Application.Common.Interfaces;", "using InventoryManagement.Application.Common.Interfaces;\r\nusing InventoryManagement.Domain.Interfaces;");

                    // DI changes
                    content = content.Replace("private readonly IAppDbContext _db;", "private readonly IUnitOfWork _uow;");
                    content = content.Replace("private readonly IAppDbContext _context;", "private readonly IUnitOfWork _uow;");
                    content = content.Replace("IAppDbContext db", "IUnitOfWork uow");
                    content = content.Replace("IAppDbContext context", "IUnitOfWork uow");
                    content = content.Replace("_db = db;", "_uow = uow;");
                    content = content.Replace("_context = context;", "_uow = uow;");
                    
                    // Normalize to _db. for processing
                    content = content.Replace("_context.", "_db.");

                    foreach (var dbset in dbsets)
                    {
                        // Direct replacements
                        content = content.Replace($"_db.{dbset}.AsQueryable()", $"_uow.{dbset}.Query()");
                        content = content.Replace($"_db.{dbset}.FindAsync", $"_uow.{dbset}.GetByIdAsync");
                        
                        // Add, Remove, Update etc
                        content = Regex.Replace(content, $@"_db\.{dbset}\.Add\((.*?)\);", $"_uow.{dbset}.Add($1);");
                        content = Regex.Replace(content, $@"_db\.{dbset}\.AddRange\((.*?)\);", $"_uow.{dbset}.AddRange($1);");
                        content = Regex.Replace(content, $@"_db\.{dbset}\.Remove\((.*?)\);", $"_uow.{dbset}.Delete($1);");
                        content = Regex.Replace(content, $@"_db\.{dbset}\.Update\((.*?)\);", $"_uow.{dbset}.Update($1);");

                        // Any remaining _db.DbSet accesses likely need .Query()
                        // Use negative lookahead to prevent matching what we already changed or don't want to change
                        content = Regex.Replace(content, $@"_db\.{dbset}(?!\.Add\(|\.AddAsync|\.AddRange|\.Delete|\.Update|\.Query|\.GetByIdAsync|\.FindAsync|\.AnyAsync)", $"_uow.{dbset}.Query()");
                    }

                    // SaveChanges and other functions
                    content = content.Replace("_db.SaveChangesAsync()", "_uow.SaveChangesAsync()");
                    content = content.Replace("_db.AddNotification", "_uow.AddNotification");
                    
                    // Leftover _db. (should be minimal)
                    content = content.Replace("_db.", "_uow.");

                    File.WriteAllText(file, content);
                }
            }
            Console.WriteLine("Done.");
        }
    }
}
