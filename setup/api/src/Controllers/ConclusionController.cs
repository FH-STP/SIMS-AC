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
        try
        {
            String conclusio = ConclusionInfo(id);
            return Ok(conclusio);
        }
        catch
        {
            return BadRequest("Check API for more Info!");
        }
    }

    public static string ConclusionInfo(int id)
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
        return conclusion;
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
        var SQLInsert = "INSERT INTO Conclusion_Definitions (Text, IsTruePositive, IsInformational) VALUES (@Text, @IsTruePositive, @IsInformational);";

        conn.Open();
        var Command = new SqlCommand(SQLInsert, conn);
        Command.Parameters.Add("@Text", System.Data.SqlDbType.VarChar);
        Command.Parameters["@Text"].Value = conclusion.Text;
        Command.Parameters.Add("@IsTruePositive", System.Data.SqlDbType.Bit);
        Command.Parameters["@IsTruePositive"].Value = IsTruePositive;
        Command.Parameters.Add("@IsInformational", System.Data.SqlDbType.Bit);
        Command.Parameters["@IsInformational"].Value = IsInformational;
        Command.ExecuteNonQuery();
        conn.Close();

        Logging.loglog(0, "Creating conclusion: "+conclusion.Text); 
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
