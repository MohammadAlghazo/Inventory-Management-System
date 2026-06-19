using Inventory_Management._DbContext;
using Inventory_Management.Dtos;
using Inventory_Management.Models;
using Inventory_Management.Common;
using Microsoft.EntityFrameworkCore;

namespace Inventory_Management.Services
{
    public interface ICustomerService
    {
        Task<ApiResponse<PagedResult<CustomerDto>>> GetAllCustomersAsync(int page = 1, int pageSize = 10, string? search = null);
        Task<ApiResponse<CustomerDto>> GetCustomerByIdAsync(int id);
        Task<ApiResponse<CustomerDto>> CreateCustomerAsync(CreateCustomerDto dto);
        Task<ApiResponse<CustomerDto>> UpdateCustomerAsync(int id, UpdateCustomerDto dto);
        Task<ApiResponse<bool>> DeleteCustomerAsync(int id);
    }

    public class CustomerService : ICustomerService
    {
        private readonly AppDbContext _context;

        public CustomerService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<PagedResult<CustomerDto>>> GetAllCustomersAsync(int page = 1, int pageSize = 10, string? search = null)
        {
            var query = _context.Customers.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.ToLower();
                query = query.Where(c => c.Name.ToLower().Contains(s) || 
                                         c.Phone.ToLower().Contains(s) || 
                                         c.Email.ToLower().Contains(s));
            }

            var total = await query.CountAsync();

            var customers = await query
                .OrderByDescending(c => c.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(c => new CustomerDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Phone = c.Phone,
                    Email = c.Email,
                    Address = c.Address,
                    IsActive = c.IsActive,
                    CreatedAt = c.CreatedAt
                })
                .ToListAsync();

            var pagedResult = new PagedResult<CustomerDto>
            {
                Items = customers,
                TotalCount = total,
                Page = page,
                PageSize = pageSize
            };

            return ApiResponse<PagedResult<CustomerDto>>.Ok(pagedResult);
        }

        public async Task<ApiResponse<CustomerDto>> GetCustomerByIdAsync(int id)
        {
            var c = await _context.Customers.FindAsync(id);
            if (c == null) return ApiResponse<CustomerDto>.NotFound("Customer not found");

            return ApiResponse<CustomerDto>.Ok(new CustomerDto
            {
                Id = c.Id,
                Name = c.Name,
                Phone = c.Phone,
                Email = c.Email,
                Address = c.Address,
                IsActive = c.IsActive,
                CreatedAt = c.CreatedAt
            });
        }

        public async Task<ApiResponse<CustomerDto>> CreateCustomerAsync(CreateCustomerDto dto)
        {
            var customer = new Customer
            {
                Name = dto.Name,
                Phone = dto.Phone,
                Email = dto.Email,
                Address = dto.Address,
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            return ApiResponse<CustomerDto>.Created(new CustomerDto
            {
                Id = customer.Id,
                Name = customer.Name,
                Phone = customer.Phone,
                Email = customer.Email,
                Address = customer.Address,
                IsActive = customer.IsActive,
                CreatedAt = customer.CreatedAt
            }, "Customer created successfully");
        }

        public async Task<ApiResponse<CustomerDto>> UpdateCustomerAsync(int id, UpdateCustomerDto dto)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return ApiResponse<CustomerDto>.NotFound("Customer not found");

            customer.Name = dto.Name;
            customer.Phone = dto.Phone;
            customer.Email = dto.Email;
            customer.Address = dto.Address;
            customer.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();

            return ApiResponse<CustomerDto>.Ok(new CustomerDto
            {
                Id = customer.Id,
                Name = customer.Name,
                Phone = customer.Phone,
                Email = customer.Email,
                Address = customer.Address,
                IsActive = customer.IsActive,
                CreatedAt = customer.CreatedAt
            }, "Customer updated successfully");
        }

        public async Task<ApiResponse<bool>> DeleteCustomerAsync(int id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return ApiResponse<bool>.NotFound("Customer not found");

            customer.IsActive = false;
            await _context.SaveChangesAsync();

            return ApiResponse<bool>.Ok(true, "Customer deactivated successfully");
        }
    }
}
