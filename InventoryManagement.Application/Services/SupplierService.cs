using InventoryManagement.Application.Common.Interfaces;
using InventoryManagement.Domain.Interfaces;
using InventoryManagement.Application.Dtos;
using InventoryManagement.Domain.Entities;
using InventoryManagement.Domain.Common;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Application.Services
{
    public interface ISupplierService
    {
        Task<ApiResponse<PagedResult<SupplierDto>>> GetAllSuppliersAsync(int page = 1, int pageSize = 10, string? search = null);
        Task<ApiResponse<SupplierDto>> GetSupplierByIdAsync(int id);
        Task<ApiResponse<SupplierDto>> CreateSupplierAsync(CreateSupplierDto dto);
        Task<ApiResponse<SupplierDto>> UpdateSupplierAsync(int id, UpdateSupplierDto dto);
        Task<ApiResponse<bool>> DeleteSupplierAsync(int id);
    }

    public class SupplierService : ISupplierService
    {
        private readonly IUnitOfWork _uow;
        private readonly IEmailService _emailService;

        public SupplierService(IUnitOfWork uow, IEmailService emailService)
        {
            _uow = uow;
            _emailService = emailService;
        }

        public async Task<ApiResponse<PagedResult<SupplierDto>>> GetAllSuppliersAsync(int page = 1, int pageSize = 10, string? search = null)
        {
            var query = _uow.Suppliers.Query();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.ToLower();
                query = query.Where(su => su.Name.ToLower().Contains(s) || 
                                          su.Phone.ToLower().Contains(s) || 
                                          su.Email.ToLower().Contains(s));
            }

            var total = await query.CountAsync();

            var suppliers = await query
                .OrderByDescending(s => s.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(s => new SupplierDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Phone = s.Phone,
                    Email = s.Email,
                    Address = s.Address,
                    TaxNumber = s.TaxNumber,
                    IsActive = s.IsActive,
                    CreatedAt = s.CreatedAt
                })
                .ToListAsync();

            var pagedResult = new PagedResult<SupplierDto>
            {
                Items = suppliers,
                TotalCount = total,
                Page = page,
                PageSize = pageSize
            };

            return ApiResponse<PagedResult<SupplierDto>>.Ok(pagedResult);
        }

        public async Task<ApiResponse<SupplierDto>> GetSupplierByIdAsync(int id)
        {
            var s = await _uow.Suppliers.GetByIdAsync(id);
            if (s == null) return ApiResponse<SupplierDto>.NotFound("Supplier not found");

            return ApiResponse<SupplierDto>.Ok(new SupplierDto
            {
                Id = s.Id,
                Name = s.Name,
                Phone = s.Phone,
                Email = s.Email,
                Address = s.Address,
                TaxNumber = s.TaxNumber,
                IsActive = s.IsActive,
                CreatedAt = s.CreatedAt
            });
        }

        public async Task<ApiResponse<SupplierDto>> CreateSupplierAsync(CreateSupplierDto dto)
        {
            var supplier = new Supplier
            {
                Name = dto.Name,
                Phone = dto.Phone,
                Email = dto.Email,
                Address = dto.Address,
                TaxNumber = dto.TaxNumber,
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            _uow.Suppliers.Add(supplier);
            await _uow.SaveChangesAsync();

            // Send Welcome Email
            if (!string.IsNullOrEmpty(supplier.Email))
            {
                var emailHtml = _emailService.GenerateEmailTemplate(
                    "Welcome to StockMaster Network!",
                    $@"Hello {supplier.Name},<br><br>
                    You have been successfully added as a supplier in our StockMaster ecosystem.<br>
                    We value our partnership and look forward to a successful business relationship.<br><br>
                    If you have any questions, please contact our procurement team."
                );

                _ = _emailService.SendEmailAsync(supplier.Email, "Welcome to StockMaster as a Supplier", emailHtml);
            }

            return ApiResponse<SupplierDto>.Created(new SupplierDto
            {
                Id = supplier.Id,
                Name = supplier.Name,
                Phone = supplier.Phone,
                Email = supplier.Email,
                Address = supplier.Address,
                TaxNumber = supplier.TaxNumber,
                IsActive = supplier.IsActive,
                CreatedAt = supplier.CreatedAt
            }, "Supplier created successfully");
        }

        public async Task<ApiResponse<SupplierDto>> UpdateSupplierAsync(int id, UpdateSupplierDto dto)
        {
            var supplier = await _uow.Suppliers.GetByIdAsync(id);
            if (supplier == null) return ApiResponse<SupplierDto>.NotFound("Supplier not found");

            supplier.Name = dto.Name;
            supplier.Phone = dto.Phone;
            supplier.Email = dto.Email;
            supplier.Address = dto.Address;
            supplier.TaxNumber = dto.TaxNumber;
            supplier.IsActive = dto.IsActive;

            await _uow.SaveChangesAsync();

            return ApiResponse<SupplierDto>.Ok(new SupplierDto
            {
                Id = supplier.Id,
                Name = supplier.Name,
                Phone = supplier.Phone,
                Email = supplier.Email,
                Address = supplier.Address,
                TaxNumber = supplier.TaxNumber,
                IsActive = supplier.IsActive,
                CreatedAt = supplier.CreatedAt
            }, "Supplier updated successfully");
        }

        public async Task<ApiResponse<bool>> DeleteSupplierAsync(int id)
        {
            var supplier = await _uow.Suppliers.GetByIdAsync(id);
            if (supplier == null) return ApiResponse<bool>.NotFound("Supplier not found");

            supplier.IsActive = false;
            await _uow.SaveChangesAsync();

            return ApiResponse<bool>.Ok(true, "Supplier deactivated successfully");
        }
    }
}

