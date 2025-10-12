using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Dapper;
using sims.Misc;
using sims.Models;
using sims.Services;
using Microsoft.AspNetCore.Authorization;
using NSec.Cryptography;


namespace sims.Controllers;

[ApiController]
[Route("[controller]")]
//[Authorize]
public class UserController : ControllerBase
{

    /*private readonly JwtService JwtService;

    public UserController(JwtService jwtService)
    {
        JwtService = jwtService;
    }*/

     
    [AllowAnonymous]
    [HttpPost(Name = "CreateUser")]
    public IActionResult CreateUser([FromBody] User user)
    {
        Random rnd = new Random();
        var argon2Hasher = getArgon2idHasher();
        String str = "ABCDEF0123456789";
        int size = 32;
        String salt = "";
        for (int i = 0; i < size; i++)
        {
            int x = rnd.Next(str.Length);
            salt = salt + str[x];
        }
        //TODO Authentication + Password Strenght check
        var conn = new SqlConnection(KonstantenSIMS.DbConnectionStringBuilder);
        var PWHash = argon2Hasher.DeriveBytes(user.Password, Convert.FromHexString(salt), 256);
        String isAdmin = "0";
        if (user.isAdmin)
        {
            isAdmin = "1";
        }
        var SQLInsert = "INSERT INTO Users (Username, PasswordHash, PasswordSalt, Is_Admin, Telephone,EMail) VALUES ('" + user.UserName + "', '" + Convert.ToHexString(PWHash) + "', '" + salt + "', " + isAdmin + " , '" + user.Telephone +"', '" + user.EMail +  "');";
        
        
        conn.Open();
        var Command = new SqlCommand(SQLInsert, conn);
        Command.ExecuteNonQuery();
        conn.Close();
            
        return Ok();
    }

