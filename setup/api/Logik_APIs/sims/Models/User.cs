namespace sims.Models
{

    public class User
    {
        public User(int id, String userName, String password)
        {
            Id = id;
            UserName = userName;
            Password = password;
        }

        public int Id { get; set; } // Wird überschrieben und ist in der Klasse wegen dem Return
        public string UserName { get; set; }
        public string Password { get; set; }
    }
}
