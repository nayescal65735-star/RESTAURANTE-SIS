const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function getAuthToken() {
  return localStorage.getItem('restaurante_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('restaurante_token', token);
  } else {
    localStorage.removeItem('restaurante_token');
  }
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem('restaurante_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user) {
  if (user) {
    localStorage.setItem('restaurante_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('restaurante_user');
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.error || `Error en la petición: ${res.status} ${res.statusText}`);
    }
    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  // Auth
  login: (email, password) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getMe: () => request('/api/auth/me'),

  // Dashboard
  getDashboard: () => request('/api/dashboard'),

  // Mesas
  getMesas: () => request('/api/mesas'),
  createMesa: (data) => request('/api/mesas', { method: 'POST', body: JSON.stringify(data) }),
  updateMesa: (id, data) => request(`/api/mesas/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteMesa: (id) => request(`/api/mesas/${id}`, { method: 'DELETE' }),

  // Categorías
  getCategorias: () => request('/api/categorias'),
  createCategoria: (data) => request('/api/categorias', { method: 'POST', body: JSON.stringify(data) }),
  updateCategoria: (id, data) => request(`/api/categorias/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteCategoria: (id) => request(`/api/categorias/${id}`, { method: 'DELETE' }),

  // Platos
  getPlatos: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/platos${query ? `?${query}` : ''}`);
  },
  getPlato: (id) => request(`/api/platos/${id}`),
  createPlato: (data) => request('/api/platos', { method: 'POST', body: JSON.stringify(data) }),
  updatePlato: (id, data) => request(`/api/platos/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deletePlato: (id) => request(`/api/platos/${id}`, { method: 'DELETE' }),

  // Pedidos
  getPedidos: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/pedidos${query ? `?${query}` : ''}`);
  },
  getPedido: (id) => request(`/api/pedidos/${id}`),
  createPedido: (data) => request('/api/pedidos', { method: 'POST', body: JSON.stringify(data) }),
  updatePedido: (id, data) => request(`/api/pedidos/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deletePedido: (id) => request(`/api/pedidos/${id}`, { method: 'DELETE' }),

  // Ventas
  getVentas: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/ventas${query ? `?${query}` : ''}`);
  },
  createVenta: (data) => request('/api/ventas', { method: 'POST', body: JSON.stringify(data) }),
  updateVenta: (id, data) => request(`/api/ventas/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Clientes
  getClientes: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/clientes${query ? `?${query}` : ''}`);
  },
  createCliente: (data) => request('/api/clientes', { method: 'POST', body: JSON.stringify(data) }),
  updateCliente: (id, data) => request(`/api/clientes/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  toggleCliente: (id) => request(`/api/clientes/${id}/toggle`, { method: 'PATCH' }),
  validarCliente: (id) => request(`/api/clientes/${id}/validar`, { method: 'POST' }),
  deleteCliente: (id) => request(`/api/clientes/${id}`, { method: 'DELETE' }),

  // Reservas
  getReservas: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/reservas${query ? `?${query}` : ''}`);
  },
  createReserva: (data) => request('/api/reservas', { method: 'POST', body: JSON.stringify(data) }),
  updateReserva: (id, data) => request(`/api/reservas/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteReserva: (id) => request(`/api/reservas/${id}`, { method: 'DELETE' }),

  // Inventario
  getInventario: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/inventario${query ? `?${query}` : ''}`);
  },
  getInventarioResumen: () => request('/api/inventario/resumen'),
  getInventarioStockBajo: () => request('/api/inventario/stock-bajo'),
  getInventarioItem: (id) => request(`/api/inventario/${id}`),
  createInventario: (data) => request('/api/inventario', { method: 'POST', body: JSON.stringify(data) }),
  updateInventario: (id, data) => request(`/api/inventario/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteInventario: (id) => request(`/api/inventario/${id}`, { method: 'DELETE' }),
  getInventarioMovimientos: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/inventario/movimientos${query ? `?${query}` : ''}`);
  },
  getInventarioItemMovimientos: (id) => request(`/api/inventario/${id}/movimientos`),
  registrarCompra: (data) => request('/api/inventario/compras', { method: 'POST', body: JSON.stringify(data) }),
  getCompras: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/inventario/compras${query ? `?${query}` : ''}`);
  },
  getCompra: (id) => request(`/api/inventario/compras/${id}`),
  registrarEntradaInventario: (data) => request('/api/inventario/entrada', { method: 'POST', body: JSON.stringify(data) }),
  registrarSalidaInventario: (data) => request('/api/inventario/salida', { method: 'POST', body: JSON.stringify(data) }),
  ajustarStockInventario: (data) => request('/api/inventario/ajuste', { method: 'POST', body: JSON.stringify(data) }),

  // Proveedores
  getProveedores: () => request('/api/proveedores'),
  createProveedor: (data) => request('/api/proveedores', { method: 'POST', body: JSON.stringify(data) }),
  updateProveedor: (id, data) => request(`/api/proveedores/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProveedor: (id) => request(`/api/proveedores/${id}`, { method: 'DELETE' }),

  // Usuarios
  getUsuarios: () => request('/api/usuarios'),
  createUsuario: (data) => request('/api/usuarios', { method: 'POST', body: JSON.stringify(data) }),
  updateUsuario: (id, data) => request(`/api/usuarios/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteUsuario: (id) => request(`/api/usuarios/${id}`, { method: 'DELETE' }),
};
