using System.Threading.Tasks;

namespace InventoryManagement.Application.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string htmlBody);
        string GenerateEmailTemplate(string title, string content, string ctaText = null, string ctaLink = null);
    }
}
