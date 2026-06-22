// Determine if we are running locally or on the deployed frontend
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// رابط السيرفر على ريندر
const RENDER_API_URL = 'https://inventory-management-system-omkq.onrender.com/api';

export const environment = {
  production: true,
  apiUrl: isLocal ? 'https://localhost:7093/api' : RENDER_API_URL,
  cloudinary: { cloudName: 'drkzghomg', uploadPreset: 'inventory_profiles' }
};
