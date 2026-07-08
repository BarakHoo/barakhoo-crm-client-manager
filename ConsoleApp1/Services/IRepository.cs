using ConsoleApp1.Models;

namespace ConsoleApp1.Services;

public interface IRepository
{
    IList<Client> GetAll();
    Client? Get(System.Guid id);
    void Add(Client client);
    void Update(Client client);
    void Delete(System.Guid id);
    IList<Client> Search(string term);
    void Save();
}
