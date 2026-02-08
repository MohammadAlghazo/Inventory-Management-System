using Inventory_Management._DbContext;
using Inventory_Management.Dtos.Auth_Dto;
using Inventory_Management.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Inventory_Management.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _dbContext;
        public AuthController(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpPost("Login")]
        public IActionResult Login([FromBody] LoginDto loginDto)
        {
            try
            {
                var user = _dbContext.Users.FirstOrDefault(x => x.Username.ToUpper() == loginDto.Username.ToUpper());

                if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.HashedPassword))
                {
                    return BadRequest("Invalid Username Or Password");
                }

                var token = GenerateJwtToken(user);
                return Ok(token);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("Register")]
        public IActionResult Register([FromBody] RegisterDto registerDto)
        {
            try
            {
                if (registerDto == null)
                    return BadRequest("Invalid data");

                if (_dbContext.Users.Any(u => u.Username.ToLower() == registerDto.Username.ToLower()))
                {
                    return BadRequest(new { message = "Username is already taken" });
                }

                var role = registerDto.Roles?.FirstOrDefault() ?? "Employee";
                var isAdmin = role.Equals("Manager", StringComparison.OrdinalIgnoreCase);

                var newUser = new User
                {
                    Username = registerDto.Username,

                    HashedPassword = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),

                    Role = role,
                    IsAdmin = isAdmin
                };

                _dbContext.Users.Add(newUser);
                _dbContext.SaveChanges();

                return Ok(new { message = "User Registered Successfully!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error", error = ex.Message });
            }
        }

        private string GenerateJwtToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username)
            };

            if (user.IsAdmin)
            {
                claims.Add(new Claim(ClaimTypes.Role, "Manager"));
            }
            else
            {
                claims.Add(new Claim(ClaimTypes.Role, user.Role ?? "Employee"));
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("WHAFWEI#!@S!!112312WQEQW@RWQEQW432"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var tokenSettings = new JwtSecurityToken(
                claims: claims,
                signingCredentials: creds,
                expires: DateTime.Now.AddDays(1)
            );

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.WriteToken(tokenSettings);

            return token;
        }
    }
}