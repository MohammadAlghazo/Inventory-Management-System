namespace InventoryManagement.Application.Dtos
{
    public class AuditLogDto
    {
        public int Id { get; set; }
        public string? Username { get; set; }
        public string Action { get; set; } = string.Empty;
        public string Module { get; set; } = string.Empty;
        public string Details { get; set; } = string.Empty;
        public string? IpAddress { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public class AuditLogQueryParams
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string? Search { get; set; }
    }
}
