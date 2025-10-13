namespace sims.Models
{
    using System;
    using System.Text.Json;
    using System.Text.Json.Serialization;

    public class User
    {

        public User() { }

        public User(int id1, String userName1, String password1, String telephone1, String eMail1, Boolean isAdmins1)
        {
            this.Id = id1;
            this.UserName = userName1;
            this.Password = password1;
            this.Telephone = telephone1;
            this.EMail = eMail1;
            this.isAdmin = isAdmins1;

        }


        public int Id { get; set; } // Wird überschrieben und ist in der Klasse wegen dem Return
        public string UserName { get; set; }
        public string Password { get; set; }
        public string Telephone { get; set; }
        public string EMail { get; set; }
        public Boolean isAdmin { get; set; }


    }
}
