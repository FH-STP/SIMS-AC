namespace sims.Models
{

    public class LoginRequest
    {
        public LoginRequest(String userName, String password)
        {
            UserName = userName;
            Password = password;
        }
        public int? ID { get; set; }
        public string? UserName { get; set; }
        public string? Password { get; set; }
    }
}
