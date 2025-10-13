using System.Data.Common;

namespace sims.Misc
{

    public class KonstantenSIMS
    {
        public const String DbConnectionStringBuilder = "Data Source=sql-db,1433;Initial Catalog=SIMS;User Id=sa;Password=YourStrong!SQLPa55word;Encrypt=False;"; //"Server=localhost:1433;Database=SIMS;Uid=sa;Pwd=YourStrong!SQLPa55word;"; //TODO secrets auslagern
        public const String uri = "mongodb://simsadmin:YourStrong!MongoPa55word@localhost:27017/adminconfiglocal";
    }
}
