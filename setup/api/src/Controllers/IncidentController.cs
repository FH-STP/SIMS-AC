using System.Diagnostics.CodeAnalysis;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using sims.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Data.SqlClient;
using sims.Misc;
using System.Data;

namespace sims.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize]
public class IncidentController : ControllerBase
{

    [HttpGet("GetIncidentInfo/{id}")]
    public IActionResult GetIncidentInfo(int id)
    {
        var conn = new SqlConnection(KonstantenSIMS.DbConnectionStringBuilder);
        var sqlRead = "SELECT ID, OwnerID, CreatorID, Title, API_Text, Notes_Text, Severity, ConclusionID, Status, Creation_Time, IsDisabled FROM Incidents;";

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
                
        return BadRequest("Incident not found.");
    }

    [HttpGet("GetIncidentList")]
    public IActionResult GetIncidentList()
    {
        Incident[] incidentList = new Incident[25];
        int iterator = 0;

        var conn = new SqlConnection(KonstantenSIMS.DbConnectionStringBuilder);
        var sqlRead = "SELECT ID, OwnerID, CreatorID, Title, API_Text, Notes_Text, Severity, ConclusionID, Status, Creation_Time, IsDisabled FROM Incidents WHERE IsDisabled=0 ORDER BY id DESC;";

        conn.Open();
        var Command = new SqlCommand(sqlRead, conn);
        var reader = Command.ExecuteReader();

        if (reader.HasRows)
        {
            while (reader.Read() && (iterator < 25))
            {
                incidentList[iterator] = new Incident(reader.GetInt32(0), reader.GetInt32(1), reader.GetInt32(2), reader.GetString(3), reader.GetString(4),
                  reader.GetString(5), reader.GetInt32(6), reader.GetInt32(7), reader.GetInt32(8), reader.GetDateTime(9), reader.GetBoolean(10));
                iterator++;
            }
        }
        
        conn.Close();

        return Ok(incidentList);
    }

    [HttpPost(Name = "CreateIncident")]
    public IActionResult CreateIncident([FromBody] Incident incident)
    {
        var conn = new SqlConnection(KonstantenSIMS.DbConnectionStringBuilder);
        var SQLInsert = "INSERT INTO Incidents (OwnerID, CreatorID, Title, API_Text,Creation_Time,Severity,Status,Notes_Text,ConclusionID,IsDisabled) VALUES (" +
        "@Owner, @Creator, @Title, @API_Text, @TimeNow, @Severity, @Status, @Notes, @Conclusio, @IsItDisabled);";
        
        
        conn.Open();
        var Command = new SqlCommand(SQLInsert, conn);

        Command.Parameters.Add("@Owner", SqlDbType.Int);
        Command.Parameters["@Owner"].Value = incident.Owner;
        Command.Parameters.Add("@Creator", SqlDbType.Int);
        Command.Parameters["@Creator"].Value = incident.Creator;
        Command.Parameters.Add("@Title", SqlDbType.VarChar);
        Command.Parameters["@Title"].Value = incident.Title;
        Command.Parameters.Add("@API_Text", SqlDbType.VarChar);
        Command.Parameters["@API_Text"].Value = incident.APIText;
        Command.Parameters.Add("@TimeNow", SqlDbType.DateTime);
        Command.Parameters["@TimeNow"].Value = DateTime.Now;
        Command.Parameters.Add("@Severity", SqlDbType.Int);
        Command.Parameters["@Severity"].Value = incident.Severity;
        Command.Parameters.Add("@Status", SqlDbType.Int);
        Command.Parameters["@Status"].Value = incident.Status;
        Command.Parameters.Add("@Notes", SqlDbType.VarChar);
        Command.Parameters["@Notes"].Value = incident.NotesText;
        Command.Parameters.Add("@Conclusio", SqlDbType.Int);
        Command.Parameters["@Conclusio"].Value = incident.Conclusion;
        Command.Parameters.Add("@IsItDisabled", SqlDbType.Bit);
        Command.Parameters["@IsItDisabled"].Value = incident.IsDisabled;

        Command.ExecuteNonQuery();
        conn.Close();

        return CreatedAtAction(nameof(CreateIncident), new { id = incident.Id }, incident);
    }

    [HttpDelete(Name = "DisableIncident")]
    public IActionResult DisableIncident([FromBody] int id)
    {
        var conn = new SqlConnection(KonstantenSIMS.DbConnectionStringBuilder);
        var sql = "UPDATE Incidents SET IsDisabled=1 WHERE ID=@ID;";

        conn.Open();
        var Command = new SqlCommand(sql, conn);
        Command.Parameters.Add("@ID", SqlDbType.Int);
        Command.Parameters["@ID"].Value = id;
        int retValue = Command.ExecuteNonQuery();

        conn.Close();
                
        return Ok(retValue);
    }

    [HttpPut("Escalate")]
    public IActionResult Escalate([FromBody] int id, int severity)
    {
        var conn = new SqlConnection(KonstantenSIMS.DbConnectionStringBuilder);
        var sql = "UPDATE Incidents SET Severity=@Severity WHERE ID=@ID;";

        conn.Open();
        var Command = new SqlCommand(sql, conn);
        Command.Parameters.Add("@Severity", SqlDbType.Int);
        Command.Parameters["@Severity"].Value = severity;
        Command.Parameters.Add("@ID", SqlDbType.Int);
        Command.Parameters["@ID"].Value = id;
        int retValue = Command.ExecuteNonQuery();

        conn.Close();
                
        return Ok(retValue);
    }

