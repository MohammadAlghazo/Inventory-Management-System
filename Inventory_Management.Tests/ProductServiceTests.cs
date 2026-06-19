using FluentAssertions;
using Inventory_Management._DbContext;
using Inventory_Management.Dtos.Product_Dtos;
using Inventory_Management.Models;
using Inventory_Management.Services;
using Microsoft.EntityFrameworkCore;

namespace Inventory_Management.Tests
{
    public class ProductServiceTests
    {
        private async Task<AppDbContext> GetDbContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            var context = new AppDbContext(options);
            await context.Database.EnsureCreatedAsync();
            return context;
        }

        [Fact]
        public async Task CreateProductAsync_ShouldAddProductAndReturnSuccess()
        {
            
            var context = await GetDbContext();
            // Seed a category so it exists
            var category = new Category { Name = "Test Category" };
            context.Categories.Add(category);
            await context.SaveChangesAsync();

            var service = new ProductService(context);
            var dto = new CreateProductDto
            {
                Name = "Test Product",
                Price = 100,
                Quantity = 10,
                MinQuantity = 5,
                CategoryId = category.Id
            };

            var response = await service.CreateAsync(dto);

            response.Success.Should().BeTrue();
            response.Message.Should().Be("Product created successfully");

            var productInDb = await context.Products.FirstOrDefaultAsync();
            productInDb.Should().NotBeNull();
            productInDb!.Name.Should().Be("Test Product");
            productInDb.CategoryId.Should().Be(category.Id);
        }

        [Fact]
        public async Task GetProductByIdAsync_ShouldReturnProduct_WhenItExists()
        {
            
            var context = await GetDbContext();
            var category = new Category { Name = "Cat" };
            context.Categories.Add(category);
            await context.SaveChangesAsync();

            var product = new Product { Name = "Existing", CategoryId = category.Id, Price = 50, Quantity = 10 };
            context.Products.Add(product);
            await context.SaveChangesAsync();

            var service = new ProductService(context);

            var response = await service.GetByIdAsync(product.Id);

            response.Success.Should().BeTrue();
            response.Data.Should().NotBeNull();
            response.Data!.Name.Should().Be("Existing");
        }

        [Fact]
        public async Task DeleteProductAsync_ShouldSoftDeleteProduct()
        {
            
            var context = await GetDbContext();
            var category = new Category { Name = "Cat" };
            context.Categories.Add(category);
            await context.SaveChangesAsync();

            var product = new Product { Name = "ToDelete", CategoryId = category.Id, Price = 50, Quantity = 10, IsActive = true };
            context.Products.Add(product);
            await context.SaveChangesAsync();

            var service = new ProductService(context);

            var response = await service.DeleteAsync(product.Id);

            response.Success.Should().BeTrue();
            var productInDb = await context.Products.IgnoreQueryFilters().FirstAsync(p => p.Id == product.Id);
            productInDb.IsActive.Should().BeFalse();
        }
    }
}
