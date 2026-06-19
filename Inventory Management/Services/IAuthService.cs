using Inventory_Management.Common;
using Inventory_Management.Dtos.Auth_Dto;

namespace Inventory_Management.Services
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

