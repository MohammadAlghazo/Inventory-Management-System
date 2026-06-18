using Inventory_Management.Dtos.Auth_Dto;
using Inventory_Management.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Inventory_Management.Controllers
{
    [Route("api/users")]
    [ApiController]
    [Authorize(Roles = "Manager")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        /// <summary>Get all users with optional search and pagination</summary>
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null)
        {
            var result = await _userService.GetAllUsersAsync(page, pageSize, search);
            return StatusCode(result.StatusCode, result);
        }

        /// <summary>Get a specific user by ID</summary>
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _userService.GetUserByIdAsync(id);
            return StatusCode(result.StatusCode, result);
        }

        /// <summary>Update user profile (email, name, role)</summary>
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateUserDto dto)
        {
            var result = await _userService.UpdateUserAsync(id, dto);
            return StatusCode(result.StatusCode, result);
        }

        /// <summary>Toggle user active/inactive status</summary>
        [HttpPatch("{id:int}/toggle-status")]
        public async Task<IActionResult> ToggleStatus(int id)
        {
            var result = await _userService.ToggleUserStatusAsync(id);
            return StatusCode(result.StatusCode, result);
        }

        /// <summary>Delete a user permanently</summary>
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _userService.DeleteUserAsync(id);
            return StatusCode(result.StatusCode, result);
        }
    }
}
