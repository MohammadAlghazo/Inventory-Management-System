using InventoryManagement.Domain.Entities;
using InventoryManagement.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

using InventoryManagement.Domain.Common;
using MediatR;

namespace InventoryManagement.Infrastructure.Data.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context;
        private readonly IMediator _mediator;

        public UnitOfWork(AppDbContext context, IMediator mediator)
        {
            _context = context;
            _mediator = mediator;
            Products = new Repository<Product>(_context);
            InventoryLogs = new Repository<InventoryLog>(_context);
            Users = new Repository<User>(_context);
            Branches = new Repository<Branch>(_context);
            Warehouses = new Repository<Warehouse>(_context);
            Categories = new Repository<Category>(_context);
            Brands = new Repository<Brand>(_context);
            Units = new Repository<InventoryManagement.Domain.Entities.Unit>(_context);
            Suppliers = new Repository<Supplier>(_context);
            Customers = new Repository<Customer>(_context);
            Notifications = new Repository<Notification>(_context);
            Roles = new Repository<Role>(_context);
            Permissions = new Repository<Permission>(_context);
            RolePermissions = new Repository<RolePermission>(_context);
            ActivityLogs = new Repository<ActivityLog>(_context);
            ProductStocks = new Repository<ProductStock>(_context);
            PurchaseOrders = new Repository<PurchaseOrder>(_context);
            SalesOrders = new Repository<SalesOrder>(_context);
            PurchaseOrderItems = new Repository<PurchaseOrderItem>(_context);
            SalesOrderItems = new Repository<SalesOrderItem>(_context);
        }

        public IRepository<Product> Products { get; private set; }
        public IRepository<InventoryLog> InventoryLogs { get; private set; }
        public IRepository<User> Users { get; private set; }
        public IRepository<Branch> Branches { get; private set; }
        public IRepository<Warehouse> Warehouses { get; private set; }
        public IRepository<Category> Categories { get; private set; }
        public IRepository<Brand> Brands { get; private set; }
        public IRepository<InventoryManagement.Domain.Entities.Unit> Units { get; private set; }
        public IRepository<Supplier> Suppliers { get; private set; }
        public IRepository<Customer> Customers { get; private set; }
        public IRepository<Notification> Notifications { get; private set; }
        public IRepository<Role> Roles { get; private set; }
        public IRepository<Permission> Permissions { get; private set; }
        public IRepository<RolePermission> RolePermissions { get; private set; }
        public IRepository<ActivityLog> ActivityLogs { get; private set; }
        public IRepository<ProductStock> ProductStocks { get; private set; }
        public IRepository<PurchaseOrder> PurchaseOrders { get; private set; }
        public IRepository<SalesOrder> SalesOrders { get; private set; }
        public IRepository<PurchaseOrderItem> PurchaseOrderItems { get; private set; }
        public IRepository<SalesOrderItem> SalesOrderItems { get; private set; }

        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            await DispatchDomainEventsAsync();
            return await _context.SaveChangesAsync(cancellationToken);
        }

        private async Task DispatchDomainEventsAsync()
        {
            var domainEntities = _context.ChangeTracker
                .Entries<IHasDomainEvents>()
                .Where(x => x.Entity.DomainEvents != null && x.Entity.DomainEvents.Any())
                .Select(x => x.Entity)
                .ToList();

            var domainEvents = domainEntities
                .SelectMany(x => x.DomainEvents)
                .ToList();

            domainEntities.ToList()
                .ForEach(entity => entity.ClearDomainEvents());

            foreach (var domainEvent in domainEvents)
            {
                await _mediator.Publish(domainEvent);
            }
        }

        public void AddNotification(string title, string message, string type, string targetRole)
        {
            var users = _context.Users.Include(u => u.Role).Where(u => targetRole == "All" || (u.Role != null && u.Role.Name == targetRole)).ToList();
            foreach (var u in users)
            {
                _context.Notifications.Add(new Notification
                {
                    UserId = u.Id,
                    Title = title,
                    Message = message,
                    Type = type,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
