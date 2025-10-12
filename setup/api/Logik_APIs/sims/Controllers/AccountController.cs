using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Dapper;
using sims.Misc;
using sims.Models;
using sims.Services;
using Microsoft.AspNetCore.Authorization;
using System.Data;

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

        UserController myUsers = new UserController();
        int UserID = 0;

        var conn = new SqlConnection(KonstantenSIMS.DbConnectionStringBuilder);
        var sqlRead = "SELECT ID FROM Users WHERE Username= @Name;";

        // Get ID
        conn.Open();
        var Command = new SqlCommand(sqlRead, conn);
        Command.Parameters.Add("@Name", SqlDbType.VarChar);
        Command.Parameters["@Name"].Value = loginRequest.UserName;
        var reader = Command.ExecuteReader();
        if (reader.HasRows)
        {
            while (reader.Read())
            {
                UserID = reader.GetInt32(0);
            }
        }
        conn.Close();
        loginRequest.ID = UserID;

        // Verity PW
        if (loginRequest.Password == null)
        {
            return BadRequest("Password is null.");
        }
        Boolean correctPw = UserController.verifyPW(UserID, loginRequest.Password);
        if (!correctPw)
        {
            return Unauthorized();
        }
        
        var Tesult = await JwtService.Authenticate(loginRequest);
        if(Tesult is null)
        {
            return BadRequest("Impossible Error.");
        }

        return Ok(Tesult);
    }
}
