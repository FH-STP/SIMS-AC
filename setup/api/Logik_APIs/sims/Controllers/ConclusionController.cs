using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using sims.Models;
using Microsoft.AspNetCore.Authorization;

namespace sims.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize]
public class ConclusionController : ControllerBase
{

    [HttpGet("GetConclusionInfo/{id}")]
    public IActionResult GetConclusionInfo([FromBody] int id)
    {
        //TODO
        Conclusion conclusion = new Conclusion(id, "True Positiv - Malware", true, false);
        return Ok(conclusion);
    }

}
