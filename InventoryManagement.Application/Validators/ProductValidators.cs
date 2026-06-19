using FluentValidation;
using InventoryManagement.Application.Dtos.Product_Dtos;

namespace InventoryManagement.Application.Validators
{
    public class CreateProductDtoValidator : AbstractValidator<CreateProductDto>
    {
        public CreateProductDtoValidator()
        {
            RuleFor(x => x.Name).NotEmpty().WithMessage("Product name is required.");
            RuleFor(x => x.Price).GreaterThanOrEqualTo(0).WithMessage("Price must be 0 or greater.");
            RuleFor(x => x.Quantity).GreaterThanOrEqualTo(0).WithMessage("Quantity must be 0 or greater.");
            RuleFor(x => x.MinQuantity).GreaterThanOrEqualTo(0).WithMessage("Minimum quantity must be 0 or greater.");
            RuleFor(x => x.CategoryId).NotNull().WithMessage("Category is required.");
        }
    }

    public class UpdateProductDtoValidator : AbstractValidator<UpdateProductDto>
    {
        public UpdateProductDtoValidator()
        {
            RuleFor(x => x.Name).NotEmpty().WithMessage("Product name is required.");
            RuleFor(x => x.Price).GreaterThanOrEqualTo(0).WithMessage("Price must be 0 or greater.");
            RuleFor(x => x.Quantity).GreaterThanOrEqualTo(0).WithMessage("Quantity must be 0 or greater.");
            RuleFor(x => x.MinQuantity).GreaterThanOrEqualTo(0).WithMessage("Minimum quantity must be 0 or greater.");
            RuleFor(x => x.CategoryId).NotNull().WithMessage("Category is required.");
        }
    }
}
