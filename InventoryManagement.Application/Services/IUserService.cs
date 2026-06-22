using InventoryManagement.Domain.Common;
using InventoryManagement.Application.Dtos.Auth_Dto;

namespace InventoryManagement.Application.Services
{
    public interface IUserService
    {
        Task<ApiResponse<PagedResult<UserProfileDto>>> GetAllUsersAsync(int page, int pageSize, string? search, bool? isActive = null, string? role = null);
        Task<ApiResponse<UserProfileDto>> GetUserByIdAsync(int id);
        Task<ApiResponse<UserProfileDto>> UpdateUserAsync(int id, UpdateUserDto dto);
        Task<ApiResponse<object>> ToggleUserStatusAsync(int id);
        Task<ApiResponse<object>> DeleteUserAsync(int id);
    
        Task<ApiResponse<object>> UpdateProfilePictureAsync(int id, UpdateProfilePictureDto dto);
        Task<ApiResponse<object>> DeleteProfilePictureAsync(int id);
    }
}