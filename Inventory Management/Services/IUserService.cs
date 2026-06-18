using Inventory_Management.Common;
using Inventory_Management.Dtos.Auth_Dto;

namespace Inventory_Management.Services
{
    public interface IUserService
    {
        Task<ApiResponse<PagedResult<UserProfileDto>>> GetAllUsersAsync(int page, int pageSize, string? search);
        Task<ApiResponse<UserProfileDto>> GetUserByIdAsync(int id);
        Task<ApiResponse<UserProfileDto>> UpdateUserAsync(int id, UpdateUserDto dto);
        Task<ApiResponse<object>> ToggleUserStatusAsync(int id);
        Task<ApiResponse<object>> DeleteUserAsync(int id);
    }
}
