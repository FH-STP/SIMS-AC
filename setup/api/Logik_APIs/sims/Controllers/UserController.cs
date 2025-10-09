using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using sims.Models;

namespace sims.Controllers;

[ApiController]
[Route("[controller]")]
public class UserController : ControllerBase
{
    [HttpPost(Name = "Createuser")]
    public IActionResult CreateUser([FromBody] string user)
    {
        return Ok();
    }
}
