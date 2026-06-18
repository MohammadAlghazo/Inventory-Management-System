using FluentValidation;
using Inventory_Management.Dtos.Inventory_Dtos;

namespace Inventory_Management.Validators
{
    public class AddInventoryDtoValidator : AbstractValidator<AddInventoryDto>
    {
        public AddInventoryDtoValidator()
        {
            RuleFor(x => x.ProductId).GreaterThan(0).WithMessage("Valid ProductId is required.");
            RuleFor(x => x.QuantityToAdd).GreaterThan(0).WithMessage("Quantity to add must be greater than 0.");
        }
    }

    public class SellProductDtoValidator : AbstractValidator<SellProductDto>
    {
        public SellProductDtoValidator()
        {
            RuleFor(x => x.ProductId).GreaterThan(0).WithMessage("Valid ProductId is required.");
            RuleFor(x => x.QuantityToSell).GreaterThan(0).WithMessage("Quantity to sell must be greater than 0.");
        }
    }

    public class AdjustStockDtoValidator : AbstractValidator<AdjustStockDto>
    {
        public AdjustStockDtoValidator()
        {
            RuleFor(x => x.ProductId).GreaterThan(0).WithMessage("Valid ProductId is required.");
            RuleFor(x => x.NewQuantity).GreaterThanOrEqualTo(0).WithMessage("New quantity cannot be negative.");
        }
    }

    public class ReturnProductDtoValidator : AbstractValidator<ReturnProductDto>
    {
        public ReturnProductDtoValidator()
        {
            RuleFor(x => x.ProductId).GreaterThan(0).WithMessage("Valid ProductId is required.");
            RuleFor(x => x.QuantityToReturn).GreaterThan(0).WithMessage("Quantity to return must be greater than 0.");
        }
    }
}
