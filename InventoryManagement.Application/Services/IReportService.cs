using System.Collections.Generic;
using System.Threading.Tasks;
using InventoryManagement.Application.Dtos;

namespace InventoryManagement.Application.Services
{
    public interface IReportService
    {
        Task<List<LowStockAlertDto>> GetLowStockAlertsAsync();
        Task<List<ValuationReportDto>> GetInventoryValuationAsync();
        Task<List<AbcAnalysisDto>> GetAbcAnalysisAsync();
    }
}
