using InventoryManagement.Domain.Common;
using InventoryManagement.Application.Dtos.Auth_Dto;

namespace InventoryManagement.Application.Services
{
    public interface IAuthService
    {
        Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginDto dto);
        Task<ApiResponse<object>> RegisterAsync(RegisterDto dto, int requestingUserId);
        Task<ApiResponse<AuthResponseDto>> RefreshTokenAsync(string refreshToken);
        Task<ApiResponse<UserProfileDto>> GetCurrentUserAsync(int userId);
        Task<ApiResponse<object>> ChangePasswordAsync(int userId, ChangePasswordDto dto);
        Task<ApiResponse<UserProfileDto>> UpdateProfileAsync(int userId, UpdateProfileDto dto);
    }
}

