using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using sims.Models;

namespace sims.Controllers;

[ApiController]
[Route("[controller]")]
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
