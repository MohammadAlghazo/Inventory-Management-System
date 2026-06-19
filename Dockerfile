# Multi-stage Dockerfile for ASP.NET Core 8.0 Web API
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-env
WORKDIR /src

# Copy project files and restore as distinct layers
COPY ["Inventory Management/InventoryManagement.Api.csproj", "Inventory Management/"]
COPY ["InventoryManagement.Application/InventoryManagement.Application.csproj", "InventoryManagement.Application/"]
COPY ["InventoryManagement.Domain/InventoryManagement.Domain.csproj", "InventoryManagement.Domain/"]
COPY ["InventoryManagement.Infrastructure/InventoryManagement.Infrastructure.csproj", "InventoryManagement.Infrastructure/"]

RUN dotnet restore "Inventory Management/InventoryManagement.Api.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/Inventory Management"
RUN dotnet publish "InventoryManagement.Api.csproj" -c Release -o /app/out

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build-env /app/out .

# Expose port and bind ASP.NET Core to it
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "InventoryManagement.Api.dll"]
