using Inventory_Management._DbContext;
using Inventory_Management.Common;
using Inventory_Management.Dtos.Auth_Dto;
using Microsoft.EntityFrameworkCore;

namespace Inventory_Management.Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _db;

        public UserService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<ApiResponse<PagedResult<UserProfileDto>>> GetAllUsersAsync(int page, int pageSize, string? search)
        {
            var q = _db.Users.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.ToLower();
                q = q.Where(u => u.Username.ToLower().Contains(s) ||
                                 u.Email.ToLower().Contains(s) ||
                                 u.FirstName.ToLower().Contains(s) ||
                                 u.LastName.ToLower().Contains(s));
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
                    Role           = u.Role,
                    IsAdmin        = u.Role == "Manager",
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
            var user = await _db.Users.FindAsync(id);
            if (user == null)
                return ApiResponse<UserProfileDto>.NotFound("User not found");

            return ApiResponse<UserProfileDto>.Ok(new UserProfileDto
            {
                Id             = user.Id,
                Username       = user.Username,
                Email          = user.Email,
                FirstName      = user.FirstName,
                LastName       = user.LastName,
                Role           = user.Role,
                IsAdmin        = user.IsAdmin,
                IsActive       = user.IsActive,
                ProfilePicture = user.ProfilePicture,
                CreatedAt      = user.CreatedAt
            });
        }

        public async Task<ApiResponse<UserProfileDto>> UpdateUserAsync(int id, UpdateUserDto dto)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null)
                return ApiResponse<UserProfileDto>.NotFound("User not found");

            if (!string.IsNullOrWhiteSpace(dto.Email) &&
                await _db.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower() && u.Id != id))
                return ApiResponse<UserProfileDto>.Fail("Email is already in use by another account");

            var validRoles = new[] { "Manager", "Employee" };
            if (!string.IsNullOrWhiteSpace(dto.Role) && !validRoles.Contains(dto.Role))
                return ApiResponse<UserProfileDto>.Fail("Invalid role. Must be 'Manager' or 'Employee'");

            user.Email     = dto.Email ?? user.Email;
            user.FirstName = dto.FirstName ?? user.FirstName;
            user.LastName  = dto.LastName ?? user.LastName;
            user.Role      = dto.Role ?? user.Role;
            user.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return ApiResponse<UserProfileDto>.Ok(new UserProfileDto
            {
                Id             = user.Id,
                Username       = user.Username,
                Email          = user.Email,
                FirstName      = user.FirstName,
                LastName       = user.LastName,
                Role           = user.Role,
                IsAdmin        = user.IsAdmin,
                IsActive       = user.IsActive,
                ProfilePicture = user.ProfilePicture,
                CreatedAt      = user.CreatedAt
            }, "User updated successfully");
        }

        public async Task<ApiResponse<object>> ToggleUserStatusAsync(int id)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null)
                return ApiResponse<object>.NotFound("User not found");

            if (id == 1)
                return ApiResponse<object>.Fail("Cannot disable the primary admin account");

            user.IsActive  = !user.IsActive;
            user.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            var status = user.IsActive ? "activated" : "deactivated";
            return ApiResponse<object>.Ok(new { isActive = user.IsActive }, $"User {status} successfully");
        }

        public async Task<ApiResponse<object>> DeleteUserAsync(int id)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null)
                return ApiResponse<object>.NotFound("User not found");

            if (id == 1)
                return ApiResponse<object>.Fail("Cannot delete the primary admin account");

            user.IsActive = false;
            await _db.SaveChangesAsync();

            return ApiResponse<object>.Ok(null!, "User deactivated successfully");
        }
    }
}

