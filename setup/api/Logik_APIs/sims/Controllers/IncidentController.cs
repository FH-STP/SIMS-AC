using System.Diagnostics.CodeAnalysis;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using sims.Models;

namespace sims.Controllers;

[ApiController]
[Route("[controller]")]
public class IncidentController : ControllerBase
{

    [HttpGet("GetIncidentInfo/{id}")]
    public IActionResult GetIncidentInfo(string id)
    {
        //TODO
        Incident incident = new Incident(int.Parse(id), 0, 0, "Malware", "Computer 1 got infected with Shai Hulud",
                  "", 5, 1, 1, DateTime.Now);
        return Ok(incident);
    }

    [HttpGet("GetIncidentList")]
    public IActionResult GetIncidentList()
    {
        //TODO
        Incident[] incidentList = new Incident[1];
        incidentList[0] = new Incident(0, 0, 0, "Malware", "Computer 1 got infected with Shai Hulud",
                  "", 5, 1, 1, DateTime.Now);
        return Ok(incidentList);
    }

    [HttpPost(Name = "CreateIncident")]
    public IActionResult CreateIncident([FromBody] Incident incident)
    {
        //TODO
        incident.Id = 777;
        return CreatedAtAction(nameof(CreateIncident), new { id = incident.Id }, incident);
    }

    [HttpDelete(Name = "DisableIncident")]
    public IActionResult DisableIncident([FromBody] int id)
    {
        //TODO
        return NoContent();
    }

    [HttpPut("Escalate")]
    public IActionResult Escalate([FromBody] int id, int severity)
    {
        //TODO
        return Ok();
    }

    [HttpPut("ChangeStatus")]
    public IActionResult ChangeStatus([FromBody] int id, int status)
    {
        //TODO
        return Ok();
    }

    [HttpPut("ChangeNotes")]
    public IActionResult ChangeNotes([FromBody] int id, string notes)
    {
        //TODO
        return Ok();
    }

    [HttpPut("Assign")]
    public IActionResult Assign([FromBody] int id, int owner)
    {
        //TODO
        return Ok();
    }

}
