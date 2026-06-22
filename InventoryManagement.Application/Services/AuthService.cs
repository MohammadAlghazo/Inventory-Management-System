using InventoryManagement.Application.Extensions;
using Microsoft.Extensions.Configuration;
using InventoryManagement.Application.Common.Interfaces;
using InventoryManagement.Domain.Common;
using InventoryManagement.Application.Dtos.Auth_Dto;
using InventoryManagement.Domain.Entities;

using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace InventoryManagement.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IAppDbContext _db;
        private readonly IConfiguration _config;
        private readonly IEmailService _emailService;

        public AuthService(IAppDbContext db, IConfiguration config, IEmailService emailService)
        {
            _db = db;
            _config = config;
            _emailService = emailService;
        }

        public async Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginDto dto)
        {
            var user = await _db.Users
                .Include(u => u.Role)
                .ThenInclude(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
                .FirstOrDefaultAsync(u => u.Username.ToUpper() == dto.Username.ToUpper() || u.Email.ToUpper() == dto.Username.ToUpper());

            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.HashedPassword))
                return ApiResponse<AuthResponseDto>.Fail("Invalid username or password", 401);

            if (!user.IsActive)
                return ApiResponse<AuthResponseDto>.Fail("Account is disabled. Contact administrator.", 403);

            var token = GenerateJwtToken(user);
            var refreshToken = GenerateRefreshToken();

            user.RefreshToken = ComputeSha256Hash(refreshToken);
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(
                _config.GetValue<int>("JwtSettings:RefreshTokenExpirationDays", 7));
            user.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return ApiResponse<AuthResponseDto>.Ok(new AuthResponseDto
            {
                Token = token,
                RefreshToken = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddHours(_config.GetValue<int>("JwtSettings:ExpirationHours", 1)),
                User = MapToProfile(user),
                MustChangePassword = user.MustChangePassword
            }, "Login successful");
        }

        public async Task<ApiResponse<object>> RegisterAsync(RegisterDto dto, int requestingUserId)
        {
            
            var requestingUser = await _db.Users.FindAsync(requestingUserId);
            if (requestingUser == null || (requestingUser.RoleId != 1 && requestingUser.RoleId != 2))
                return ApiResponse<object>.Forbidden("Only managers can register new users");

            if (await _db.Users.AnyAsync(u => u.Username.ToLower() == dto.Username.ToLower()))
                return ApiResponse<object>.Fail("Username is already taken");

            if (await _db.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower()))
                return ApiResponse<object>.Fail("Email is already registered");

            var role = await _db.Roles.FirstOrDefaultAsync(r => r.Name == dto.Role);
            if (role == null)
                return ApiResponse<object>.Fail("Invalid role");

            if (requestingUser.RoleId == 2 && role.Id == 1)
                return ApiResponse<object>.Forbidden("Inventory Managers cannot register SuperAdmin users");

            var newUser = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                HashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                RoleId = role.Id,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.Users.Add(newUser);

            _db.AddNotification("New User Registered", $"New user '{newUser.Username}' has been registered as '{role.Name}'.", "Info", "Manager");

            await _db.SaveChangesAsync();

            // Send Welcome Email
            if (!string.IsNullOrEmpty(newUser.Email))
            {
                var emailHtml = _emailService.GenerateEmailTemplate(
                    "Welcome to StockMaster!",
                    $@"Hello {newUser.FirstName},<br><br>
                    An account has been created for you on the StockMaster platform as a <b>{role.Name}</b>.<br><br>
                    Your login details are:<br>
                    <b>Username:</b> {newUser.Username}<br>
                    <b>Password:</b> {dto.Password}<br><br>
                    Please log in and change your password as soon as possible.",
                    "Login to StockMaster",
                    "https://stockmaster-48q.pages.dev/login"
                );

                // Run in background so it doesn't block the API response
                _ = _emailService.SendEmailAsync(newUser.Email, "Welcome to StockMaster - Your Account Details", emailHtml);
            }

            return ApiResponse<object>.Created(new { userId = newUser.Id }, "User registered successfully");
        }

        public async Task<ApiResponse<AuthResponseDto>> RefreshTokenAsync(string refreshToken)
        {
            string hashedToken = ComputeSha256Hash(refreshToken);
            var user = await _db.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.RefreshToken == hashedToken);

            if (user == null || user.RefreshTokenExpiry < DateTime.UtcNow)
                return ApiResponse<AuthResponseDto>.Unauthorized("Invalid or expired refresh token");

            var token = GenerateJwtToken(user);
            var newRefreshToken = GenerateRefreshToken();

            user.RefreshToken = ComputeSha256Hash(newRefreshToken);
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(
                _config.GetValue<int>("JwtSettings:RefreshTokenExpirationDays", 7));
            user.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return ApiResponse<AuthResponseDto>.Ok(new AuthResponseDto
            {
                Token = token,
                RefreshToken = newRefreshToken,
                ExpiresAt = DateTime.UtcNow.AddHours(_config.GetValue<int>("JwtSettings:ExpirationHours", 1)),
                User = MapToProfile(user),
                MustChangePassword = user.MustChangePassword
            });
        }

        public async Task<ApiResponse<UserProfileDto>> GetCurrentUserAsync(int userId)
        {
            var user = await _db.Users
                .Include(u => u.Role)
                .ThenInclude(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
                .FirstOrDefaultAsync(u => u.Id == userId);
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
            user.MustChangePassword = false;
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

        public async Task<ApiResponse<object>> ForgotPasswordAsync(ForgotPasswordDto dto)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());
            if (user == null || !user.IsActive)
                return ApiResponse<object>.Ok(null!, "If that email exists in our system, a temporary password has been sent."); // Generic response for security

            // Generate a random 8-character password
            string tempPassword = GenerateRandomPassword(8);
            
            user.HashedPassword = BCrypt.Net.BCrypt.HashPassword(tempPassword);
            user.MustChangePassword = true;
            user.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            var emailHtml = _emailService.GenerateEmailTemplate(
                "Password Reset",
                $@"Hello {user.FirstName},<br><br>
                A password reset was requested for your account on StockMaster.<br><br>
                Your temporary password is:<br>
                <b style='font-size: 18px;'>{tempPassword}</b><br><br>
                Please log in with this password and navigate to your Profile to change it immediately.",
                "Login to StockMaster",
                "https://stockmaster-48q.pages.dev/login"
            );

            _ = _emailService.SendEmailAsync(user.Email, "StockMaster - Password Reset", emailHtml);

            return ApiResponse<object>.Ok(null!, "If that email exists in our system, a temporary password has been sent.");
        }

        private string GenerateRandomPassword(int length)
        {
            const string validChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890@#$*!";
            StringBuilder res = new StringBuilder();
            using (var rng = RandomNumberGenerator.Create())
            {
                byte[] uintBuffer = new byte[sizeof(uint)];
                while (length-- > 0)
                {
                    rng.GetBytes(uintBuffer);
                    uint num = BitConverter.ToUInt32(uintBuffer, 0);
                    res.Append(validChars[(int)(num % (uint)validChars.Length)]);
                }
            }
            return res.ToString();
        }

        private string GenerateJwtToken(User user)
        {
            var key = _config["JwtSettings:SecretKey"]
                ?? throw new InvalidOperationException("JWT SecretKey not configured");

            var roleName = user.Role != null ? user.Role.Name : "Employee";
            if (roleName == "Manager") roleName = "SuperAdmin";
            if (roleName == "Employee") roleName = "WarehouseStaff";

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(ClaimTypes.Name, user.Username),
                new(ClaimTypes.Email, user.Email),
                new(ClaimTypes.Role, roleName)
            };

            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var creds = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

            var expirationHours = _config.GetValue<int>("JwtSettings:ExpirationHours", 1);
            var token = new JwtSecurityToken(
                issuer: _config["JwtSettings:Issuer"],
                audience: _config["JwtSettings:Audience"],
                claims: claims,
                signingCredentials: creds,
                expires: DateTime.UtcNow.AddHours(expirationHours)
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static string GenerateRefreshToken()
        {
            var bytes = new byte[64];
            RandomNumberGenerator.Fill(bytes);
            return Convert.ToBase64String(bytes);
        }

        private static UserProfileDto MapToProfile(User user)
        {
            var roleName = user.Role != null ? user.Role.Name : "Employee";
            if (roleName == "Manager") roleName = "SuperAdmin";
            if (roleName == "Employee") roleName = "WarehouseStaff";

            return new UserProfileDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = roleName,
                IsAdmin = user.RoleId == 1 || user.RoleId == 2,
                IsActive = user.IsActive,
                MustChangePassword = user.MustChangePassword,
                ProfilePicture = user.ProfilePicture,
                CreatedAt = user.CreatedAt,
                Permissions = user.Role?.RolePermissions?.Select(rp => rp.Permission.SystemName).ToList() ?? new List<string>()
            };
        }

        private static string ComputeSha256Hash(string rawData)
        {
            using (SHA256 sha256Hash = SHA256.Create())
            {
                byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(rawData));
                StringBuilder builder = new StringBuilder();
                for (int i = 0; i < bytes.Length; i++)
                {
                    builder.Append(bytes[i].ToString("x2"));
                }
                return builder.ToString();
            }
        }
    }
}

