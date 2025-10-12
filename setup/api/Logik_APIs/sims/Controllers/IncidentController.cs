using System.Diagnostics.CodeAnalysis;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using sims.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Data.SqlClient;
using sims.Misc;

namespace sims.Controllers;

[ApiController]
[Route("[controller]")]
//[Authorize]
public class IncidentController : ControllerBase
{

    [HttpGet("GetIncidentInfo/{id}")]
    public IActionResult GetIncidentInfo(int id)
    {
        var conn = new SqlConnection(KonstantenSIMS.DbConnectionStringBuilder);
        var sqlRead = "SELECT ID, OwnerID, CreatorID, Title, API_Text, Notes_Text, Severity, ConclusionID, Status, Creation_Time, IsDisabled FROM Incidents;";
        //TODO Authentication

        conn.Open();
        var Command = new SqlCommand(sqlRead, conn);
        var reader = Command.ExecuteReader();

        if (reader.HasRows)
        {
            while (reader.Read())
            {
                if (reader.GetInt32(0) == id)
                {
                    Incident Result = new Incident(reader.GetInt32(0), reader.GetInt32(1), reader.GetInt32(2), reader.GetString(3), reader.GetString(4),
                  reader.GetString(5), reader.GetInt32(6), reader.GetInt32(7), reader.GetInt32(8), reader.GetDateTime(9), reader.GetBoolean(10));
                    conn.Close();
                    return Ok(Result);
                }
            }
        }

        conn.Close();
                
        return BadRequest();
    }

    [HttpGet("GetIncidentList")]
    public IActionResult GetIncidentList()
    {
        Incident[] incidentList = new Incident[25];
        int iterator = 0;

        var conn = new SqlConnection(KonstantenSIMS.DbConnectionStringBuilder);
        var sqlRead = "SELECT ID, OwnerID, CreatorID, Title, API_Text, Notes_Text, Severity, ConclusionID, Status, Creation_Time, IsDisabled FROM Incidents WHERE IsDisabled=0 ORDER BY id DESC LIMIT 25;";
        //TODO Authentication

        conn.Open();
        var Command = new SqlCommand(sqlRead, conn);
        var reader = Command.ExecuteReader();
        conn.Close();

        if (reader.HasRows)
        {
            while (reader.Read())
            {
                incidentList[iterator] = new Incident(reader.GetInt32(0), reader.GetInt32(1), reader.GetInt32(2), reader.GetString(3), reader.GetString(4),
                  reader.GetString(5), reader.GetInt32(6), reader.GetInt32(7), reader.GetInt32(8), reader.GetDateTime(9), reader.GetBoolean(10));
                iterator++;
            }
        }
        return Ok(incidentList);
    }

    [HttpPost(Name = "CreateIncident")]
    public IActionResult CreateIncident([FromBody] Incident incident)
    {
        //TODO Authentication + SQL-Injection Prevention
        var conn = new SqlConnection(KonstantenSIMS.DbConnectionStringBuilder);
        String IsDisabled = "0";
        if (incident.IsDisabled)
        {
            IsDisabled = "1";
        }
        var SQLInsert = "INSERT INTO Incidents (OwnerID, CreatorID, Title, API_Text,Creation_Time,Severity,Status,Notes_Text,ConclusionID,IsDisabled) VALUES ('" +
        incident.Owner + "', '" + incident.Creator + "', '" + incident.Title + "', '" + incident.APIText + "', '" + Convert.ToString(DateTime.Now) +"', '" + incident.Severity + "', '" + incident.Status + "', '" + incident.NotesText + "', '" + incident.Conclusion + "', " + IsDisabled + ");";
        
        
        conn.Open();
        var Command = new SqlCommand(SQLInsert, conn);
        Command.ExecuteNonQuery();
        conn.Close();

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


    [HttpPost("InserTestInfoIncidents")]
    public async Task<IActionResult> InserTestInfoUser()
    {
        for (int iterator = 0; iterator < 30; iterator++)
        {
            CreateIncident(new Incident(0, 1, 1, "Danger Shai Hulud", "{\"text" + "\": \"Shai Hulud has infected Host X\"}", "", 5, 1, 0, DateTime.Now, false));
            CreateIncident(new Incident(0, 1, 1, "Scan", "{\"text" + "\": \"Host X was Scanned\"}", "", 3, 1, 0, DateTime.Now, false));
        }
        return Ok();
    }
}

