using InventoryManagement.Application.Common.Interfaces;
using InventoryManagement.Domain.Interfaces;
using InventoryManagement.Domain.Common;
using InventoryManagement.Application.Dtos.Auth_Dto;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Application.Services
{
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _uow;

        public UserService(IUnitOfWork uow)
        {
            _uow = uow;
        }

        public async Task<ApiResponse<PagedResult<UserProfileDto>>> GetAllUsersAsync(int page, int pageSize, string? search, bool? isActive = null, string? role = null)
        {
            var q = _uow.Users.Query().Include(u => u.Role).AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.ToLower();
                q = q.Where(u => u.Username.ToLower().Contains(s) ||
                                 u.Email.ToLower().Contains(s) ||
                                 u.FirstName.ToLower().Contains(s) ||
                                 u.LastName.ToLower().Contains(s));
            }
            if (isActive.HasValue)
            {
                q = q.Where(u => u.IsActive == isActive.Value);
            }

            if (!string.IsNullOrWhiteSpace(role))
            {
                q = q.Where(u => u.Role != null && u.Role.Name == role);
            }

            var total = await q.CountAsync();

            var items = await q
                .OrderBy(u => u.Username)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new UserProfileDto
                {
                    Id             = u.Id,
                    Username       = u.Username,
                    Email          = u.Email,
                    FirstName      = u.FirstName,
                    LastName       = u.LastName,
                    Role           = u.Role != null ? u.Role.Name : "WarehouseStaff",
                    IsAdmin        = u.RoleId == 1 || u.RoleId == 2,
                    IsActive       = u.IsActive,
                    ProfilePicture = u.ProfilePicture,
                    CreatedAt      = u.CreatedAt
                })
                .ToListAsync();

            return ApiResponse<PagedResult<UserProfileDto>>.Ok(new PagedResult<UserProfileDto>
            {
                Items = items,
                TotalCount = total,
                Page = page,
                PageSize = pageSize
            });
        }

        public async Task<ApiResponse<UserProfileDto>> GetUserByIdAsync(int id)
        {
            var user = await _uow.Users.GetByIdAsync(id);
            if (user == null)
                return ApiResponse<UserProfileDto>.NotFound("User not found");

            return ApiResponse<UserProfileDto>.Ok(new UserProfileDto
            {
                Id             = user.Id,
                Username       = user.Username,
                Email          = user.Email,
                FirstName      = user.FirstName,
                LastName       = user.LastName,
                Role           = user.Role != null ? user.Role.Name : "Employee",
                IsAdmin        = user.RoleId == 1 || user.RoleId == 2,
                IsActive       = user.IsActive,
                ProfilePicture = user.ProfilePicture,
                CreatedAt      = user.CreatedAt
            });
        }

        public async Task<ApiResponse<UserProfileDto>> UpdateUserAsync(int id, UpdateUserDto dto)
        {
            var user = await _uow.Users.Query().Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == id);
            if (user == null)
                return ApiResponse<UserProfileDto>.NotFound("User not found");

            if (!string.IsNullOrWhiteSpace(dto.Email) &&
                await _uow.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower() && u.Id != id))
                return ApiResponse<UserProfileDto>.Fail("Email is already in use by another account");

            if (!string.IsNullOrWhiteSpace(dto.Email)) user.Email = dto.Email;
            user.FirstName = dto.FirstName;
            user.LastName = dto.LastName;

            if (!string.IsNullOrWhiteSpace(dto.Role))
            {
                var role = await _uow.Roles.Query().FirstOrDefaultAsync(r => r.Name == dto.Role);
                if (role != null) user.RoleId = role.Id;
            }
            user.UpdatedAt = DateTime.UtcNow;

            await _uow.SaveChangesAsync();

            return ApiResponse<UserProfileDto>.Ok(new UserProfileDto
            {
                Id             = user.Id,
                Username       = user.Username,
                Email          = user.Email,
                FirstName      = user.FirstName,
                LastName       = user.LastName,
                Role           = user.Role != null ? user.Role.Name : "WarehouseStaff",
                IsAdmin        = user.RoleId == 1 || user.RoleId == 2,
                IsActive       = user.IsActive,
                ProfilePicture = user.ProfilePicture,
                CreatedAt      = user.CreatedAt
            }, "User updated successfully");
        }

        public async Task<ApiResponse<object>> ToggleUserStatusAsync(int id)
        {
            var user = await _uow.Users.GetByIdAsync(id);
            if (user == null)
                return ApiResponse<object>.NotFound("User not found");

            if (id == 1)
                return ApiResponse<object>.Fail("Cannot disable the primary admin account");

            user.IsActive  = !user.IsActive;
            user.UpdatedAt = DateTime.UtcNow;
            await _uow.SaveChangesAsync();

            var status = user.IsActive ? "activated" : "deactivated";
            return ApiResponse<object>.Ok(new { isActive = user.IsActive }, $"User {status} successfully");
        }

        public async Task<ApiResponse<object>> DeleteUserAsync(int id)
        {
            var user = await _uow.Users.GetByIdAsync(id);
            if (user == null)
                return ApiResponse<object>.NotFound("User not found");

            if (id == 1)
                return ApiResponse<object>.Fail("Cannot delete the primary admin account");

            user.IsActive = false;
            await _uow.SaveChangesAsync();

            return ApiResponse<object>.Ok(null!, "User deactivated successfully");
        }
                    public async Task<ApiResponse<object>> UpdateProfilePictureAsync(int id, UpdateProfilePictureDto dto)
        {
            var user = await _uow.Users.GetByIdAsync(id);
            if (user == null)
            {
                return ApiResponse<object>.NotFound("User not found.");
            }

            user.ProfilePicture = dto.ProfilePictureUrl;
            user.UpdatedAt = DateTime.UtcNow;

            await _uow.SaveChangesAsync();
            return ApiResponse<object>.Ok(new { ProfilePicture = user.ProfilePicture }, "Profile picture updated successfully.");
        }

        public async Task<ApiResponse<object>> DeleteProfilePictureAsync(int id)
        {
            var user = await _uow.Users.GetByIdAsync(id);
            if (user == null)
            {
                return ApiResponse<object>.NotFound("User not found.");
            }

            user.ProfilePicture = null;
            user.UpdatedAt = DateTime.UtcNow;

            await _uow.SaveChangesAsync();
            return ApiResponse<object>.Ok(null!, "Profile picture deleted successfully.");
        }
    }
}