using System.Security.Claims;
using InventoryManagement.Application.Dtos.Auth_Dto;
using InventoryManagement.Application.Services;
using Microsoft.AspNetCore.Authorization;
using InventoryManagement.Domain.Constants;
using Microsoft.AspNetCore.Mvc;

namespace InventoryManagement.Api.Controllers
{
    [Route("api/users")]
    [ApiController]
    [Authorize(Roles = RoleConstants.SuperAdmin)]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null,
            [FromQuery] bool? isActive = null,
            [FromQuery] string? role = null)
        {
            var result = await _userService.GetAllUsersAsync(page, pageSize, search, isActive, role);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _userService.GetUserByIdAsync(id);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateUserDto dto)
        {
            var result = await _userService.UpdateUserAsync(id, dto);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPatch("{id:int}/toggle-status")]
        public async Task<IActionResult> ToggleStatus(int id)
        {
            var result = await _userService.ToggleUserStatusAsync(id);
            return StatusCode(result.StatusCode, result);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _userService.DeleteUserAsync(id);
            return StatusCode(result.StatusCode, result);
        }
        
        [HttpPut("{id}/profile-picture")]
        [Authorize]
        public async Task<IActionResult> UpdateProfilePicture(int id, UpdateProfilePictureDto dto)
        {
            // Allow if SuperAdmin OR if the user is updating their own picture
            var currentUserIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var isSuperAdmin = User.IsInRole("SuperAdmin");

            if (!isSuperAdmin && currentUserIdStr != id.ToString())
            {
                return Forbid();
            }

            var result = await _userService.UpdateProfilePictureAsync(id, dto);
            if (!result.Success)
            {
                return BadRequest(result);
            }
            return Ok(result);
        }

        [HttpDelete("{id}/profile-picture")]
        [Authorize]
        public async Task<IActionResult> DeleteProfilePicture(int id)
        {
            var currentUserIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var isSuperAdmin = User.IsInRole("SuperAdmin");

            if (!isSuperAdmin && currentUserIdStr != id.ToString())
            {
                return Forbid();
            }

            var result = await _userService.DeleteProfilePictureAsync(id);
            if (!result.Success)
            {
                return BadRequest(result);
            }
            return Ok(result);
        }
    }
}

