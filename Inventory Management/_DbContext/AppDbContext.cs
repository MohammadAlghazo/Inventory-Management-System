using Inventory_Management.Models;
using Microsoft.EntityFrameworkCore;

namespace Inventory_Management._DbContext
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {

        }

        //Tables
        public DbSet<Product> Products { get; set; }
        public DbSet<InventoryLog> InventoryLogs { get; set; }
    }

}