using sims.Misc;
using Microsoft.Data.SqlClient;
namespace sims.Controllers;



public class Logging
{

     public static void loglog(int LogLevel, String TextMessage)
    {
        var conn = new SqlConnection(KonstantenSIMS.DbConnectionStringBuilder());
        var sql = "INSERT INTO LogsSIMS (LogLevel, TextMessage) VALUES (@LogLevel, @TextMessage);";

        conn.Open();
        var Command = new SqlCommand(sql, conn);
        Command.Parameters.Add("@LogLevel", System.Data.SqlDbType.Int);
        Command.Parameters["@LogLevel"].Value = LogLevel;
        Command.Parameters.Add("@TextMessage", System.Data.SqlDbType.VarChar);
        Command.Parameters["@TextMessage"].Value = TextMessage;
        int Result = Command.ExecuteNonQuery();
        conn.Close();
    }

}