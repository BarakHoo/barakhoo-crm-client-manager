using ConsoleApp1.Models;
using ConsoleApp1.Services;

var dataFile = Path.Combine(AppContext.BaseDirectory, "clients.json");
IRepository repo = new JsonRepository(dataFile);

while (true)
{
    Console.WriteLine();
    Console.WriteLine("Simple CRM - Cold Calls");
    Console.WriteLine("1) Add client");
    Console.WriteLine("2) List clients");
    Console.WriteLine("3) Search clients");
    Console.WriteLine("4) Update client status/notes");
    Console.WriteLine("5) Delete client");
    Console.WriteLine("6) Exit");
    Console.Write("Select: ");
    var sel = Console.ReadLine();
    Console.WriteLine();
    if (sel == "1")
    {
        var c = new Client();
        Console.Write("Name: "); c.Name = Console.ReadLine() ?? string.Empty;
        Console.Write("Company: "); c.Company = Console.ReadLine() ?? string.Empty;
        Console.Write("Phone: "); c.Phone = Console.ReadLine() ?? string.Empty;
        Console.Write("Email: "); c.Email = Console.ReadLine() ?? string.Empty;
        Console.Write("Notes: "); c.Notes = Console.ReadLine() ?? string.Empty;
        repo.Add(c);
        Console.WriteLine("Client added.");
    }
    else if (sel == "2")
    {
        var list = repo.GetAll();
        if (list.Count == 0) Console.WriteLine("No clients.");
        foreach (var c in list)
        {
            Console.WriteLine($"{c.Id} - {c}");
        }
    }
    else if (sel == "3")
    {
        Console.Write("Search term: ");
        var term = Console.ReadLine() ?? string.Empty;
        var results = repo.Search(term);
        foreach (var c in results)
            Console.WriteLine($"{c.Id} - {c}");
    }
    else if (sel == "4")
    {
        Console.Write("Client Id: ");
        var idTxt = Console.ReadLine();
        if (Guid.TryParse(idTxt, out var id))
        {
            var client = repo.Get(id);
            if (client == null) { Console.WriteLine("Not found."); }
            else
            {
                Console.WriteLine(client);
                Console.WriteLine("Status options: New, Contacted, Interested, NotInterested, DoNotCall");
                Console.Write("New status (leave empty to keep): ");
                var st = Console.ReadLine();
                if (!string.IsNullOrWhiteSpace(st) && Enum.TryParse<CallStatus>(st, out var newStatus))
                    client.Status = newStatus;
                Console.Write("Notes (append): ");
                var notes = Console.ReadLine();
                if (!string.IsNullOrWhiteSpace(notes))
                {
                    client.Notes = string.IsNullOrWhiteSpace(client.Notes) ? notes : client.Notes + "\n" + notes;
                }
                client.LastContact = DateTime.Now;
                repo.Update(client);
                Console.WriteLine("Client updated.");
            }
        }
        else Console.WriteLine("Invalid id.");
    }
    else if (sel == "5")
    {
        Console.Write("Client Id to delete: ");
        var idTxt = Console.ReadLine();
        if (Guid.TryParse(idTxt, out var id))
        {
            repo.Delete(id);
            Console.WriteLine("Deleted (if existed).");
        }
        else Console.WriteLine("Invalid id.");
    }
    else if (sel == "6")
    {
        break;
    }
    else
    {
        Console.WriteLine("Unknown option.");
    }
}

