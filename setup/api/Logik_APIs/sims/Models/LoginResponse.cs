namespace sims.Models
{

    public class LoginResponse
    {
        public int? ID { get; set; }
        public string? UserName { get; set; }
        public string? AccessToken { get; set; }
        public int ExpiresIn { get; set; }
    }
}
