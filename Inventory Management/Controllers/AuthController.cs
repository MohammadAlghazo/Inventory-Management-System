using Inventory_Management.Dtos.Auth_Dto;
using Inventory_Management.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;

namespace Inventory_Management.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        /// <summary>Login and receive JWT + Refresh Token</summary>
        [HttpPost("login")]
        [EnableRateLimiting("LoginPolicy")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var result = await _authService.LoginAsync(dto);
            return StatusCode(result.StatusCode, result);
        }

        /// <summary>Register a new user — Manager only</summary>
        [HttpPost("register")]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _authService.RegisterAsync(dto, userId);
            return StatusCode(result.StatusCode, result);
        }

        /// <summary>Refresh JWT using a valid refresh token</summary>
        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenDto dto)
        {
            var result = await _authService.RefreshTokenAsync(dto.RefreshToken);
            return StatusCode(result.StatusCode, result);
        }

        /// <summary>Get currently authenticated user's profile</summary>
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _authService.GetCurrentUserAsync(userId);
            return StatusCode(result.StatusCode, result);
        }

        /// <summary>Change password for the authenticated user</summary>
        [HttpPut("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _authService.ChangePasswordAsync(userId, dto);
            return StatusCode(result.StatusCode, result);
        }
    }
}