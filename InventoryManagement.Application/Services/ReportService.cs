using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using InventoryManagement.Application.Common.Interfaces;
using InventoryManagement.Domain.Interfaces;
using InventoryManagement.Application.Dtos;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Application.Services
{
    public class ReportService : IReportService
    {
        private readonly IUnitOfWork _uow;

        public ReportService(IUnitOfWork uow)
        {
            _uow = uow;
        }

        public async Task<List<LowStockAlertDto>> GetLowStockAlertsAsync()
        {
            var lowStocks = await _uow.ProductStocks.Query()
                .Include(ps => ps.Product)
                .Include(ps => ps.Warehouse)
                .Where(ps => ps.Quantity <= ps.MinQuantity)
                .Select(ps => new LowStockAlertDto
                {
                    ProductId = ps.ProductId,
                    ProductName = ps.Product.Name,
                    SKU = ps.Product.SKU,
                    WarehouseId = ps.WarehouseId,
                    WarehouseName = ps.Warehouse.Name,
                    CurrentQuantity = ps.Quantity,
                    MinQuantity = ps.MinQuantity
                })
                .ToListAsync();

            return lowStocks;
        }

        public async Task<List<ValuationReportDto>> GetInventoryValuationAsync()
        {
            var valuations = await _uow.ProductStocks.Query()
                .Include(ps => ps.Product)
                .Include(ps => ps.Warehouse)
                .GroupBy(ps => new { ps.WarehouseId, ps.Warehouse.Name })
                .Select(g => new ValuationReportDto
                {
                    WarehouseId = g.Key.WarehouseId,
                    WarehouseName = g.Key.Name,
                    TotalValue = g.Sum(ps => ps.Quantity * ps.Product.PurchasePrice),
                    TotalItems = g.Sum(ps => ps.Quantity)
                })
                .ToListAsync();

            return valuations;
        }

        public async Task<List<AbcAnalysisDto>> GetAbcAnalysisAsync()
        {
            // Group by product globally
            var productTotals = await _uow.ProductStocks.Query()
                .Include(ps => ps.Product)
                .GroupBy(ps => new { ps.ProductId, ps.Product.Name, ps.Product.SKU, ps.Product.PurchasePrice })
                .Select(g => new
                {
                    ProductId = g.Key.ProductId,
                    ProductName = g.Key.Name,
                    SKU = g.Key.SKU,
                    PurchasePrice = g.Key.PurchasePrice,
                    TotalQuantity = g.Sum(ps => ps.Quantity),
                    TotalValue = g.Sum(ps => ps.Quantity) * g.Key.PurchasePrice
                })
                .Where(p => p.TotalQuantity > 0)
                .OrderByDescending(p => p.TotalValue)
                .ToListAsync();

            var totalInventoryValue = productTotals.Sum(p => p.TotalValue);
            
            var results = new List<AbcAnalysisDto>();
            decimal cumulativeValue = 0;

            foreach (var item in productTotals)
            {
                cumulativeValue += item.TotalValue;
                decimal cumulativePercentage = totalInventoryValue > 0 ? (cumulativeValue / totalInventoryValue) * 100 : 0;

                string classification = "C";
                if (cumulativePercentage <= 80)
                    classification = "A";
                else if (cumulativePercentage <= 95)
                    classification = "B";

                results.Add(new AbcAnalysisDto
                {
                    ProductId = item.ProductId,
                    ProductName = item.ProductName,
                    SKU = item.SKU,
                    TotalQuantity = item.TotalQuantity,
                    PurchasePrice = item.PurchasePrice,
                    TotalValue = item.TotalValue,
                    Classification = classification,
                    CumulativeValuePercentage = cumulativePercentage
                });
            }

            return results;
        }
    }
}
