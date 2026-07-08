namespace ConsoleApp1.Models;

public enum CallStatus
{
    New,
    Contacted,
    Interested,
    NotInterested,
    DoNotCall
}

public class Client
{
    public System.Guid Id { get; set; } = System.Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public System.DateTime? LastContact { get; set; }
    public string Notes { get; set; } = string.Empty;
    public CallStatus Status { get; set; } = CallStatus.New;

    public override string ToString()
    {
        var last = LastContact.HasValue ? LastContact.Value.ToString("yyyy-MM-dd") : "never";
        return $"{Name} ({Company}) | {Phone} | {Email} | Status: {Status} | Last: {last}";
    }
}
