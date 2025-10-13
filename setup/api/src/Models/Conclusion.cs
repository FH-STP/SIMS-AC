namespace sims.Models
{

    public class Conclusion
    {
        
        public Conclusion(int conclusionID, string text, bool isTruePositive, bool isInformational)
        {
            ConclusionID = conclusionID;
            Text = text;
            IsTruePositive = isTruePositive;
            IsInformational = isInformational;
        }

        public int ConclusionID { get; set; }
        public string Text { get; set; }
        public bool IsTruePositive { get; set; }
        public bool IsInformational { get; set; }
    }
}
