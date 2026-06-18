using FluentValidation;
using Inventory_Management.Dtos.Product_Dtos;

namespace Inventory_Management.Validators
{
    public class CreateProductDtoValidator : AbstractValidator<CreateProductDto>
    {
        public CreateProductDtoValidator()
        {
            RuleFor(x => x.Name).NotEmpty().WithMessage("Product name is required.");
            RuleFor(x => x.Price).GreaterThanOrEqualTo(0).WithMessage("Price must be 0 or greater.");
            RuleFor(x => x.Quantity).GreaterThanOrEqualTo(0).WithMessage("Quantity must be 0 or greater.");
            RuleFor(x => x.MinQuantity).GreaterThanOrEqualTo(0).WithMessage("Minimum quantity must be 0 or greater.");
            RuleFor(x => x.Category).NotEmpty().WithMessage("Category is required.");
            RuleFor(x => x.Unit).NotEmpty().WithMessage("Unit is required.");
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
            RuleFor(x => x.Category).NotEmpty().WithMessage("Category is required.");
            RuleFor(x => x.Unit).NotEmpty().WithMessage("Unit is required.");
        }
    }
}
