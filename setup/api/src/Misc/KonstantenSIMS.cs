using System.Data.Common;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using Microsoft.IdentityModel.Tokens;

namespace sims.Misc
{

    public class KonstantenSIMS
    {
        public const String DbConnectionStringBuilder1 = "Data Source=localhost,1433;Initial Catalog=SIMS;User Id=sa;Password="; //Hier bitte localhost für Unittest eintragen   sql-db     
        public const String DbConnectionStringBuilder2 = ";Encrypt=False;";
        public static String DbConnectionStringBuilder()
        {
            try
            {
                string? sqlConnectionString = Environment.GetEnvironmentVariable("SQL_CONNECTION_STRING");
                if (sqlConnectionString.IsNullOrEmpty())
                {
                    throw new Exception("Env var not set.");
                }
                return sqlConnectionString;
            }
            catch
            {
                /// Hier Pfad für Unit Test tauschen
                return DbConnectionStringBuilder1 + ReadEnvValue("/home/michael-leonhartsberger/MegaProjekt/SIMS-AC/.env", "SQL_PASSWORD") + DbConnectionStringBuilder2;
            }
        }


        public const String uri1 = "mongodb://";
        public const String uri2 = "@localhost:27017/admin";

        public static String uri()
        {
            try
            {
                string? sqlConnectionString = Environment.GetEnvironmentVariable("MONGO_CONNECTION_STRING");
                if (sqlConnectionString.IsNullOrEmpty())
                {
                    throw new Exception("Env var not set.");
                }
                return sqlConnectionString;
            }
            catch
            {
                /// Hier Pfad für Unit Test tauschen
                return DbConnectionStringBuilder1 + ReadEnvValue("/home/michael-leonhartsberger/MegaProjekt/SIMS-AC/.env", "MONGO_USER") + ":" + ReadEnvValue("/home/michael-leonhartsberger/MegaProjekt/SIMS-AC/.env", "MONGO_PASSWORD") + DbConnectionStringBuilder2;
            }
        }
        
        public static string? ReadEnvValue(string envFilePath, string key, bool ignoreCase = true)
        {
            if (string.IsNullOrWhiteSpace(envFilePath)) 
                throw new ArgumentException("envFilePath darf nicht leer sein.", nameof(envFilePath));
            if (!File.Exists(envFilePath))
                throw new FileNotFoundException("Die .env-Datei wurde nicht gefunden.", envFilePath);

            var comparison = ignoreCase ? StringComparison.OrdinalIgnoreCase : StringComparison.Ordinal;

            foreach (var rawLine in File.ReadAllLines(envFilePath))
            {
                if (string.IsNullOrWhiteSpace(rawLine))
                    continue;

                var line = rawLine.Trim();

                // Kommentare überspringen (Zeilen, die mit # oder ; beginnen)
                if (line.StartsWith("#") || line.StartsWith(";"))
                    continue;

                // Schlüssel=Wert; nur am ersten '=' aufteilen (Wert kann '=' enthalten)
                var idx = line.IndexOf('=');
                if (idx <= 0) // kein '=' oder kein Schlüssel
                    continue;

                var k = line.Substring(0, idx).Trim();
                var v = line.Substring(idx + 1).Trim();

                if (string.Equals(k, key, comparison))
                {
                    // Entferne umgebende Anführungszeichen (einfacher Ansatz)
                    if ((v.StartsWith("\"") && v.EndsWith("\"")) || (v.StartsWith("'") && v.EndsWith("'")))
                    {
                        v = v.Substring(1, v.Length - 2);
                    }

                    // Entkomme Zeichen wie \n, \r falls nötig (optional)
                    v = Regex.Unescape(v);

                    return v;
                }
            }

            return null;
        }
    }
}
