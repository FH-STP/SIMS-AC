namespace sims.Models
{

    public class Conclusion
    {
        
        public Conclusion(int conclusionID, string text, bool truePositiv, bool informational)
        {
            ConclusionID = conclusionID;
            Text = text;
            TruePositiv = truePositiv;
            Informational = informational;
        }

        public int ConclusionID { get; set; }
        public string Text { get; set; }
        public bool TruePositiv { get; set; }
        public bool Informational { get; set; }
    }
}
