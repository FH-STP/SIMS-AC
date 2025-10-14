using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using sims.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Data.SqlClient;
using sims.Misc;

namespace sims.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize]
public class ConclusionController : ControllerBase
{

    [HttpGet("GetConclusionInfo/{id}")]
    public IActionResult GetConclusionInfo(int id)
    {
        var conn = new SqlConnection(KonstantenSIMS.DbConnectionStringBuilder);
        var sqlRead = "SELECT Conclusion_ID, Text, IsTruePositive, IsInformational FROM Conclusion_Definitions";

        conn.Open();
        var Command = new SqlCommand(sqlRead, conn);
        var reader = Command.ExecuteReader();

        String conclusion = "";
        if (reader.HasRows)
        {
            while (reader.Read())
            {
                if (reader.GetInt32(0) == id)
                {
                    conclusion = reader.GetInt32(0) + " " + reader.GetString(1) + " " + reader.GetBoolean(2) + " " + reader.GetBoolean(3) + " ";
                }
            }
        }

        conn.Close();

        return Ok(conclusion);
    }

    [HttpPost("InsertConclusions")]
    public async Task<IActionResult> InsertConclusions([FromBody] Conclusion conclusion)
    {
        new Conclusion(0, "True Positiv - Malware", true, false);
        var conn = new SqlConnection(KonstantenSIMS.DbConnectionStringBuilder);
        String IsTruePositive = "0";
        if (conclusion.IsTruePositive)
        {
            IsTruePositive = "1";
        }
        String IsInformational = "0";
        if (conclusion.IsInformational)
        {
            IsInformational = "1";
        }
        var SQLInsert = "INSERT INTO Conclusion_Definitions (Text, IsTruePositive, IsInformational) VALUES ('" +
        conclusion.Text + "', " + IsTruePositive + ", " + IsInformational + ");";


        conn.Open();
        var Command = new SqlCommand(SQLInsert, conn);
        Command.ExecuteNonQuery();
        conn.Close();

        return CreatedAtAction(nameof(InsertConclusions), new { id = conclusion.ConclusionID }, conclusion);
    }
    
    /*[HttpPost("InsertSampleConclusions")]
    public async Task<IActionResult> InsertSampleConclusions()
    {
        await InsertConclusions(new Conclusion(0, "System - Empty", false, false));
        await InsertConclusions(new Conclusion(0, "False Positiv", false, false));
        await InsertConclusions(new Conclusion(0, "False Positiv - Info", false, true));
        await InsertConclusions(new Conclusion(0, "True Positiv - Scan", true, true));
        await InsertConclusions(new Conclusion(0, "True Positiv - Info", true, true));
        await InsertConclusions(new Conclusion(0, "True Positiv - Malware", true, false));
        return Ok();
    }*/

}
