using InventoryManagement.Application.Services;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace InventoryManagement.Infrastructure.Services
{
    public class GoogleAppsScriptEmailService : IEmailService
    {
        private readonly HttpClient _httpClient;
        private readonly string _scriptUrl;
        private readonly ILogger<GoogleAppsScriptEmailService> _logger;

        public GoogleAppsScriptEmailService(HttpClient httpClient, IConfiguration configuration, ILogger<GoogleAppsScriptEmailService> logger)
        {
            _httpClient = httpClient;
            _scriptUrl = configuration["EmailSettings:GoogleAppsScriptUrl"];
            _logger = logger;
        }

        public async Task SendEmailAsync(string to, string subject, string htmlBody)
        {
            if (string.IsNullOrEmpty(_scriptUrl))
            {
                _logger.LogWarning("Email sending failed. GoogleAppsScriptUrl is not configured.");
                return;
            }

            var payload = new
            {
                to = to,
                subject = subject,
                htmlBody = htmlBody
            };

            var jsonPayload = JsonSerializer.Serialize(payload);
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(_scriptUrl, content);
            var responseString = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError($"Failed to send email. Google Apps Script responded with: {response.StatusCode} - {responseString}");
            }
            else
            {
                _logger.LogInformation($"Email successfully sent to {to}");
            }
        }

        public string GenerateEmailTemplate(string title, string content, string ctaText = null, string ctaLink = null)
        {
            var ctaHtml = "";
            if (!string.IsNullOrEmpty(ctaText) && !string.IsNullOrEmpty(ctaLink))
            {
                ctaHtml = $@"
                <div style=""text-align: center; margin-top: 30px;"">
                    <a href=""{ctaLink}"" style=""background-color: #d2593b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;"">
                        {ctaText}
                    </a>
                </div>";
            }

            return $@"
            <div style=""font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background-color: #ffffff;"">
                <div style=""background-color: #0f1c18; padding: 25px; text-align: center;"">
                    <h1 style=""color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;"">STOCK<span style=""color: #d2593b;"">MASTER</span></h1>
                </div>
                <div style=""padding: 30px 25px; color: #333333; line-height: 1.6;"">
                    <h2 style=""color: #1c2d27; margin-top: 0;"">{title}</h2>
                    <p style=""font-size: 16px; margin-bottom: 20px;"">{content}</p>
                    {ctaHtml}
                </div>
                <div style=""background-color: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 12px; border-top: 1px solid #e0e0e0;"">
                    <p style=""margin: 0;"">&copy; {System.DateTime.UtcNow.Year} StockMaster Inventory Management. All rights reserved.</p>
                    <p style=""margin: 5px 0 0 0;"">This is an automated message, please do not reply directly.</p>
                </div>
            </div>";
        }
    }
}