    [AllowAnonymous]
    [HttpPost("Login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest loginRequest)
    {
        //TODO Move Authentication
        
        /*var Tesult = await JwtService.Authenticate(loginRequest);
        if(Tesult is null)
        {
            return Unauthorized();
        }*/

        return BadRequest();
    }

    [HttpPut(Name = "ChangePassword")]
    public IActionResult ChangePassword([FromBody] PasswordChange passwordChange)
    {
        //TODO Auth???
        Random rnd = new Random();
        var argon2Hasher = getArgon2idHasher();
        var conn = new SqlConnection(KonstantenSIMS.DbConnectionStringBuilder);

        //Veryfy Password
        Boolean correctPw = verifyPW(passwordChange.id, passwordChange.PasswordOld);
        

        if (correctPw)
        {
            //Update Password
            var salt = Convert.ToString(rnd.Next(0, 999999999));
            var PWHash = argon2Hasher.DeriveBytes(passwordChange.PasswordNew, Convert.FromHexString(salt), 256);
            var sql = "UPDATE Users SET PasswordHash=" + Convert.ToHexString(PWHash) + ", PasswordSalt=" + salt + " WHERE ID=" + Convert.ToString(passwordChange.id);


            conn.Open();
            var Command = new SqlCommand(sql, conn);
            Command.ExecuteNonQuery();
            conn.Close();

            return Ok();
        }
        else
        {
            return Unauthorized();
        }
    }

    [HttpDelete(Name = "DisableUser")]
    public IActionResult DisableUser([FromBody] int id)
    {
        var conn = new SqlConnection(KonstantenSIMS.DbConnectionStringBuilder);
        var sql = "UPDATE Users SET IsDisabled=1 WHERE ID="+Convert.ToString(id);
        //TODO Authentication + Prevention of SQL injection

        conn.Open();
        var Command = new SqlCommand(sql, conn);
        Command.ExecuteNonQuery();
        conn.Close();
        
        //return BadRequest();
        return Accepted();
        //return NoContent();
    }

    [HttpGet("GetUserInfo/{id}")]
    public IActionResult GetUserInfo(int id)
    {
        var conn = new SqlConnection(KonstantenSIMS.DbConnectionStringBuilder);
        var sqlRead = "SELECT ID, Username, EMail, Telephone, IsDisabled FROM Users";
        //TODO Authentication

        conn.Open();
        var Command = new SqlCommand(sqlRead, conn);
        var reader = Command.ExecuteReader();

        String users = "";
        if (reader.HasRows)
        {
            while (reader.Read())
            {
                if (reader.GetInt32(0) == id)
                {
                    users = reader.GetInt32(0) + " " + reader.GetString(1) + " " + reader.GetString(2) + " " + reader.GetString(3) + " " + reader.GetBoolean(4);
                }
            }
        }

        conn.Close();

        return Ok(users);
    }

    private Boolean verifyPW(int id, string password)
    {
        Random rnd = new Random();
        var argon2Hasher = getArgon2idHasher();
        var conn = new SqlConnection(KonstantenSIMS.DbConnectionStringBuilder);

        //Veryfy Password
        Boolean isPWCorrect = false;
        var sqlRead = "SELECT ID, Username, PasswordHash, PasswordSalt FROM Users";
        conn.Open();
        var CommandReader = new SqlCommand(sqlRead, conn);
        var reader = CommandReader.ExecuteReader();
        conn.Close();

        if (reader.HasRows)
        {
            while (reader.Read())
            {
                if (reader.GetInt32(0) == id)
                {
                    if (reader.GetString(2) ==
                    Convert.ToHexString(argon2Hasher.DeriveBytes(password, Convert.FromHexString(reader.GetString(3)), 256)))
                    {
                        isPWCorrect = true;
                    }
                }
            }
        }
        return isPWCorrect;
    }
    
    private Argon2id getArgon2idHasher()
    {
        var argon2Parameters = new Argon2Parameters { DegreeOfParallelism = 1, MemorySize = 64 * 1024, NumberOfPasses = 5 };
        return PasswordBasedKeyDerivationAlgorithm.Argon2id(argon2Parameters);
    }


    [HttpPost("Debug")]
    public async Task<IActionResult> Debug([FromBody] int i)
    {
        //TODO
        if (i == 1)
        {
            Random rnd = new Random();
            var argon2Hasher = getArgon2idHasher();
            var PWHash = argon2Hasher.DeriveBytes("pass", Convert.FromHexString("00112233445566778899AABBCCDDEEFF"), 256);


            await using var conn = new SqlConnection(KonstantenSIMS.DbConnectionStringBuilder);
            var SQLInsert = "INSERT INTO Users (Username, PasswordHash, PasswordSalt, Is_Admin) VALUES ('niklas" + Convert.ToString(rnd.Next(0, 9)) + "', '" + Convert.ToHexString(PWHash) + "', '" + "SALT" + "', 1);";
            var sqlRead = "SELECT ID, Username, PasswordHash, PasswordSalt FROM Users";
            conn.Open();
            var Command = new SqlCommand(SQLInsert, conn);
            Command.ExecuteNonQuery();

            Command = new SqlCommand(sqlRead, conn);
            var reader = Command.ExecuteReader();
            String Users = "";
            if (reader.HasRows)
            {
                while (reader.Read())
                {
                    Users = Users + " " + reader.GetInt32(0) + " " + reader.GetString(1) + " " + reader.GetString(2) + " " + reader.GetString(3);
                }
            }
            conn.Close();
            return Ok(Users);
        }
        else
        {
            return BadRequest();
        }
    }
    

    [HttpPost("InserTestInfoUser")]
    public async Task<IActionResult> InserTestInfoUser()
    {
        CreateUser(new User(0, "admin", "Admin123!", "+43 858 651 5050", "admin@mail.com", true));
        CreateUser(new User(0, "michael", "Administrator1234567890!", "+43 867 5309", "michael@mail.com", true));
        CreateUser(new User(0, "laura", "admin", "+43 605 475 6968", "laura@mail.com", false));
        CreateUser(new User(0, "sebastian", "htl", "+43 42 420 666", "sebastian@mail.com", false));
        CreateUser(new User(0, "niklas", "??????", "+43 354 354 354", "niklas@mail.com", false));
        return Ok();
    }
}
