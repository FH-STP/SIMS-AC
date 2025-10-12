namespace sims.Models
{

    public class Incident
    {
        public Incident(int id, int owner, int creator, string title, string apiText,
                  string notesText, int severity, int conclusion, int status, DateTime creationTime,Boolean isDisabled)
    {
        Id = id;
        Owner = owner;
        Creator = creator;
        Title = title;
        APIText = apiText;
        NotesText = notesText;
        Severity = severity;
        Conclusion = conclusion;
        Status = status;
        CreationTime = creationTime;
        IsDisabled = isDisabled;
    }

        public int Id { get; set; } // Wird überschrieben und ist in der Klasse wegen dem Return
        public int Owner { get; set; }
        public int Creator { get; set; }
        public string Title { get; set; }
        public string APIText { get; set; }
        public string NotesText { get; set; }
        public int Severity { get; set; }
        public int Conclusion { get; set; }
        public int Status { get; set; }
        public DateTime CreationTime { get; set; }
        public Boolean IsDisabled { get; set; }

    }
}