    [HttpPut("ChangeStatus")]
    public IActionResult ChangeStatus([FromBody] int id, int Status)
    {
        var conn = new SqlConnection(KonstantenSIMS.DbConnectionStringBuilder);
        var sql = "UPDATE Incidents SET Status=@Status WHERE ID=@ID;";

        conn.Open();
        var Command = new SqlCommand(sql, conn);
        Command.Parameters.Add("@Status", SqlDbType.Int);
        Command.Parameters["@Status"].Value = Status;
        Command.Parameters.Add("@ID", SqlDbType.Int);
        Command.Parameters["@ID"].Value = id;
        int retValue = Command.ExecuteNonQuery();

        conn.Close();
                
        return Ok(retValue);
    }

    [HttpPut("ChangeConclusion")]
    public IActionResult ChangeConclusion([FromBody] int id, int ConclusionID)
    {
        var conn = new SqlConnection(KonstantenSIMS.DbConnectionStringBuilder);
        var sql = "UPDATE Incidents SET ConclusionID=@ConclusionID WHERE ID=@ID;";

        conn.Open();
        var Command = new SqlCommand(sql, conn);
        Command.Parameters.Add("@ConclusionID", SqlDbType.Int);
        Command.Parameters["@ConclusionID"].Value = ConclusionID;
        Command.Parameters.Add("@ID", SqlDbType.Int);
        Command.Parameters["@ID"].Value = id;
        int retValue = Command.ExecuteNonQuery();

        conn.Close();
                
        return Ok(retValue);
    }

    [HttpPut("ChangeNotes")]
    public IActionResult ChangeNotes([FromBody] int id, string notes)
    {
        var conn = new SqlConnection(KonstantenSIMS.DbConnectionStringBuilder);
        var sql = "UPDATE Incidents SET Notes_Text=@Notes_Text WHERE ID=@ID";

        conn.Open();
        var Command = new SqlCommand(sql, conn);
        Command.Parameters.Add("@Notes_Text", SqlDbType.VarChar);
        Command.Parameters["@Notes_Text"].Value = notes;
        Command.Parameters.Add("@ID", SqlDbType.Int);
        Command.Parameters["@ID"].Value = id;
        int retValue = Command.ExecuteNonQuery();

        conn.Close();
                
        return Ok(retValue);
    }

    [HttpPut("Assign")]
    public IActionResult Assign([FromBody] int id, int owner)
    {
        var conn = new SqlConnection(KonstantenSIMS.DbConnectionStringBuilder);
        var sql = "UPDATE Incidents SET OwnerID=@OwnerID WHERE ID=@ID";
        //TODO fix sql injection
        conn.Open();
        var Command = new SqlCommand(sql, conn);
        Command.Parameters.Add("@OwnerID", SqlDbType.Int);
        Command.Parameters["@OwnerID"].Value = owner;
        Command.Parameters.Add("@ID", SqlDbType.Int);
        Command.Parameters["@ID"].Value = id;
        int retValue = Command.ExecuteNonQuery();

        conn.Close();

        return Ok(retValue);
    }
    
    [HttpPost("Link")]
    public IActionResult Link([FromBody] int parrentID, int childID)
    {
        var conn = new SqlConnection(KonstantenSIMS.DbConnectionStringBuilder);
        var sql = "INSERT INTO Incident_Links (Main_IncidentID, Sub_IncidentID) VALUES (@parrentID, @childID);";

        conn.Open();
        var Command = new SqlCommand(sql, conn);
        Command.Parameters.Add("@parrentID", System.Data.SqlDbType.Int);
        Command.Parameters["@parrentID"].Value = parrentID;
        Command.Parameters.Add("@childID", System.Data.SqlDbType.Int);
        Command.Parameters["@childID"].Value = childID;
        Command.ExecuteNonQuery();
        conn.Close();
                
        return Ok();
    }

    [HttpGet("Link/{id}")]
    public IActionResult GetLink(int id)
    {
        List<int> children = new List<int>();
        int iterator = 0;
        var conn = new SqlConnection(KonstantenSIMS.DbConnectionStringBuilder);
        var sqlRead = "SELECT Main_IncidentID, Sub_IncidentID FROM Incident_Links;";


        conn.Open();
        var Command = new SqlCommand(sqlRead, conn);
        var reader = Command.ExecuteReader();
        if (reader.HasRows)
        {
            while (reader.Read())
            {
                if (reader.GetInt32(0) == id)
                {
                    children.Add(reader.GetInt32(1));
                    iterator++;
                }
            }
        }

        conn.Close();
        return Ok(children);
    }

    //Existiert für Test und Demonstrationszwecke
    [HttpPost("InserTestInfoIncidents")]
    public async Task<IActionResult> InserTestInfoIncidents()
    {
        for (int iterator = 0; iterator < 30; iterator++)
        {
            CreateIncident(new Incident(0, 1, 1, "Danger Shai Hulud", "{\"text" + "\": \"Shai Hulud has infected Host X\"}", "", 5, 1, 0, DateTime.Now, false));
            CreateIncident(new Incident(0, 1, 1, "Scan", "{\"text" + "\": \"Host X was Scanned\"}", "", 3, 1, 0, DateTime.Now, false));
        }
        return Ok();
    }
}

