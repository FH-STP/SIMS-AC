namespace sims.Models
{

    public class User
    {
        public User(int id, String userName, String password, String telephone, String eMail, Boolean isAdmins)
        {
            Id = id;
            UserName = userName;
            Password = password;
            Telephone = telephone;
            EMail = eMail;
            isAdmin = isAdmins;

        }

        public int Id { get; set; } // Wird überschrieben und ist in der Klasse wegen dem Return
        public string UserName { get; set; }
        public string Password { get; set; }
        public string Telephone { get; set; }
        public string EMail { get; set; }
        public Boolean isAdmin { get; set; }


    }
}
