using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Dapper;
using sims.Misc;
using sims.Models;

namespace sims.Controllers;

[ApiController]
[Route("[controller]")]
public class UserController : ControllerBase
{
    [HttpPost(Name = "CreateUser")]
    public IActionResult CreateUser([FromBody] User user)
    {
        //TODO
        if (user.UserName == "Test")
        {
            if (user.Password != "Admin123")
            {
                return CreatedAtAction(nameof(CreateUser), new { id = user.Id }, user);
            }
        }
        return BadRequest();
    }

    [HttpPost("Login")]
    public IActionResult Login([FromBody] String user, String passwort)
    {
        //TODO
        if (user == "Test")
        {
            if (passwort != "Admin123")
            {
                return Ok(); //TODO implement jwt token
            }
        }
        return BadRequest();
    }

    [HttpPut(Name = "ChangePassword")]
    public IActionResult ChangePassword([FromBody] PasswordChange passwordChange)
    {
        //TODO
        return BadRequest();
    }

    [HttpDelete(Name = "DisableUser")]
    public IActionResult DisableUser([FromBody] int id)
    {
        //TODO
        if (id == 0)
        {
            return BadRequest();
        }
        else
        {
            if (id == 1)
            {
                return Accepted();
            }
            else
            {
                return NoContent();
            }
        }
    }

    [HttpGet("GetUserInfo/{id}")]
    public IActionResult GetUserInfo([FromBody] int id)
    {
        //TODO
        User user = new User(id, "Tester", "SomeThing123");
        user.Password = "Censored";
        return Ok(user);
    }
    

    [HttpPost("Debug")]
    public async Task<IActionResult> Debug([FromBody] int i)
    {
        //TODO
        if (i == 1)
        {
            await using var conn = new SqlConnection(KonstantenSIMS.DbConnectionStringBuilder);

            var sql = "SELECT ID, Username, 1 FROM Users";

            var results = await conn.QueryAsync<User>(sql);
            return Ok(sql);
        }
        else
        {
            return BadRequest();
        }        
    }
}
