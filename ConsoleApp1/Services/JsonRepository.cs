using System.Text.Json;
using ConsoleApp1.Models;

namespace ConsoleApp1.Services;

public class JsonRepository : IRepository
{
    private readonly string _filePath;
    private readonly List<Client> _clients;
    private readonly JsonSerializerOptions _opts = new() { WriteIndented = true, PropertyNameCaseInsensitive = true };

    public JsonRepository(string filePath)
    {
        _filePath = filePath;
        if (File.Exists(_filePath))
        {
            try
            {
                var txt = File.ReadAllText(_filePath);
                _clients = JsonSerializer.Deserialize<List<Client>>(txt, _opts) ?? new List<Client>();
            }
            catch
            {
                _clients = new List<Client>();
            }
        }
        else
        {
            _clients = new List<Client>();
            Save();
        }
    }

    public IList<Client> GetAll() => _clients;

    public Client? Get(System.Guid id) => _clients.FirstOrDefault(c => c.Id == id);

    public void Add(Client client)
    {
        _clients.Add(client);
        Save();
    }

    public void Update(Client client)
    {
        var idx = _clients.FindIndex(c => c.Id == client.Id);
        if (idx >= 0)
        {
            _clients[idx] = client;
            Save();
        }
    }

    public void Delete(System.Guid id)
    {
        _clients.RemoveAll(c => c.Id == id);
        Save();
    }

    public IList<Client> Search(string term)
    {
        if (string.IsNullOrWhiteSpace(term)) return GetAll();
        term = term.ToLowerInvariant();
        return _clients.Where(c => (c.Name ?? string.Empty).ToLowerInvariant().Contains(term)
                                || (c.Company ?? string.Empty).ToLowerInvariant().Contains(term)
                                || (c.Phone ?? string.Empty).Contains(term)
                                || (c.Email ?? string.Empty).ToLowerInvariant().Contains(term)).ToList();
    }

    public void Save()
    {
        var txt = JsonSerializer.Serialize(_clients, _opts);
        File.WriteAllText(_filePath, txt);
    }
}
