using Inventory_Management._DbContext;
using Inventory_Management.Common;
using Inventory_Management.Dtos.Auth_Dto;
using Inventory_Management.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Inventory_Management.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _db;
        private readonly IConfiguration _config;

        public AuthService(AppDbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        public async Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginDto dto)
        {
            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.Username.ToUpper() == dto.Username.ToUpper());

            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.HashedPassword))
                return ApiResponse<AuthResponseDto>.Fail("Invalid username or password", 401);

            if (!user.IsActive)
                return ApiResponse<AuthResponseDto>.Fail("Account is disabled. Contact administrator.", 403);

            var token = GenerateJwtToken(user);
            var refreshToken = GenerateRefreshToken();

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(
                _config.GetValue<int>("JwtSettings:RefreshTokenExpirationDays", 7));
            user.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return ApiResponse<AuthResponseDto>.Ok(new AuthResponseDto
            {
                Token = token,
                RefreshToken = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(_config.GetValue<int>("JwtSettings:ExpirationDays", 1)),
                User = MapToProfile(user)
            }, "Login successful");
        }

        public async Task<ApiResponse<object>> RegisterAsync(RegisterDto dto, int requestingUserId)
        {
            
            var requestingUser = await _db.Users.FindAsync(requestingUserId);
            if (requestingUser == null || !requestingUser.IsAdmin)
                return ApiResponse<object>.Forbidden("Only managers can register new users");

            if (await _db.Users.AnyAsync(u => u.Username.ToLower() == dto.Username.ToLower()))
                return ApiResponse<object>.Fail("Username is already taken");

            if (await _db.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower()))
                return ApiResponse<object>.Fail("Email is already registered");

            var validRoles = new[] { "Manager", "Employee" };
            if (!validRoles.Contains(dto.Role))
                return ApiResponse<object>.Fail("Invalid role. Must be 'Manager' or 'Employee'");

            var newUser = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                HashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = dto.Role,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.Users.Add(newUser);

            _db.Notifications.Add(new Notification
            {
                Title = "User Registered",
                Message = $"New user '{newUser.Username}' has been registered as '{newUser.Role}'.",
                Type = "Info",
                TargetRole = "Manager",
                CreatedAt = DateTime.UtcNow
            });

            await _db.SaveChangesAsync();

            return ApiResponse<object>.Created(new { userId = newUser.Id }, "User registered successfully");
        }

        public async Task<ApiResponse<AuthResponseDto>> RefreshTokenAsync(string refreshToken)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);

            if (user == null || user.RefreshTokenExpiry < DateTime.UtcNow)
                return ApiResponse<AuthResponseDto>.Unauthorized("Invalid or expired refresh token");

            var token = GenerateJwtToken(user);
            var newRefreshToken = GenerateRefreshToken();

            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(
                _config.GetValue<int>("JwtSettings:RefreshTokenExpirationDays", 7));
            user.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return ApiResponse<AuthResponseDto>.Ok(new AuthResponseDto
            {
                Token = token,
                RefreshToken = newRefreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(_config.GetValue<int>("JwtSettings:ExpirationDays", 1)),
                User = MapToProfile(user)
            });
        }

        public async Task<ApiResponse<UserProfileDto>> GetCurrentUserAsync(int userId)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null) return ApiResponse<UserProfileDto>.NotFound("User not found");

            return ApiResponse<UserProfileDto>.Ok(MapToProfile(user));
        }

        public async Task<ApiResponse<object>> ChangePasswordAsync(int userId, ChangePasswordDto dto)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null) return ApiResponse<object>.NotFound("User not found");

            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.HashedPassword))
                return ApiResponse<object>.Fail("Current password is incorrect");

            user.HashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return ApiResponse<object>.Ok(null!, "Password changed successfully");
        }

        public async Task<ApiResponse<UserProfileDto>> UpdateProfileAsync(int userId, UpdateProfileDto dto)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null) return ApiResponse<UserProfileDto>.NotFound("User not found");

            if (!string.IsNullOrWhiteSpace(dto.Email) &&
                await _db.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower() && u.Id != userId))
                return ApiResponse<UserProfileDto>.Fail("Email is already in use by another account");

            if (!string.IsNullOrWhiteSpace(dto.Email))     user.Email     = dto.Email;
            if (!string.IsNullOrWhiteSpace(dto.FirstName)) user.FirstName = dto.FirstName;
            if (!string.IsNullOrWhiteSpace(dto.LastName))  user.LastName  = dto.LastName;
            user.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return ApiResponse<UserProfileDto>.Ok(MapToProfile(user), "Profile updated successfully");
        }

        private string GenerateJwtToken(User user)
        {
            var key = _config["JwtSettings:SecretKey"]
                ?? throw new InvalidOperationException("JWT SecretKey not configured");

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(ClaimTypes.Name, user.Username),
                new(ClaimTypes.Email, user.Email),
                new(ClaimTypes.Role, user.Role)
            };

            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var creds = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

            var expirationDays = _config.GetValue<int>("JwtSettings:ExpirationDays", 1);
            var token = new JwtSecurityToken(
                claims: claims,
                signingCredentials: creds,
                expires: DateTime.UtcNow.AddDays(expirationDays)
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static string GenerateRefreshToken()
        {
            var bytes = new byte[64];
            RandomNumberGenerator.Fill(bytes);
            return Convert.ToBase64String(bytes);
        }

        private static UserProfileDto MapToProfile(User user) => new()
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = user.Role,
            IsAdmin = user.IsAdmin,
            IsActive = user.IsActive,
            ProfilePicture = user.ProfilePicture,
            CreatedAt = user.CreatedAt
        };
    }
}
