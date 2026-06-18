# 📦 Inventory Management System v2.0 (Professional Edition)

Welcome to the **Inventory Management System**, fully refactored and transformed from a primitive API to a $10,000 professional-grade full-stack application.

## 🌟 Key Features

### 🖥️ Frontend (React + Vite + TypeScript)
- **Stunning UI/UX**: Built with a custom Design System, Glassmorphism, and smooth micro-animations.
- **PWA Ready**: Installable Progressive Web App with offline caching support.
- **Bilingual (i18n)**: Full support for English and Arabic (RTL).
- **Theme Support**: Seamless Dark / Light mode toggling.
- **State Management**: Optimized with `Zustand` and `TanStack React Query`.
- **Advanced Reports**: Real-time charts using `Recharts` (Area, Bar, Donut).
- **Excel Export**: Export product and inventory data to Excel (`.xlsx`) with one click.
- **Dynamic Notifications**: Real-time low-stock alerts built directly into the header.

### ⚙️ Backend (ASP.NET Core 8 Web API)
- **Clean Architecture**: Strict separation of concerns using the Service Layer Pattern.
- **Robust Security**: 
  - JWT Authentication (Securely managed via configuration).
  - Global Exception Handling Middleware.
  - Rate Limiting (Protects login endpoints from brute-force attacks).
- **Data Validation**: Comprehensive DTO validation using `FluentValidation`.
- **Database**: Entity Framework Core with SQL Server. Implements Soft Deletion for data integrity.
- **Performance**: Response Compression (Gzip) configured.

## 🚀 Getting Started

### Prerequisites
- .NET 8/9 SDK
- Node.js (v18+)
- SQL Server (LocalDB or full)

### 1. Backend Setup
1. Navigate to the backend folder:
   ```powershell
   cd "Inventory Management"
   ```
2. Run database migrations:
   ```powershell
   dotnet ef database update
   ```
3. Run the API:
   ```powershell
   dotnet run
   ```
   *The API will start on `https://localhost:7001` with Swagger available at `/swagger`.*

### 2. Frontend Setup
1. Navigate to the frontend folder:
   ```powershell
   cd inventory-frontend
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Run the development server:
   ```powershell
   npm run dev
   ```
   *The app will start on `http://localhost:5173`.*

### 🔑 Default Credentials
- **Username**: `Admin`
- **Password**: `Admin@123`
- **Role**: `Manager`

## 🧪 Testing
The solution includes a dedicated xUnit test project (`Inventory_Management.Tests`) with unit tests covering core services using Moq and FluentAssertions.
```powershell
dotnet test
```

## 📄 License
All rights reserved. Designed and developed by Mohammad Alghazo.