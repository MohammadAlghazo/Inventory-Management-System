using InventoryManagement.Application.Common.Interfaces;
using InventoryManagement.Domain.Interfaces;
using InventoryManagement.Application.Dtos;
using InventoryManagement.Domain.Entities;
using InventoryManagement.Domain.Common;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Application.Services
{
    public interface ICustomerService
    {
        Task<ApiResponse<PagedResult<CustomerDto>>> GetAllCustomersAsync(int page = 1, int pageSize = 10, string? search = null, bool? isActive = null);
        Task<ApiResponse<CustomerDto>> GetCustomerByIdAsync(int id);
        Task<ApiResponse<CustomerDto>> CreateCustomerAsync(CreateCustomerDto dto);
        Task<ApiResponse<CustomerDto>> UpdateCustomerAsync(int id, UpdateCustomerDto dto);
        Task<ApiResponse<bool>> DeleteCustomerAsync(int id);
    }

    public class CustomerService : ICustomerService
    {
        private readonly IUnitOfWork _uow;
        private readonly IEmailService _emailService;

        public CustomerService(IUnitOfWork uow, IEmailService emailService)
        {
            _uow = uow;
            _emailService = emailService;
        }

        public async Task<ApiResponse<PagedResult<CustomerDto>>> GetAllCustomersAsync(int page = 1, int pageSize = 10, string? search = null, bool? isActive = null)
        {
            var query = _uow.Customers.Query();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.ToLower();
                query = query.Where(c => c.Name.ToLower().Contains(s) || 
                                         c.Phone.ToLower().Contains(s) || 
                                         c.Email.ToLower().Contains(s));
            }

            if (isActive.HasValue)
            {
                query = query.Where(c => c.IsActive == isActive.Value);
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
            var c = await _uow.Customers.GetByIdAsync(id);
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

            _uow.Customers.Add(customer);
            await _uow.SaveChangesAsync();

            // Send Welcome Email
            if (!string.IsNullOrEmpty(customer.Email))
            {
                var emailHtml = _emailService.GenerateEmailTemplate(
                    "Welcome to StockMaster!",
                    $@"Hello {customer.Name},<br><br>
                    You have been successfully registered as a customer in our StockMaster system.<br>
                    We look forward to serving you with the best inventory tracking and supply chain management.<br><br>
                    If you have any questions or concerns, please don't hesitate to reach out to us."
                );

                _ = _emailService.SendEmailAsync(customer.Email, "Welcome to StockMaster", emailHtml);
            }

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
            var customer = await _uow.Customers.GetByIdAsync(id);
            if (customer == null) return ApiResponse<CustomerDto>.NotFound("Customer not found");

            customer.Name = dto.Name;
            customer.Phone = dto.Phone;
            customer.Email = dto.Email;
            customer.Address = dto.Address;
            customer.IsActive = dto.IsActive;

            await _uow.SaveChangesAsync();

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
            var customer = await _uow.Customers.GetByIdAsync(id);
            if (customer == null) return ApiResponse<bool>.NotFound("Customer not found");

            customer.IsActive = false;
            await _uow.SaveChangesAsync();

            return ApiResponse<bool>.Ok(true, "Customer deactivated successfully");
        }
    }
}

