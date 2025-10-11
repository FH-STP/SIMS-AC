using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Dapper;
using sims.Misc;
using sims.Models;
using sims.Services;
using Microsoft.AspNetCore.Authorization;

namespace sims.Controllers;

[ApiController]
[Route("[controller]")]
public class AccountController : ControllerBase
{

    private readonly JwtService JwtService;

    public AccountController(JwtService jwtService)
    {
        JwtService = jwtService;
    }
    
    [AllowAnonymous]
    [HttpPost("Login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest loginRequest)
    {
        var Tesult = await JwtService.Authenticate(loginRequest);
        if(Tesult is null)
        {
            return Unauthorized();
        }

        return BadRequest();
    }
}
