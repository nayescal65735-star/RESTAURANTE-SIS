import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { api, getAuthToken, setAuthToken, getCurrentUser, setCurrentUser as persistCurrentUser } from './api';
import './style.css';

// ==========================================
// PANTALLA DE LOGIN PROFESIONAL
// ==========================================
function LoginView({ onLoginSuccess, addToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const quickUsers = [
    { label: '👑 Admin Demo', email: 'admin@restaurante.com', pass: 'Admin123!', rol: 'ADMIN' },
    { label: '👑 Admin Local', email: 'admin@restaurante.local', pass: 'admin123', rol: 'ADMIN' },
    { label: '🧑‍🍳 Mesero', email: 'mesero@restaurante.local', pass: 'mesero123', rol: 'MESERO' },
    { label: '💵 Cajero', email: 'caja@restaurante.local', pass: 'caja123', rol: 'CAJERO' },
  ];

  const handleSelectQuickUser = (u) => {
    setEmail(u.email);
    setPassword(u.pass);
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      setErrorMessage('Por favor ingresa tu correo y contraseña');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await api.login(email.trim(), password);
      if (res && res.success && res.token && res.data) {
        onLoginSuccess(res.data, res.token);
      } else {
        setErrorMessage(res.error || 'No se pudo iniciar sesión. Verifica tus credenciales.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen-wrapper">
      <div className="login-card">
        <div className="login-brand-header">
          <div className="login-logo-circle">🍽️</div>
          <h1>RESTAURANTE<span>-SIS</span></h1>
          <p>Sistema de Gestión Gastronómica & Punto de Venta</p>
        </div>

        {errorMessage && (
          <div className="login-error-alert">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-input-group">
            <label htmlFor="login-email">Correo Electrónico</label>
            <div className="login-input-wrapper">
              <span className="login-input-icon">✉️</span>
              <input
                id="login-email"
                type="email"
                className="login-input"
                placeholder="admin@restaurante.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="login-input-group">
            <label htmlFor="login-password">Contraseña</label>
            <div className="login-input-wrapper">
              <span className="login-input-icon">🔒</span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="login-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="login-toggle-pw"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-small" />
                <span>Iniciando sesión...</span>
              </>
            ) : (
              <>
                <span>🔐 Iniciar Sesión</span>
              </>
            )}
          </button>
        </form>

        {/* Credenciales rápidas para demostración académica */}
        <div className="login-demo-section">
          <div className="login-demo-title">Acceso Rápido para Demostración</div>
          <div className="login-demo-pills">
            {quickUsers.map((u, idx) => (
              <button
                key={idx}
                type="button"
                className="demo-pill-btn"
                onClick={() => handleSelectQuickUser(u)}
                title={`Autocompletar ${u.email}`}
              >
                <strong>{u.label}</strong>
                <span>{u.email}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="login-footer-info">
          🔒 Autenticación Segura · PostgreSQL & JWT Token · SysLab 2.0
        </div>
      </div>
    </div>
  );
}

// Componente Principal
function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentUser, setCurrentUserState] = useState(() => getCurrentUser());
  const [token, setTokenState] = useState(() => getAuthToken());

  // Notificaciones Toast
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Verificar validez del token en arranque / recarga
  useEffect(() => {
    if (token) {
      api.getMe()
        .then((res) => {
          if (res.data) {
            persistCurrentUser(res.data);
            setCurrentUserState(res.data);
          }
        })
        .catch(() => {
          // Token expirado o inválido
          setAuthToken(null);
          persistCurrentUser(null);
          setCurrentUserState(null);
          setTokenState(null);
        });
    }
  }, []);

  const handleLoginSuccess = (userData, authToken) => {
    setAuthToken(authToken);
    persistCurrentUser(userData);
    setCurrentUserState(userData);
    setTokenState(authToken);
    addToast(`¡Bienvenido/a, ${userData.nombre}!`, 'success');
  };

  const handleLogout = () => {
    setAuthToken(null);
    persistCurrentUser(null);
    setCurrentUserState(null);
    setTokenState(null);
    addToast('Has cerrado sesión exitosamente', 'info');
  };

  // Estado global y trigger de refresco
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const refreshData = () => setRefreshTrigger((prev) => prev + 1);

  // Parámetro opcional para navegación contextual (ej. abrir POS con mesa seleccionada)
  const [preselectedMesaId, setPreselectedMesaId] = useState(null);

  const goToPosWithTable = (mesaId) => {
    setPreselectedMesaId(mesaId);
    setCurrentView('pedidos');
  };

  // Si no está autenticado, mostrar pantalla de login
  if (!currentUser || !token) {
    return (
      <div className="app-login-container">
        {/* Notificaciones flotantes */}
        <div className="toast-container">
          {toasts.map((t) => (
            <div key={t.id} className={`toast-item ${t.type}`}>
              <span className="toast-text">{t.message}</span>
              <button
                className="modal-close-btn"
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <LoginView onLoginSuccess={handleLoginSuccess} addToast={addToast} />
      </div>
    );
  }

  return (
    <div className="app">
      {/* Notificaciones flotantes */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-item ${t.type}`}>
            <span className="toast-text">{t.message}</span>
            <button
              className="modal-close-btn"
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Sidebar de Navegación */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">🍽️</div>
          <div>
            <strong>RESTAURANTE</strong>
            <span>SIS</span>
          </div>
        </div>

        <div className="nav-section">
          <p className="nav-title">OPERACIONES</p>
          <button
            className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
          >
            <span className="icon">🏠</span>
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-item ${currentView === 'mesas' ? 'active' : ''}`}
            onClick={() => setCurrentView('mesas')}
          >
            <span className="icon">🪑</span>
            <span>Mesas del Salón</span>
          </button>

          <button
            className={`nav-item ${currentView === 'menu' ? 'active' : ''}`}
            onClick={() => setCurrentView('menu')}
          >
            <span className="icon">🍔</span>
            <span>Menú y Platos</span>
          </button>

          <button
            className={`nav-item ${currentView === 'pedidos' ? 'active' : ''}`}
            onClick={() => {
              setPreselectedMesaId(null);
              setCurrentView('pedidos');
            }}
          >
            <span className="icon">🧾</span>
            <span>Pedidos / POS</span>
          </button>

          <button
            className={`nav-item ${currentView === 'ventas' ? 'active' : ''}`}
            onClick={() => setCurrentView('ventas')}
          >
            <span className="icon">💰</span>
            <span>Ventas y Cobros</span>
          </button>

          <p className="nav-title">GESTIÓN</p>
          <button
            className={`nav-item ${currentView === 'clientes' ? 'active' : ''}`}
            onClick={() => setCurrentView('clientes')}
          >
            <span className="icon">👥</span>
            <span>Clientes</span>
          </button>

          <button
            className={`nav-item ${currentView === 'reservas' ? 'active' : ''}`}
            onClick={() => setCurrentView('reservas')}
          >
            <span className="icon">📅</span>
            <span>Reservas</span>
          </button>

          <button
            className={`nav-item ${currentView === 'inventario' ? 'active' : ''}`}
            onClick={() => setCurrentView('inventario')}
          >
            <span className="icon">📦</span>
            <span>Inventario</span>
          </button>

          <button
            className={`nav-item ${currentView === 'personal' ? 'active' : ''}`}
            onClick={() => setCurrentView('personal')}
          >
            <span className="icon">👨‍🍳</span>
            <span>Personal & Roles</span>
          </button>
        </div>

        <div className="sidebar-footer">
          <div className="user-profile-row">
            <div className="user-avatar">{currentUser.nombre ? currentUser.nombre.charAt(0).toUpperCase() : 'U'}</div>
            <div className="user-info">
              <strong>{currentUser.nombre}</strong>
              <span className="user-role-badge">{currentUser.rol}</span>
            </div>
          </div>
          <button className="btn-logout-sidebar" onClick={handleLogout} title="Cerrar sesión">
            <span>🚪</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="content">
        <header className="topbar">
          <div>
            <h1>
              {currentView === 'dashboard' && 'Dashboard General'}
              {currentView === 'mesas' && 'Control de Mesas'}
              {currentView === 'menu' && 'Catálogo del Menú'}
              {currentView === 'pedidos' && 'Terminal de Pedidos (POS)'}
              {currentView === 'ventas' && 'Registro de Ventas'}
              {currentView === 'clientes' && 'Gestión de Clientes'}
              {currentView === 'reservas' && 'Reservas de Mesas'}
              {currentView === 'inventario' && 'Control de Inventario'}
              {currentView === 'personal' && 'Equipo de Trabajo'}
            </h1>
            <p>Sistemas Paralelos · RESTAURANTE-SIS</p>
          </div>

          <div className="topbar-actions">
            <button className="btn-icon" title="Refrescar datos" onClick={refreshData}>
              🔄
            </button>
            <div className="date-box">
              📅
              <span>
                {new Date().toLocaleDateString('es-ES', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
            <button className="btn-logout-top" title="Cerrar sesión" onClick={handleLogout}>
              <span>🚪</span>
              <span>Salir</span>
            </button>
          </div>
        </header>

        {/* Renderizado de Vistas */}
        {currentView === 'dashboard' && (
          <DashboardView
            refreshTrigger={refreshTrigger}
            onNavigate={(view) => setCurrentView(view)}
            onOpenPosWithTable={goToPosWithTable}
            addToast={addToast}
          />
        )}

        {currentView === 'mesas' && (
          <MesasView
            refreshTrigger={refreshTrigger}
            onOpenPosWithTable={goToPosWithTable}
            onRefresh={refreshData}
            addToast={addToast}
          />
        )}

        {currentView === 'menu' && (
          <MenuView refreshTrigger={refreshTrigger} onRefresh={refreshData} addToast={addToast} />
        )}

        {currentView === 'pedidos' && (
          <PedidosView
            refreshTrigger={refreshTrigger}
            currentUser={currentUser}
            preselectedMesaId={preselectedMesaId}
            onRefresh={refreshData}
            addToast={addToast}
            onGoToVentas={() => setCurrentView('ventas')}
          />
        )}

        {currentView === 'ventas' && (
          <VentasView
            refreshTrigger={refreshTrigger}
            currentUser={currentUser}
            onRefresh={refreshData}
            addToast={addToast}
          />
        )}

        {currentView === 'clientes' && (
          <ClientesView refreshTrigger={refreshTrigger} onRefresh={refreshData} addToast={addToast} />
        )}

        {currentView === 'reservas' && (
          <ReservasView refreshTrigger={refreshTrigger} onRefresh={refreshData} addToast={addToast} />
        )}

        {currentView === 'inventario' && (
          <InventarioView
            refreshTrigger={refreshTrigger}
            currentUser={currentUser}
            onRefresh={refreshData}
            addToast={addToast}
          />
        )}

        {currentView === 'personal' && (
          <PersonalView
            refreshTrigger={refreshTrigger}
            currentUser={currentUser}
            onSwitchUser={setCurrentUser}
            onRefresh={refreshData}
            addToast={addToast}
          />
        )}
      </main>
    </div>
  );
}

// ==========================================
// 1. DASHBOARD VIEW
// ==========================================
function DashboardView({ refreshTrigger, onNavigate, onOpenPosWithTable, addToast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .getDashboard()
      .then((res) => setData(res.data))
      .catch((err) => addToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  if (loading || !data) {
    return <div className="panel" style={{ padding: '40px', textAlign: 'center' }}>Cargando métricas en tiempo real...</div>;
  }

  return (
    <>
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon gold">💰</div>
            <span className="stat-detail">Hoy</span>
          </div>
          <p>Ventas del día</p>
          <h2>Bs. {Number(data.ventasHoy).toFixed(2)}</h2>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon blue">🧾</div>
            <span className="stat-detail">{data.pedidosPendientes} pendientes</span>
          </div>
          <p>Pedidos de hoy</p>
          <h2>{data.pedidosHoy}</h2>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon green">🪑</div>
            <span className="stat-detail">{data.mesasDisponibles} libres</span>
          </div>
          <p>Mesas ocupadas</p>
          <h2>
            {data.mesasOcupadas} / {data.totalMesas}
          </h2>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon purple">👥</div>
            <span className="stat-detail">Registrados</span>
          </div>
          <p>Clientes activos</p>
          <h2>{data.totalClientes}</h2>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h2>Pedidos recientes</h2>
              <p>Últimos pedidos registrados en el sistema</p>
            </div>
            <button className="secondary-btn" onClick={() => onNavigate('pedidos')}>
              Ver todos →
            </button>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Mesa</th>
                  <th>Cliente</th>
                  <th>Platos</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {data.pedidosRecientes.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                      No hay pedidos recientes
                    </td>
                  </tr>
                ) : (
                  data.pedidosRecientes.map((p) => (
                    <tr key={p.id}>
                      <td><strong>#{p.id}</strong></td>
                      <td>{p.mesa ? `Mesa ${p.mesa.numero}` : 'Para llevar'}</td>
                      <td>{p.cliente ? p.cliente.nombre : 'Cliente general'}</td>
                      <td>{p.detalles.map((d) => `${d.cantidad}x ${d.plato.nombre}`).join(', ')}</td>
                      <td>
                        <span className={`status ${p.estado}`}>
                          <span className="status-dot"></span>
                          {p.estado}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h2>Acciones Rápidas</h2>
              <p>Operaciones frecuentes</p>
            </div>
          </div>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button className="primary-btn" style={{ justifyContent: 'center' }} onClick={() => onNavigate('pedidos')}>
              ➕ Nuevo Pedido (POS)
            </button>
            <button className="secondary-btn" style={{ justifyContent: 'center' }} onClick={() => onNavigate('mesas')}>
              🪑 Ver Salón de Mesas
            </button>
            <button className="secondary-btn" style={{ justifyContent: 'center' }} onClick={() => onNavigate('menu')}>
              🍔 Ver Menú / Agregar Plato
            </button>
            <button className="secondary-btn" style={{ justifyContent: 'center' }} onClick={() => onNavigate('ventas')}>
              💰 Cobrar / Ver Ventas
            </button>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Estado actual del salón</h2>
            <p>Ocupación de mesas en tiempo real</p>
          </div>
          <button className="secondary-btn" onClick={() => onNavigate('mesas')}>
            Gestionar mesas →
          </button>
        </div>

        <div className="tables-grid">
          {data.mesas.map((mesa) => (
            <div
              key={mesa.id}
              className={`table-card ${
                mesa.estado === 'DISPONIBLE'
                  ? 'table-free'
                  : mesa.estado === 'OCUPADA'
                  ? 'table-busy'
                  : mesa.estado === 'RESERVADA'
                  ? 'table-reserved'
                  : 'table-maintenance'
              }`}
            >
              <div className="table-top">
                <span className="table-number">Mesa {mesa.numero}</span>
                <span className={`status ${mesa.estado}`}>{mesa.estado}</span>
              </div>
              <div className="table-symbol">🪑</div>
              <p style={{ margin: '4px 0', fontSize: '12px', color: '#6b7280' }}>
                Capacidad: {mesa.capacidad} personas
              </p>
              {mesa.estado === 'DISPONIBLE' ? (
                <button
                  className="primary-btn table-btn"
                  style={{ marginTop: '8px' }}
                  onClick={() => onOpenPosWithTable(mesa.id)}
                >
                  ➕ Abrir Pedido
                </button>
              ) : (
                <button
                  className="secondary-btn table-btn"
                  style={{ marginTop: '8px' }}
                  onClick={() => onNavigate('pedidos')}
                >
                  🔍 Ver Comanda
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

// ==========================================
// 2. MESAS VIEW
// ==========================================
function MesasView({ refreshTrigger, onOpenPosWithTable, onRefresh, addToast }) {
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNumero, setNewNumero] = useState('');
  const [newCapacidad, setNewCapacidad] = useState('4');

  useEffect(() => {
    setLoading(true);
    api
      .getMesas()
      .then((res) => setMesas(res.data))
      .catch((err) => addToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  const handleChangeEstado = async (mesaId, nuevoEstado) => {
    try {
      await api.updateMesa(mesaId, { estado: nuevoEstado });
      addToast(`Mesa actualizada a estado ${nuevoEstado}`);
      onRefresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleCreateMesa = async (e) => {
    e.preventDefault();
    try {
      await api.createMesa({ numero: parseInt(newNumero, 10), capacidad: parseInt(newCapacidad, 10) });
      addToast('Mesa creada correctamente');
      setShowAddModal(false);
      setNewNumero('');
      onRefresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2>Mesas del Salón</h2>
          <p>Control visual y cambio de estados</p>
        </div>
        <button className="primary-btn" onClick={() => setShowAddModal(true)}>
          ➕ Agregar Mesa
        </button>
      </div>

      <div className="tables-grid">
        {mesas.map((mesa) => {
          const pedidoActivo = mesa.pedidos && mesa.pedidos[0];
          return (
            <div
              key={mesa.id}
              className={`table-card ${
                mesa.estado === 'DISPONIBLE'
                  ? 'table-free'
                  : mesa.estado === 'OCUPADA'
                  ? 'table-busy'
                  : mesa.estado === 'RESERVADA'
                  ? 'table-reserved'
                  : 'table-maintenance'
              }`}
            >
              <div className="table-top">
                <span className="table-number">MESA {mesa.numero}</span>
                <span className={`status ${mesa.estado}`}>{mesa.estado}</span>
              </div>
              <div className="table-symbol">🪑</div>
              <strong style={{ fontSize: '13px' }}>{mesa.capacidad} Personas</strong>

              {pedidoActivo && (
                <div style={{ margin: '8px 0', fontSize: '11px', background: '#fee2e2', padding: '4px 6px', borderRadius: '6px' }}>
                  Pedido #{pedidoActivo.id} ({pedidoActivo.estado})
                </div>
              )}

              <div className="table-actions">
                {mesa.estado === 'DISPONIBLE' && (
                  <button className="primary-btn table-btn" onClick={() => onOpenPosWithTable(mesa.id)}>
                    Tomar Pedido
                  </button>
                )}
                {mesa.estado === 'OCUPADA' && (
                  <button
                    className="secondary-btn table-btn"
                    onClick={() => handleChangeEstado(mesa.id, 'DISPONIBLE')}
                  >
                    Liberar Mesa
                  </button>
                )}
                {mesa.estado !== 'OCUPADA' && (
                  <select
                    className="form-select"
                    style={{ fontSize: '11px', padding: '4px' }}
                    value={mesa.estado}
                    onChange={(e) => handleChangeEstado(mesa.id, e.target.value)}
                  >
                    <option value="DISPONIBLE">Libre</option>
                    <option value="OCUPADA">Ocupada</option>
                    <option value="RESERVADA">Reservada</option>
                    <option value="MANTENIMIENTO">Mantenimiento</option>
                  </select>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Nueva Mesa</h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleCreateMesa}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Número de Mesa</label>
                  <input
                    type="number"
                    className="form-input"
                    required
                    value={newNumero}
                    onChange={(e) => setNewNumero(e.target.value)}
                    placeholder="Ej. 9"
                  />
                </div>
                <div className="form-group">
                  <label>Capacidad (personas)</label>
                  <select
                    className="form-select"
                    value={newCapacidad}
                    onChange={(e) => setNewCapacidad(e.target.value)}
                  >
                    <option value="2">2 personas</option>
                    <option value="4">4 personas</option>
                    <option value="6">6 personas</option>
                    <option value="8">8 personas</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="secondary-btn" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="primary-btn">
                  Guardar Mesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. MENU & PLATOS VIEW
// ==========================================
function MenuView({ refreshTrigger, onRefresh, addToast }) {
  const [categorias, setCategorias] = useState([]);
  const [platos, setPlatos] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlato, setEditingPlato] = useState(null);

  // Formulario nuevo plato
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [categoriaId, setCategoriaId] = useState('');

  // Formulario editar plato
  const [editNombre, setEditNombre] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [editPrecio, setEditPrecio] = useState('');
  const [editCategoriaId, setEditCategoriaId] = useState('');
  const [editDisponible, setEditDisponible] = useState(true);

  useEffect(() => {
    Promise.all([api.getCategorias(), api.getPlatos()])
      .then(([catsRes, platosRes]) => {
        setCategorias(catsRes.data);
        setPlatos(platosRes.data);
        if (catsRes.data.length > 0 && !categoriaId) {
          setCategoriaId(catsRes.data[0].id);
        }
      })
      .catch((err) => addToast(err.message, 'error'));
  }, [refreshTrigger]);

  const filteredPlatos = useMemo(() => {
    return platos.filter((p) => {
      const matchCat = selectedCatId ? p.categoriaId === selectedCatId : true;
      const matchSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [platos, selectedCatId, searchTerm]);

  const handleToggleDisponible = async (plato) => {
    try {
      await api.updatePlato(plato.id, { disponible: !plato.disponible });
      addToast(`Disponibilidad de "${plato.nombre}" actualizada`);
      onRefresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleStartEdit = (plato) => {
    setEditingPlato(plato);
    setEditNombre(plato.nombre || '');
    setEditDescripcion(plato.descripcion || '');
    setEditPrecio(String(plato.precio || ''));
    setEditCategoriaId(plato.categoriaId ? String(plato.categoriaId) : (categorias[0]?.id ? String(categorias[0].id) : ''));
    setEditDisponible(plato.disponible !== undefined ? plato.disponible : true);
    setShowEditModal(true);
  };

  const handleCreatePlato = async (e) => {
    e.preventDefault();
    try {
      await api.createPlato({
        nombre,
        descripcion,
        precio: parseFloat(precio),
        categoriaId: parseInt(categoriaId, 10),
      });
      addToast('Plato registrado en el menú exitosamente', 'success');
      setShowAddModal(false);
      setNombre('');
      setDescripcion('');
      setPrecio('');
      onRefresh();
    } catch (err) {
      addToast(err.message || 'Error al registrar plato', 'error');
    }
  };

  const handleUpdatePlato = async (e) => {
    e.preventDefault();
    if (!editingPlato) return;
    if (!editNombre || !editNombre.trim() || editPrecio === undefined) {
      addToast('El nombre y precio son obligatorios', 'error');
      return;
    }
    const parsedPrecio = parseFloat(editPrecio);
    if (isNaN(parsedPrecio) || parsedPrecio < 0) {
      addToast('El precio debe ser un número válido mayor o igual a 0', 'error');
      return;
    }

    try {
      await api.updatePlato(editingPlato.id, {
        nombre: editNombre.trim(),
        descripcion: editDescripcion.trim() || null,
        precio: parsedPrecio,
        categoriaId: editCategoriaId ? parseInt(editCategoriaId, 10) : undefined,
        disponible: Boolean(editDisponible),
      });
      addToast('Plato actualizado exitosamente', 'success');
      setShowEditModal(false);
      setEditingPlato(null);
      onRefresh();
    } catch (err) {
      addToast(err.message || 'Error al actualizar plato', 'error');
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2>Menú del Restaurante</h2>
          <p>Gestión de especialidades, precios en Bolivianos y disponibilidad</p>
        </div>
        <button className="primary-btn" onClick={() => setShowAddModal(true)}>
          ➕ Nuevo Plato
        </button>
      </div>

      <div style={{ padding: '14px 22px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '12px' }}>
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Buscar plato en el menú..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="category-pills">
        <button
          className={`pill-btn ${selectedCatId === null ? 'active' : ''}`}
          onClick={() => setSelectedCatId(null)}
        >
          Todos los Platos ({platos.length})
        </button>
        {categorias.map((c) => (
          <button
            key={c.id}
            className={`pill-btn ${selectedCatId === c.id ? 'active' : ''}`}
            onClick={() => setSelectedCatId(c.id)}
          >
            {c.nombre}
          </button>
        ))}
      </div>

      <div className="dishes-grid">
        {filteredPlatos.map((plato) => (
          <div key={plato.id} className="dish-card">
            <div className="dish-header">
              <span className="dish-category-tag">{plato.categoria?.nombre || 'General'}</span>
              <h3 className="dish-title">{plato.nombre}</h3>
              <p className="dish-desc">{plato.descripcion || 'Especialidad preparada con los mejores ingredientes.'}</p>
            </div>
            <div className="dish-footer">
              <span className="dish-price">Bs. {Number(plato.precio).toFixed(2)}</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  className="btn-row-action"
                  style={{ fontSize: '11.5px', padding: '4px 8px' }}
                  title="Editar especificaciones y precio del plato"
                  onClick={() => handleStartEdit(plato)}
                >
                  ✏️ Editar
                </button>
                <button
                  className={`secondary-btn ${plato.disponible ? '' : 'disabled'}`}
                  style={{ fontSize: '11.5px', padding: '4px 8px' }}
                  title="Cambiar disponibilidad"
                  onClick={() => handleToggleDisponible(plato)}
                >
                  {plato.disponible ? '🟢' : '🔴'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nuevo Plato */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Agregar Nuevo Plato</h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleCreatePlato}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nombre del Plato *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="Ej. Pique Macho"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Categoría *</label>
                  <select
                    className="form-select"
                    required
                    value={categoriaId}
                    onChange={(e) => setCategoriaId(e.target.value)}
                  >
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Precio (Bs.) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    className="form-input"
                    required
                    placeholder="Ej. 45.00"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Descripción / Ingredientes</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    placeholder="Detalles del plato..."
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="secondary-btn" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="primary-btn">
                  Guardar Plato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Plato */}
      {showEditModal && editingPlato && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <h3>✏️ Editar Plato del Menú</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6b7280' }}>
                  Modificando Plato ID #{editingPlato.id}
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setShowEditModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleUpdatePlato}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nombre del Plato *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label>Categoría *</label>
                  <select
                    className="form-select"
                    required
                    value={editCategoriaId}
                    onChange={(e) => setEditCategoriaId(e.target.value)}
                  >
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Precio (Bs.) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    className="form-input"
                    required
                    value={editPrecio}
                    onChange={(e) => setEditPrecio(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Descripción / Ingredientes</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    value={editDescripcion}
                    onChange={(e) => setEditDescripcion(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                  <input
                    type="checkbox"
                    id="chk-plato-disponible"
                    checked={editDisponible}
                    onChange={(e) => setEditDisponible(e.target.checked)}
                  />
                  <label htmlFor="chk-plato-disponible" style={{ margin: 0, cursor: 'pointer' }}>
                    Plato Disponible para Pedidos
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPlato(null);
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="primary-btn">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 4. PEDIDOS & POS VIEW
// ==========================================
function PedidosView({ refreshTrigger, currentUser, preselectedMesaId, onRefresh, addToast, onGoToVentas }) {
  const [activeTab, setActiveTab] = useState('pos'); // 'pos' o 'comandas'
  const [mesas, setMesas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [platos, setPlatos] = useState([]);
  const [pedidos, setPedidos] = useState([]);

  // Carrito de POS
  const [selectedMesa, setSelectedMesa] = useState(preselectedMesaId || '');
  const [selectedCliente, setSelectedCliente] = useState('');
  const [cartItems, setCartItems] = useState([]); // [{ plato, cantidad }]
  const [observacion, setObservacion] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [searchPos, setSearchPos] = useState('');

  // Modal de cobro rápido desde comanda
  const [payingPedido, setPayingPedido] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('QR');
  const [montoRecibido, setMontoRecibido] = useState('');

  useEffect(() => {
    Promise.all([api.getMesas(), api.getClientes(), api.getPlatos({ disponible: true }), api.getPedidos()])
      .then(([mesasRes, clientesRes, platosRes, pedidosRes]) => {
        setMesas(mesasRes.data);
        setClientes(clientesRes.data);
        setPlatos(platosRes.data);
        setPedidos(pedidosRes.data);
        if (preselectedMesaId) {
          setSelectedMesa(preselectedMesaId);
        }
      })
      .catch((err) => addToast(err.message, 'error'));
  }, [refreshTrigger, preselectedMesaId]);

  // Manejo del Carrito
  const addToCart = (plato) => {
    setCartItems((prev) => {
      const exists = prev.find((item) => item.plato.id === plato.id);
      if (exists) {
        return prev.map((item) =>
          item.plato.id === plato.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prev, { plato, cantidad: 1 }];
    });
  };

  const updateCartQty = (platoId, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.plato.id === platoId) {
            const newQty = item.cantidad + delta;
            return newQty > 0 ? { ...item, cantidad: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const totalCart = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + Number(item.plato.precio) * item.cantidad, 0);
  }, [cartItems]);

  const handleCreateOrder = async () => {
    if (cartItems.length === 0) {
      addToast('Agregue al menos un plato al pedido', 'error');
      return;
    }

    try {
      const payload = {
        usuarioId: currentUser.id,
        mesaId: selectedMesa ? parseInt(selectedMesa, 10) : null,
        clienteId: selectedCliente ? parseInt(selectedCliente, 10) : null,
        observacion,
        detalles: cartItems.map((item) => ({
          platoId: item.plato.id,
          cantidad: item.cantidad,
        })),
      };

      const res = await api.createPedido(payload);
      addToast(`Pedido #${res.data.id} creado y enviado a cocina`);
      setCartItems([]);
      setObservacion('');
      setSelectedMesa('');
      setActiveTab('comandas');
      onRefresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleUpdatePedidoStatus = async (pedidoId, nuevoEstado) => {
    try {
      await api.updatePedido(pedidoId, { estado: nuevoEstado });
      addToast(`Pedido #${pedidoId} actualizado a ${nuevoEstado}`);
      onRefresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleExecutePayment = async () => {
    if (!payingPedido) return;
    try {
      await api.createVenta({
        pedidoId: payingPedido.id,
        metodoPago: paymentMethod,
        usuarioId: currentUser.id,
        clienteId: payingPedido.clienteId,
      });
      addToast(`Pedido #${payingPedido.id} cobrado exitosamente.`);
      setPayingPedido(null);
      onRefresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
        <button
          className={`primary-btn ${activeTab === 'pos' ? '' : 'secondary-btn'}`}
          onClick={() => setActiveTab('pos')}
        >
          ➕ Nuevo Pedido (Terminal POS)
        </button>
        <button
          className={`primary-btn ${activeTab === 'comandas' ? '' : 'secondary-btn'}`}
          onClick={() => setActiveTab('comandas')}
        >
          🍳 Comandas y Cocina ({pedidos.filter((p) => p.estado !== 'ENTREGADO' && p.estado !== 'CANCELADO').length})
        </button>
      </div>

      {activeTab === 'pos' ? (
        <div className="pos-container">
          {/* Catálogo */}
          <div className="pos-catalog">
            <div className="pos-search-bar">
              <input
                type="text"
                className="search-input"
                placeholder="Buscar plato en terminal..."
                value={searchPos}
                onChange={(e) => setSearchPos(e.target.value)}
              />
            </div>

            <div className="pos-items-scroll">
              <div className="pos-items-grid">
                {platos
                  .filter((p) => p.nombre.toLowerCase().includes(searchPos.toLowerCase()))
                  .map((plato) => (
                    <button key={plato.id} className="pos-item-btn" onClick={() => addToCart(plato)}>
                      <span className="pos-item-name">{plato.nombre}</span>
                      <span className="pos-item-price">Bs. {Number(plato.precio).toFixed(2)}</span>
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Panel de Carrito */}
          <div className="pos-cart">
            <div className="pos-cart-header">
              <h3>Comanda del Pedido</h3>
            </div>

            <div className="pos-cart-controls">
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700 }}>MESA</label>
                <select
                  className="form-select"
                  value={selectedMesa}
                  onChange={(e) => setSelectedMesa(e.target.value)}
                >
                  <option value="">Para Llevar</option>
                  {mesas.map((m) => (
                    <option key={m.id} value={m.id}>
                      Mesa {m.numero} ({m.estado})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700 }}>CLIENTE</label>
                <select
                  className="form-select"
                  value={selectedCliente}
                  onChange={(e) => setSelectedCliente(e.target.value)}
                >
                  <option value="">Cliente General</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pos-cart-items">
              {cartItems.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 10px' }}>
                  🛒 Selecciona platos del catálogo para armar el pedido
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.plato.id} className="cart-item-row">
                    <div className="cart-item-info">
                      <div className="cart-item-title">{item.plato.nombre}</div>
                      <div className="cart-item-unit-price">Bs. {Number(item.plato.precio).toFixed(2)} c/u</div>
                    </div>
                    <div className="cart-qty-controls">
                      <button className="qty-btn" onClick={() => updateCartQty(item.plato.id, -1)}>
                        -
                      </button>
                      <span className="cart-qty-value">{item.cantidad}</span>
                      <button className="qty-btn" onClick={() => updateCartQty(item.plato.id, 1)}>
                        +
                      </button>
                    </div>
                    <div className="cart-item-subtotal">
                      Bs. {(Number(item.plato.precio) * item.cantidad).toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ padding: '0 18px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Observación / notas (ej. sin cebolla)..."
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
              />
            </div>

            <div className="pos-cart-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>Bs. {totalCart.toFixed(2)}</span>
              </div>
              <div className="summary-row total-row">
                <span>TOTAL</span>
                <span>Bs. {totalCart.toFixed(2)}</span>
              </div>
              <button
                className="primary-btn"
                style={{ width: '100%', justifyContent: 'center', marginTop: '14px', padding: '12px' }}
                disabled={cartItems.length === 0}
                onClick={handleCreateOrder}
              >
                🚀 Confirmar y Enviar a Cocina
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Vista de Comandas y Cocina */
        <div className="panel">
          <div className="panel-header">
            <div>
              <h2>Control de Comandas y Cocina</h2>
              <p>Seguimiento de estados de pedidos en tiempo real</p>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha/Hora</th>
                  <th>Mesa</th>
                  <th>Cliente</th>
                  <th>Detalle del Pedido</th>
                  <th>Total Estimado</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p) => {
                  const totalPedido = p.detalles.reduce(
                    (acc, d) => acc + Number(d.precio) * d.cantidad,
                    0
                  );
                  return (
                    <tr key={p.id}>
                      <td><strong>#{p.id}</strong></td>
                      <td>{new Date(p.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>{p.mesa ? `Mesa ${p.mesa.numero}` : 'Para Llevar'}</td>
                      <td>{p.cliente ? p.cliente.nombre : 'Cliente general'}</td>
                      <td>
                        <div style={{ fontSize: '12px' }}>
                          {p.detalles.map((d) => (
                            <span key={d.id} style={{ display: 'inline-block', marginRight: '8px' }}>
                              • {d.cantidad}x {d.plato.nombre}
                            </span>
                          ))}
                        </div>
                        {p.observacion && (
                          <small style={{ color: '#d97706', display: 'block' }}>
                            Nota: {p.observacion}
                          </small>
                        )}
                      </td>
                      <td><strong>Bs. {totalPedido.toFixed(2)}</strong></td>
                      <td>
                        <span className={`status ${p.estado}`}>
                          <span className="status-dot"></span>
                          {p.estado}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {p.estado === 'PENDIENTE' && (
                            <button
                              className="secondary-btn"
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                              onClick={() => handleUpdatePedidoStatus(p.id, 'EN_PREPARACION')}
                            >
                              👨‍🍳 A Cocina
                            </button>
                          )}
                          {p.estado === 'EN_PREPARACION' && (
                            <button
                              className="secondary-btn"
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                              onClick={() => handleUpdatePedidoStatus(p.id, 'LISTO')}
                            >
                              ✅ Listo
                            </button>
                          )}
                          {p.estado !== 'ENTREGADO' && p.estado !== 'CANCELADO' && (
                            <button
                              className="primary-btn"
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                              onClick={() => setPayingPedido(p)}
                            >
                              💵 Cobrar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Cobro */}
      {payingPedido && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Cobrar Pedido #{payingPedido.id}</h3>
              <button className="modal-close-btn" onClick={() => setPayingPedido(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: 'center', padding: '16px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
                <p style={{ color: '#6b7280', margin: 0 }}>Monto a Cobrar</p>
                <h1 style={{ color: '#d97706', margin: '6px 0 0', fontSize: '32px' }}>
                  Bs.{' '}
                  {payingPedido.detalles
                    .reduce((acc, d) => acc + Number(d.precio) * d.cantidad, 0)
                    .toFixed(2)}
                </h1>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0' }}>
                  {payingPedido.mesa ? `Mesa ${payingPedido.mesa.numero}` : 'Para Llevar'} ·{' '}
                  {payingPedido.cliente?.nombre || 'Cliente General'}
                </p>
              </div>

              <div className="form-group">
                <label>Método de Pago</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {['QR', 'EFECTIVO', 'TARJETA'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={`pill-btn ${paymentMethod === m ? 'active' : ''}`}
                      style={{ textAlign: 'center' }}
                      onClick={() => setPaymentMethod(m)}
                    >
                      {m === 'QR' ? '📱 QR' : m === 'EFECTIVO' ? '💵 Efectivo' : '💳 Tarjeta'}
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === 'QR' && (
                <div style={{ textAlign: 'center', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '48px', margin: '4px 0' }}>📱</div>
                  <strong>QR Simple / Banco</strong>
                  <p style={{ fontSize: '11.5px', color: '#6b7280', margin: '4px 0 0' }}>
                    Escanee el código QR para procesar el pago al instante.
                  </p>
                </div>
              )}

              {paymentMethod === 'EFECTIVO' && (
                <div className="form-group">
                  <label>Monto Recibido (Bs.)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Ej. 100"
                    value={montoRecibido}
                    onChange={(e) => setMontoRecibido(e.target.value)}
                  />
                  {montoRecibido && (
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#16a34a', marginTop: '6px' }}>
                      Cambio / Vuelto: Bs.{' '}
                      {(
                        parseFloat(montoRecibido) -
                        payingPedido.detalles.reduce((acc, d) => acc + Number(d.precio) * d.cantidad, 0)
                      ).toFixed(2)}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="secondary-btn" onClick={() => setPayingPedido(null)}>
                Cancelar
              </button>
              <button className="primary-btn" onClick={handleExecutePayment}>
                ✅ Confirmar Pago y Liberar Mesa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 5. VENTAS VIEW
// ==========================================
function VentasView({ refreshTrigger, onRefresh, addToast }) {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .getVentas()
      .then((res) => setVentas(res.data))
      .catch((err) => addToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  const totalRecaudado = useMemo(() => {
    return ventas.reduce((acc, v) => acc + Number(v.total), 0);
  }, [ventas]);

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2>Registro Histórico de Ventas</h2>
          <p>Total acumulado: <strong>Bs. {totalRecaudado.toFixed(2)}</strong></p>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID Venta</th>
              <th>Fecha y Hora</th>
              <th>Pedido</th>
              <th>Mesa</th>
              <th>Cliente</th>
              <th>Método de Pago</th>
              <th>Total Cobrado</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((v) => (
              <tr key={v.id}>
                <td><strong>#{v.id}</strong></td>
                <td>{new Date(v.fecha).toLocaleString()}</td>
                <td>Pedido #{v.pedidoId}</td>
                <td>{v.pedido?.mesa ? `Mesa ${v.pedido.mesa.numero}` : 'Para Llevar'}</td>
                <td>{v.cliente ? v.cliente.nombre : 'Cliente general'}</td>
                <td>
                  <span className="status served">{v.metodoPago}</span>
                </td>
                <td><strong>Bs. {Number(v.total).toFixed(2)}</strong></td>
                <td>
                  <span className={`status ${v.estado}`}>
                    <span className="status-dot"></span>
                    {v.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// 6. CLIENTES VIEW (GESTIÓN, ACCIONES Y VALIDACIÓN)
// ==========================================
function ClientesView({ refreshTrigger, onRefresh, addToast }) {
  const [clientes, setClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'activos' | 'inactivos' | 'validados'
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  // Estados para nuevo cliente
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');

  // Estados para edición
  const [editNombre, setEditNombre] = useState('');
  const [editTelefono, setEditTelefono] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editActivo, setEditActivo] = useState(true);

  useEffect(() => {
    const params = { q: searchTerm };
    if (statusFilter === 'activos') params.activo = 'true';
    if (statusFilter === 'inactivos') params.activo = 'false';
    if (statusFilter === 'validados') params.validado = 'true';

    api
      .getClientes(params)
      .then((res) => setClientes(res.data || []))
      .catch((err) => addToast(err.message, 'error'));
  }, [refreshTrigger, searchTerm, statusFilter]);

  const validateEmail = (mail) => {
    if (!mail || !mail.trim()) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail.trim());
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!nombre || !nombre.trim()) {
      addToast('El nombre del cliente es obligatorio', 'error');
      return;
    }
    if (email && !validateEmail(email)) {
      addToast('El formato del correo electrónico es inválido', 'error');
      return;
    }

    try {
      await api.createCliente({
        nombre: nombre.trim(),
        telefono: telefono.trim() || null,
        email: email.trim() || null,
      });
      addToast('Cliente registrado exitosamente', 'success');
      setShowAddModal(false);
      setNombre('');
      setTelefono('');
      setEmail('');
      onRefresh();
    } catch (err) {
      addToast(err.message || 'Error al registrar cliente', 'error');
    }
  };

  const handleStartEdit = (client) => {
    setEditingClient(client);
    setEditNombre(client.nombre || '');
    setEditTelefono(client.telefono || '');
    setEditEmail(client.email || '');
    setEditActivo(client.activo !== undefined ? client.activo : true);
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingClient) return;

    if (!editNombre || !editNombre.trim()) {
      addToast('El nombre del cliente no puede estar vacío', 'error');
      return;
    }
    if (editEmail && !validateEmail(editEmail)) {
      addToast('El formato del correo electrónico es inválido', 'error');
      return;
    }

    try {
      await api.updateCliente(editingClient.id, {
        nombre: editNombre.trim(),
        telefono: editTelefono.trim() || null,
        email: editEmail.trim() || null,
        activo: Boolean(editActivo),
      });
      addToast('Datos del cliente actualizados exitosamente', 'success');
      setShowEditModal(false);
      setEditingClient(null);
      onRefresh();
    } catch (err) {
      addToast(err.message || 'Error al actualizar cliente', 'error');
    }
  };

  const handleToggleStatus = async (client) => {
    const accion = client.activo ? 'desactivar' : 'activar';
    if (confirm(`¿Estás seguro de ${accion} al cliente "${client.nombre}" (ID #${client.id})?`)) {
      try {
        const res = await api.toggleCliente(client.id);
        addToast(res.message || `Cliente ${accion === 'activar' ? 'activado' : 'desactivado'} correctamente`, 'success');
        onRefresh();
      } catch (err) {
        addToast(err.message || `Error al ${accion} cliente`, 'error');
      }
    }
  };

  const handleValidate = async (client) => {
    try {
      const res = await api.validarCliente(client.id);
      if (res.validado) {
        addToast(res.message || `Cliente "${client.nombre}" validado con éxito. Datos conformes.`, 'success');
      } else {
        addToast(res.message || `Observaciones en cliente "${client.nombre}". Revisa sus datos.`, 'warning');
      }
      onRefresh();
    } catch (err) {
      addToast(err.message || 'Error al validar cliente', 'error');
    }
  };

  const handleDelete = async (client) => {
    if (confirm(`¿Estás seguro de eliminar permanentemente al cliente "${client.nombre}" (ID #${client.id})?`)) {
      try {
        const res = await api.deleteCliente(client.id);
        addToast(res.message || 'Cliente eliminado', 'success');
        onRefresh();
      } catch (err) {
        if (err.canDeactivate || (err.message && err.message.includes('historial'))) {
          if (client.activo && confirm(`${err.message}\n\n¿Deseas DESACTIVAR al cliente en su lugar para mantener los registros históricos intactos?`)) {
            try {
              const toggleRes = await api.toggleCliente(client.id);
              addToast(toggleRes.message || 'Cliente desactivado correctamente', 'success');
              onRefresh();
            } catch (toggleErr) {
              addToast(toggleErr.message, 'error');
            }
            return;
          }
        }
        addToast(err.message || 'No se pudo eliminar el cliente', 'error');
      }
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2>Directorio de Clientes</h2>
          <p>Administración, validación y registro de comensales</p>
        </div>
        <button className="primary-btn" onClick={() => setShowAddModal(true)}>
          ➕ Nuevo Cliente
        </button>
      </div>

      <div style={{ padding: '14px 22px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          className="search-input"
          style={{ flex: '1', minWidth: '240px' }}
          placeholder="🔍 Buscar por nombre, teléfono o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '170px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Todos los Estados</option>
          <option value="activos">🟢 Solo Activos</option>
          <option value="inactivos">⚪ Solo Inactivos</option>
          <option value="validados">✔️ Solo Validados</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre Completo</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Estado</th>
              <th>Actividad</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>
                  No se encontraron clientes registrados con los filtros seleccionados
                </td>
              </tr>
            ) : (
              clientes.map((c) => (
                <tr key={c.id} style={{ opacity: c.activo ? 1 : 0.6 }}>
                  <td><strong>#{c.id}</strong></td>
                  <td>
                    <strong>{c.nombre}</strong>
                  </td>
                  <td>{c.telefono || <span style={{ color: '#9ca3af' }}>—</span>}</td>
                  <td>{c.email || <span style={{ color: '#9ca3af' }}>—</span>}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span className={`status ${c.activo ? 'paid' : 'cancelled'}`} style={{ fontSize: '11px' }}>
                        {c.activo ? '🟢 Activo' : '⚪ Inactivo'}
                      </span>
                      {c.validado ? (
                        <span className="dish-category-tag" style={{ margin: 0, fontSize: '10.5px', background: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0' }}>
                          ✔️ Validado
                        </span>
                      ) : (
                        <span className="dish-category-tag" style={{ margin: 0, fontSize: '10.5px', background: '#fffbeb', color: '#b45309', borderColor: '#fde68a' }}>
                          ⏳ Sin validar
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: '#4b5563' }}>
                      {c._count?.pedidos || 0} pedidos · {c._count?.reservas || 0} reservas · {c._count?.ventas || 0} ventas
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="action-btn-group">
                      <button
                        className="btn-row-action"
                        title="Modificar datos del cliente"
                        onClick={() => handleStartEdit(c)}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        className="btn-row-action btn-row-movements"
                        title="Comprobar que los datos obligatorios del cliente estén correctos"
                        onClick={() => handleValidate(c)}
                      >
                        🔍 Validar
                      </button>
                      <button
                        className={`btn-row-action ${c.activo ? 'btn-row-adjust' : 'btn-row-entry'}`}
                        title={c.activo ? 'Desactivar cliente' : 'Activar cliente'}
                        onClick={() => handleToggleStatus(c)}
                      >
                        {c.activo ? '⏸️ Desactivar' : '▶️ Activar'}
                      </button>
                      <button
                        className="btn-row-action btn-row-exit"
                        title="Eliminar cliente"
                        onClick={() => handleDelete(c)}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Registrar Nuevo Cliente */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <h3>➕ Registrar Nuevo Cliente</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6b7280' }}>
                  Ingresa los datos para registrar al comensal en la base de datos
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nombre Completo *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="Ej. Juan Pérez"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono / Celular</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="Ej. 70000000"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Correo Electrónico</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="Ej. juan@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="secondary-btn" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="primary-btn">
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Cliente */}
      {showEditModal && editingClient && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <h3>✏️ Editar Información de Cliente</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6b7280' }}>
                  Modificación de datos del cliente ID #{editingClient.id}
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setShowEditModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nombre Completo *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono / Celular</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="Ej. 70000000"
                    value={editTelefono}
                    onChange={(e) => setEditTelefono(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Correo Electrónico</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="Ej. juan@correo.com"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                  <input
                    type="checkbox"
                    id="chk-cliente-activo"
                    checked={editActivo}
                    onChange={(e) => setEditActivo(e.target.checked)}
                  />
                  <label htmlFor="chk-cliente-activo" style={{ margin: 0, cursor: 'pointer' }}>
                    Cliente Activo para Operaciones (Pedidos, Reservas, Ventas)
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingClient(null);
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="primary-btn">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 7. RESERVAS VIEW
// ==========================================
function ReservasView({ refreshTrigger, onRefresh, addToast }) {
  const [reservas, setReservas] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const [clienteId, setClienteId] = useState('');
  const [mesaId, setMesaId] = useState('');
  const [fecha, setFecha] = useState('');
  const [cantidad, setCantidad] = useState('4');
  const [observacion, setObservacion] = useState('');

  useEffect(() => {
    Promise.all([api.getReservas(), api.getMesas(), api.getClientes()])
      .then(([resRes, mesasRes, clientesRes]) => {
        setReservas(resRes.data);
        setMesas(mesasRes.data);
        setClientes(clientesRes.data);
        if (clientesRes.data.length > 0 && !clienteId) setClienteId(clientesRes.data[0].id);
        if (mesasRes.data.length > 0 && !mesaId) setMesaId(mesasRes.data[0].id);
      })
      .catch((err) => addToast(err.message, 'error'));
  }, [refreshTrigger]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createReserva({
        clienteId: parseInt(clienteId, 10),
        mesaId: parseInt(mesaId, 10),
        fecha,
        cantidad: parseInt(cantidad, 10),
        observacion,
      });
      addToast('Reserva registrada exitosamente');
      setShowAddModal(false);
      onRefresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleUpdateStatus = async (id, nuevoEstado) => {
    try {
      await api.updateReserva(id, { estado: nuevoEstado });
      addToast(`Reserva actualizada a ${nuevoEstado}`);
      onRefresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2>Agenda de Reservas</h2>
          <p>Planificación de mesas y eventos especiales</p>
        </div>
        <button className="primary-btn" onClick={() => setShowAddModal(true)}>
          ➕ Nueva Reserva
        </button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha y Hora</th>
              <th>Cliente</th>
              <th>Mesa</th>
              <th>Personas</th>
              <th>Observación</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((r) => (
              <tr key={r.id}>
                <td>#{r.id}</td>
                <td>{new Date(r.fecha).toLocaleString()}</td>
                <td><strong>{r.cliente?.nombre}</strong></td>
                <td>Mesa {r.mesa?.numero}</td>
                <td>{r.cantidad} pax</td>
                <td>{r.observacion || '—'}</td>
                <td>
                  <span className={`status ${r.estado}`}>
                    <span className="status-dot"></span>
                    {r.estado}
                  </span>
                </td>
                <td>
                  <select
                    className="form-select"
                    style={{ fontSize: '11px', padding: '4px' }}
                    value={r.estado}
                    onChange={(e) => handleUpdateStatus(r.id, e.target.value)}
                  >
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="CONFIRMADA">Confirmada</option>
                    <option value="COMPLETADA">Completada</option>
                    <option value="CANCELADA">Cancelada</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Nueva Reserva</h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Cliente</label>
                  <select className="form-select" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} ({c.telefono || 'Sin tel'})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Mesa Asignada</label>
                  <select className="form-select" value={mesaId} onChange={(e) => setMesaId(e.target.value)}>
                    {mesas.map((m) => (
                      <option key={m.id} value={m.id}>
                        Mesa {m.numero} ({m.capacidad} personas)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Fecha y Hora</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    required
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Cantidad de Personas</label>
                  <input
                    type="number"
                    className="form-input"
                    required
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Observaciones</label>
                  <textarea
                    className="form-input"
                    rows="2"
                    placeholder="Detalles de la reserva..."
                    value={observacion}
                    onChange={(e) => setObservacion(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="secondary-btn" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="primary-btn">
                  Guardar Reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 8. INVENTARIO VIEW COMPLETO Y PROFESIONAL
// ==========================================
function InventarioView({ refreshTrigger, currentUser, onRefresh, addToast }) {
  const [activeTab, setActiveTab] = useState('catalogo'); // 'catalogo' | 'stockBajo' | 'movimientos' | 'compras'
  const [inventario, setInventario] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [resumen, setResumen] = useState({
    totalItems: 0,
    itemsBajoStock: 0,
    valorTotalInventario: 0,
    totalMovimientos: 0,
    totalCompras: 0,
    totalGastadoCompras: 0,
  });
  const [movimientos, setMovimientos] = useState([]);
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [selectedProveedor, setSelectedProveedor] = useState('');
  const [movimientoTipoFilter, setMovimientoTipoFilter] = useState('');

  // Modales
  const [showCompraModal, setShowCompraModal] = useState(false);
  const [showEntradaModal, setShowEntradaModal] = useState(false);
  const [showSalidaModal, setShowSalidaModal] = useState(false);
  const [showAjusteModal, setShowAjusteModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showMovimientosItemModal, setShowMovimientosItemModal] = useState(false);
  const [showDetalleCompraModal, setShowDetalleCompraModal] = useState(false);

  // Estado para formularios de modales
  const [selectedItemForAction, setSelectedItemForAction] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedCompraDetail, setSelectedCompraDetail] = useState(null);
  const [itemMovimientosList, setItemMovimientosList] = useState([]);

  // Formulario de Compra / Reposición
  const [compraProveedorId, setCompraProveedorId] = useState('');
  const [compraFecha, setCompraFecha] = useState(() => new Date().toISOString().slice(0, 16));
  const [compraObservacion, setCompraObservacion] = useState('');
  const [compraItems, setCompraItems] = useState([
    { inventarioId: '', cantidad: 1, precioUnitario: 0 },
  ]);
  const [compraSubmitting, setCompraSubmitting] = useState(false);

  // Formulario Entrada Rápida
  const [entradaCantidad, setEntradaCantidad] = useState('1');
  const [entradaMotivo, setEntradaMotivo] = useState('Reposición manual');

  // Formulario Salida Rápida
  const [salidaCantidad, setSalidaCantidad] = useState('1');
  const [salidaMotivo, setSalidaMotivo] = useState('Consumo de cocina');

  // Formulario Ajuste de Stock
  const [ajusteNuevoStock, setAjusteNuevoStock] = useState('0');
  const [ajusteMotivo, setAjusteMotivo] = useState('Conteo físico de inventario');

  // Formulario Nuevo / Editar Insumo
  const [itemNombre, setItemNombre] = useState('');
  const [itemDescripcion, setItemDescripcion] = useState('');
  const [itemUnidad, setItemUnidad] = useState('kg');
  const [itemStock, setItemStock] = useState('0');
  const [itemStockMinimo, setItemStockMinimo] = useState('5');
  const [itemPrecioCompra, setItemPrecioCompra] = useState('0');
  const [itemPrecioVenta, setItemPrecioVenta] = useState('');
  const [itemProveedorId, setItemProveedorId] = useState('');
  const [itemCategoriaId, setItemCategoriaId] = useState('');
  const [itemActivo, setItemActivo] = useState(true);

  // Carga inicial y refresco de datos
  const loadData = async () => {
    setLoading(true);
    try {
      const [invRes, provRes, catRes, resRes] = await Promise.all([
        api.getInventario(),
        api.getProveedores(),
        api.getCategorias(),
        api.getInventarioResumen().catch(() => ({ data: null })),
      ]);

      const items = invRes.data || [];
      setInventario(items);
      setProveedores(provRes.data || []);
      setCategorias(catRes.data || []);

      if (resRes && resRes.data) {
        setResumen(resRes.data);
      } else {
        // Cálculo local si falla el endpoint de resumen
        const itemsBajo = items.filter((i) => i.alertaBajoStock).length;
        const totalVal = items.reduce((acc, i) => acc + (Number(i.stock) * Number(i.precioCompra)), 0);
        setResumen({
          totalItems: items.length,
          itemsBajoStock: itemsBajo,
          valorTotalInventario: Number(totalVal.toFixed(2)),
          totalMovimientos: 0,
          totalCompras: 0,
          totalGastadoCompras: 0,
        });
      }

      // Si está en pestaña de movimientos o compras, cargar en paralelo
      if (activeTab === 'movimientos') {
        const movRes = await api.getInventarioMovimientos();
        setMovimientos(movRes.data || []);
      } else if (activeTab === 'compras') {
        const compRes = await api.getCompras();
        setCompras(compRes.data || []);
      }
    } catch (err) {
      addToast(err.message || 'Error cargando datos de inventario', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger, activeTab]);

  // Manejo de cambio de pestañas y carga bajo demanda
  const handleTabChange = async (tabName) => {
    setActiveTab(tabName);
    if (tabName === 'movimientos') {
      try {
        const movRes = await api.getInventarioMovimientos();
        setMovimientos(movRes.data || []);
      } catch (err) {
        addToast(err.message, 'error');
      }
    } else if (tabName === 'compras') {
      try {
        const compRes = await api.getCompras();
        setCompras(compRes.data || []);
      } catch (err) {
        addToast(err.message, 'error');
      }
    }
  };

  // Filtrado de productos en catálogo
  const filteredInventario = useMemo(() => {
    return inventario.filter((item) => {
      const matchQuery =
        !searchQuery ||
        item.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.descripcion && item.descripcion.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.categoria && item.categoria.nombre.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCat = !selectedCategoria || item.categoriaId === parseInt(selectedCategoria, 10);
      const matchProv = !selectedProveedor || item.proveedorId === parseInt(selectedProveedor, 10);

      return matchQuery && matchCat && matchProv;
    });
  }, [inventario, searchQuery, selectedCategoria, selectedProveedor]);

  // Lista de productos con stock bajo
  const lowStockItems = useMemo(() => {
    return inventario.filter((item) => item.alertaBajoStock);
  }, [inventario]);

  // Filtrado de movimientos
  const filteredMovimientos = useMemo(() => {
    return movimientos.filter((m) => {
      if (!movimientoTipoFilter) return true;
      return m.tipo === movimientoTipoFilter;
    });
  }, [movimientos, movimientoTipoFilter]);

  // ==========================================
  // APERTURA DE MODALES CON CONTEXTO
  // ==========================================
  const openCompraModal = (preselectedItemId = null) => {
    let targetItem = null;
    if (preselectedItemId) {
      targetItem = inventario.find((i) => i.id === preselectedItemId);
    } else if (inventario.length > 0) {
      targetItem = inventario[0];
    }

    const initialPrice = targetItem ? Number(targetItem.precioCompra) : 0;
    let initialQty = 10;
    if (targetItem) {
      const deficit = Number(targetItem.stockMinimo) - Number(targetItem.stock);
      if (deficit > 0) {
        initialQty = Math.max(1, Math.ceil(deficit));
      }
    }

    setCompraProveedorId(targetItem?.proveedorId || (proveedores.length > 0 ? proveedores[0].id : ''));
    setCompraFecha(new Date().toISOString().slice(0, 16));
    setCompraObservacion('');
    setCompraItems([
      {
        inventarioId: targetItem ? targetItem.id : '',
        cantidad: initialQty,
        precioUnitario: initialPrice,
      },
    ]);
    setShowCompraModal(true);
  };

  const openEntradaModal = (item) => {
    setSelectedItemForAction(item);
    setEntradaCantidad('5');
    setEntradaMotivo('Reposición de stock');
    setShowEntradaModal(true);
  };

  const openSalidaModal = (item) => {
    setSelectedItemForAction(item);
    setSalidaCantidad('1');
    setSalidaMotivo('Consumo / Merma de cocina');
    setShowSalidaModal(true);
  };

  const openAjusteModal = (item) => {
    setSelectedItemForAction(item);
    setAjusteNuevoStock(String(item.stock));
    setAjusteMotivo('Conteo físico de existencias');
    setShowAjusteModal(true);
  };

  const openMovimientosItemModal = async (item) => {
    setSelectedItemForAction(item);
    try {
      const res = await api.getInventarioItemMovimientos(item.id);
      setItemMovimientosList(res.data || []);
      setShowMovimientosItemModal(true);
    } catch (err) {
      addToast(err.message || 'Error cargando movimientos del producto', 'error');
    }
  };

  const openItemModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setItemNombre(item.nombre);
      setItemDescripcion(item.descripcion || '');
      setItemUnidad(item.unidad);
      setItemStock(String(item.stock));
      setItemStockMinimo(String(item.stockMinimo));
      setItemPrecioCompra(String(item.precioCompra));
      setItemPrecioVenta(item.precioVenta ? String(item.precioVenta) : '');
      setItemProveedorId(item.proveedorId ? String(item.proveedorId) : '');
      setItemCategoriaId(item.categoriaId ? String(item.categoriaId) : '');
      setItemActivo(item.activo !== undefined ? item.activo : true);
    } else {
      setEditingItem(null);
      setItemNombre('');
      setItemDescripcion('');
      setItemUnidad('kg');
      setItemStock('0');
      setItemStockMinimo('5');
      setItemPrecioCompra('0');
      setItemPrecioVenta('');
      setItemProveedorId(proveedores.length > 0 ? String(proveedores[0].id) : '');
      setItemCategoriaId(categorias.length > 0 ? String(categorias[0].id) : '');
      setItemActivo(true);
    }
    setShowItemModal(true);
  };

  const openDetalleCompraModal = async (compraId) => {
    try {
      const res = await api.getCompra(compraId);
      setSelectedCompraDetail(res.data);
      setShowDetalleCompraModal(true);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // ==========================================
  // MANEJADORES DE ACCIONES (SUBMITS)
  // ==========================================

  // 1. Guardar Compra
  const handleCompraItemChange = (index, field, value) => {
    setCompraItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };

      // Si cambia el producto, sugerir su precio de compra habitual
      if (field === 'inventarioId') {
        const found = inventario.find((i) => i.id === parseInt(value, 10));
        if (found) {
          next[index].precioUnitario = Number(found.precioCompra);
        }
      }
      return next;
    });
  };

  const handleAddCompraItemRow = () => {
    const firstItem = inventario[0];
    setCompraItems((prev) => [
      ...prev,
      {
        inventarioId: firstItem ? firstItem.id : '',
        cantidad: 1,
        precioUnitario: firstItem ? Number(firstItem.precioCompra) : 0,
      },
    ]);
  };

  const handleRemoveCompraItemRow = (index) => {
    if (compraItems.length > 1) {
      setCompraItems((prev) => prev.filter((_, idx) => idx !== index));
    }
  };

  const totalCompraCalculado = useMemo(() => {
    return compraItems.reduce((acc, row) => {
      const cant = parseFloat(row.cantidad) || 0;
      const precio = parseFloat(row.precioUnitario) || 0;
      return acc + cant * precio;
    }, 0);
  }, [compraItems]);

  const handleSubmitCompra = async (e) => {
    e.preventDefault();
    if (compraItems.length === 0) {
      addToast('Agrega al menos un producto a la compra', 'error');
      return;
    }

    for (let i = 0; i < compraItems.length; i++) {
      const item = compraItems[i];
      if (!item.inventarioId) {
        addToast(`Fila #${i + 1}: Selecciona un producto`, 'error');
        return;
      }
      if (parseFloat(item.cantidad) <= 0) {
        addToast(`Fila #${i + 1}: La cantidad debe ser mayor a 0`, 'error');
        return;
      }
      if (parseFloat(item.precioUnitario) < 0) {
        addToast(`Fila #${i + 1}: El precio no puede ser negativo`, 'error');
        return;
      }
    }

    setCompraSubmitting(true);
    try {
      const payload = {
        proveedorId: compraProveedorId ? parseInt(compraProveedorId, 10) : null,
        observacion: compraObservacion.trim() || null,
        fecha: compraFecha ? new Date(compraFecha).toISOString() : new Date().toISOString(),
        usuarioId: currentUser?.id || null,
        items: compraItems.map((it) => ({
          inventarioId: parseInt(it.inventarioId, 10),
          cantidad: parseFloat(it.cantidad),
          precioUnitario: parseFloat(it.precioUnitario),
        })),
      };

      const res = await api.registrarCompra(payload);
      addToast(res.message || 'Compra registrada y stock actualizado con éxito', 'success');
      setShowCompraModal(false);
      loadData();
      onRefresh();
    } catch (err) {
      addToast(err.message || 'Error registrando la compra', 'error');
    } finally {
      setCompraSubmitting(false);
    }
  };

  // 2. Guardar Entrada Rápida
  const handleSubmitEntrada = async (e) => {
    e.preventDefault();
    const cant = parseFloat(entradaCantidad);
    if (!selectedItemForAction || isNaN(cant) || cant <= 0) {
      addToast('Ingresa una cantidad válida mayor a 0', 'error');
      return;
    }

    try {
      const res = await api.registrarEntradaInventario({
        inventarioId: selectedItemForAction.id,
        cantidad: cant,
        motivo: entradaMotivo.trim() || 'Entrada manual',
        usuarioId: currentUser?.id || null,
      });
      addToast(res.message || 'Entrada de stock registrada', 'success');
      setShowEntradaModal(false);
      loadData();
      onRefresh();
    } catch (err) {
      addToast(err.message || 'Error registrando entrada', 'error');
    }
  };

  // 3. Guardar Salida Rápida
  const handleSubmitSalida = async (e) => {
    e.preventDefault();
    const cant = parseFloat(salidaCantidad);
    if (!selectedItemForAction || isNaN(cant) || cant <= 0) {
      addToast('Ingresa una cantidad válida mayor a 0', 'error');
      return;
    }
    if (cant > Number(selectedItemForAction.stock)) {
      addToast(
        `Stock insuficiente. Solo hay ${selectedItemForAction.stock} ${selectedItemForAction.unidad} disponibles.`,
        'error'
      );
      return;
    }

    try {
      const res = await api.registrarSalidaInventario({
        inventarioId: selectedItemForAction.id,
        cantidad: cant,
        motivo: salidaMotivo.trim() || 'Salida manual',
        usuarioId: currentUser?.id || null,
      });
      addToast(res.message || 'Salida de stock registrada', 'success');
      setShowSalidaModal(false);
      loadData();
      onRefresh();
    } catch (err) {
      addToast(err.message || 'Error registrando salida', 'error');
    }
  };

  // 4. Guardar Ajuste de Stock
  const handleSubmitAjuste = async (e) => {
    e.preventDefault();
    const nuevoStock = parseFloat(ajusteNuevoStock);
    if (!selectedItemForAction || isNaN(nuevoStock) || nuevoStock < 0) {
      addToast('Ingresa un valor de nuevo stock mayor o igual a 0', 'error');
      return;
    }
    if (!ajusteMotivo || !ajusteMotivo.trim()) {
      addToast('El motivo de justificación es obligatorio para ajustes de stock', 'error');
      return;
    }

    try {
      const res = await api.ajustarStockInventario({
        inventarioId: selectedItemForAction.id,
        nuevoStock: nuevoStock,
        motivo: ajusteMotivo.trim(),
        usuarioId: currentUser?.id || null,
      });
      addToast(res.message || 'Ajuste de inventario aplicado correctamente', 'success');
      setShowAjusteModal(false);
      loadData();
      onRefresh();
    } catch (err) {
      addToast(err.message || 'Error ajustando stock', 'error');
    }
  };

  // 5. Guardar Nuevo / Editar Insumo
  const handleSubmitItem = async (e) => {
    e.preventDefault();
    if (!itemNombre || !itemUnidad) {
      addToast('El nombre y unidad de medida son obligatorios', 'error');
      return;
    }

    // Validación de duplicados al crear nuevo producto
    if (!editingItem) {
      const nombreNorm = itemNombre.trim().toLowerCase();
      const duplicado = inventario.find(
        (i) => i.nombre.trim().toLowerCase() === nombreNorm
      );
      if (duplicado) {
        addToast(
          `El insumo "${duplicado.nombre}" ya existe en el inventario (ID #${duplicado.id}, Stock actual: ${duplicado.stock} ${duplicado.unidad}). Para reponer existencias utiliza "Registrar Compra / Reponer stock" en lugar de crear un producto duplicado.`,
          'error'
        );
        return;
      }
    }

    try {
      if (editingItem) {
        // Actualizar existente
        const payload = {
          nombre: itemNombre.trim(),
          descripcion: itemDescripcion.trim() || null,
          unidad: itemUnidad.trim(),
          stockMinimo: parseFloat(itemStockMinimo) || 0,
          precioCompra: parseFloat(itemPrecioCompra) || 0,
          precioVenta: itemPrecioVenta ? parseFloat(itemPrecioVenta) : null,
          proveedorId: itemProveedorId ? parseInt(itemProveedorId, 10) : null,
          categoriaId: itemCategoriaId ? parseInt(itemCategoriaId, 10) : null,
          activo: Boolean(itemActivo),
        };
        await api.updateInventario(editingItem.id, payload);
        addToast('Producto de inventario actualizado correctamente', 'success');
      } else {
        // Crear nuevo
        const payload = {
          nombre: itemNombre.trim(),
          descripcion: itemDescripcion.trim() || null,
          unidad: itemUnidad.trim(),
          stock: parseFloat(itemStock) || 0,
          stockMinimo: parseFloat(itemStockMinimo) || 0,
          precioCompra: parseFloat(itemPrecioCompra) || 0,
          precioVenta: itemPrecioVenta ? parseFloat(itemPrecioVenta) : null,
          proveedorId: itemProveedorId ? parseInt(itemProveedorId, 10) : null,
          categoriaId: itemCategoriaId ? parseInt(itemCategoriaId, 10) : null,
          activo: Boolean(itemActivo),
          usuarioId: currentUser?.id || null,
        };
        await api.createInventario(payload);
        addToast('Nuevo insumo registrado en el inventario', 'success');
      }

      setShowItemModal(false);
      loadData();
      onRefresh();
    } catch (err) {
      addToast(err.message || 'Error al guardar el producto', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Tarjetas de Métricas de Inventario */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon blue">📦</div>
            <span className="stat-detail">Catálogo</span>
          </div>
          <p>Total de Insumos Activos</p>
          <h2>{resumen.totalItems}</h2>
        </div>

        <div
          className="stat-card"
          style={{ cursor: 'pointer', border: resumen.itemsBajoStock > 0 ? '1.5px solid #f87171' : undefined }}
          onClick={() => handleTabChange('stockBajo')}
          title="Ver productos con stock bajo"
        >
          <div className="stat-top">
            <div className="stat-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>⚠️</div>
            <span className="stat-detail" style={{ background: '#fee2e2', color: '#dc2626' }}>
              {resumen.itemsBajoStock > 0 ? 'Atención urgente' : 'Sin alertas'}
            </span>
          </div>
          <p>Productos con Stock Bajo</p>
          <h2 style={{ color: resumen.itemsBajoStock > 0 ? '#dc2626' : undefined }}>
            {resumen.itemsBajoStock}
          </h2>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon gold">💰</div>
            <span className="stat-detail">Valoración</span>
          </div>
          <p>Valor Total en Almacén</p>
          <h2>Bs. {Number(resumen.valorTotalInventario || 0).toFixed(2)}</h2>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon green">🛒</div>
            <span className="stat-detail">{resumen.totalCompras} compras</span>
          </div>
          <p>Total Gastado en Compras</p>
          <h2>Bs. {Number(resumen.totalGastadoCompras || 0).toFixed(2)}</h2>
        </div>
      </section>

      {/* Banner de alerta de stock bajo si existe */}
      {resumen.itemsBajoStock > 0 && activeTab !== 'stockBajo' && (
        <div className="inventory-alert-banner">
          <div>
            <strong>⚠️ Alerta de Reabastecimiento:</strong> Hay {resumen.itemsBajoStock} producto(s) con stock igual o inferior a su mínimo recomendado.
          </div>
          <button
            className="secondary-btn"
            style={{ fontSize: '12px', padding: '6px 12px' }}
            onClick={() => handleTabChange('stockBajo')}
          >
            Ver productos en alerta →
          </button>
        </div>
      )}

      {/* 2. Panel Principal con Pestañas y Filtros */}
      <div className="panel">
        {/* Navegación por pestañas del módulo */}
        <div className="inv-subnav">
          <button
            className={`inv-tab-btn ${activeTab === 'catalogo' ? 'active' : ''}`}
            onClick={() => handleTabChange('catalogo')}
          >
            <span>📦</span>
            <span>Catálogo General</span>
            <span className="inv-tab-badge">{inventario.length}</span>
          </button>

          <button
            className={`inv-tab-btn ${activeTab === 'stockBajo' ? 'active' : ''}`}
            onClick={() => handleTabChange('stockBajo')}
          >
            <span>⚠️</span>
            <span>Stock Bajo y Reposición</span>
            <span className={`inv-tab-badge ${lowStockItems.length > 0 ? 'badge-danger' : ''}`}>
              {lowStockItems.length}
            </span>
          </button>

          <button
            className={`inv-tab-btn ${activeTab === 'movimientos' ? 'active' : ''}`}
            onClick={() => handleTabChange('movimientos')}
          >
            <span>📜</span>
            <span>Historial de Movimientos</span>
          </button>

          <button
            className={`inv-tab-btn ${activeTab === 'compras' ? 'active' : ''}`}
            onClick={() => handleTabChange('compras')}
          >
            <span>🧾</span>
            <span>Registro de Compras</span>
          </button>
        </div>

        {/* Barra superior de acciones globales */}
        <div className="inv-filters-bar">
          {activeTab === 'catalogo' && (
            <>
              <div className="inv-search-box">
                <input
                  type="text"
                  className="search-input"
                  style={{ width: '100%' }}
                  placeholder="🔍 Buscar por nombre, descripción o categoría..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                className="form-select"
                style={{ width: 'auto', minWidth: '160px' }}
                value={selectedCategoria}
                onChange={(e) => setSelectedCategoria(e.target.value)}
              >
                <option value="">Todas las Categorías</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>

              <select
                className="form-select"
                style={{ width: 'auto', minWidth: '160px' }}
                value={selectedProveedor}
                onChange={(e) => setSelectedProveedor(e.target.value)}
              >
                <option value="">Todos los Proveedores</option>
                {proveedores.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </>
          )}

          {activeTab === 'movimientos' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600' }}>Filtrar Tipo:</span>
                <select
                  className="form-select"
                  style={{ width: 'auto' }}
                  value={movimientoTipoFilter}
                  onChange={(e) => setMovimientoTipoFilter(e.target.value)}
                >
                  <option value="">Todos los Movimientos</option>
                  <option value="ENTRADA">🟢 ENTRADA</option>
                  <option value="SALIDA">🔴 SALIDA</option>
                  <option value="AJUSTE">🟡 AJUSTE</option>
                </select>
              </div>
            </>
          )}

          <div className="inv-actions-group" style={{ marginLeft: 'auto' }}>
            <button
              className="btn-inv-action btn-purchase"
              onClick={() => openCompraModal()}
              title="Registrar una compra con varios productos y actualizar stock automáticamente"
            >
              <span>🛒</span>
              <span>Registrar Compra</span>
            </button>

            <button
              className="btn-inv-action btn-entry"
              onClick={() => openEntradaModal(inventario[0] || null)}
              disabled={inventario.length === 0}
              title="Aumentar stock manualmente"
            >
              <span>📥</span>
              <span>Entrada Manual</span>
            </button>

            <button
              className="btn-inv-action btn-exit"
              onClick={() => openSalidaModal(inventario[0] || null)}
              disabled={inventario.length === 0}
              title="Disminuir stock por merma o consumo"
            >
              <span>📤</span>
              <span>Salida</span>
            </button>

            <button
              className="btn-inv-action btn-adjust"
              onClick={() => openAjusteModal(inventario[0] || null)}
              disabled={inventario.length === 0}
              title="Ajustar stock físico"
            >
              <span>⚖️</span>
              <span>Ajustar Stock</span>
            </button>

            <button className="primary-btn" onClick={() => openItemModal(null)}>
              <span>➕</span>
              <span>Nuevo Insumo</span>
            </button>
          </div>
        </div>

        {/* 3. CONTENIDO SEGÚN LA PESTAÑA SELECCIONADA */}

        {/* PESTAÑA 1: CATÁLOGO GENERAL */}
        {activeTab === 'catalogo' && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Producto / Insumo</th>
                  <th>Categoría</th>
                  <th>Stock Actual</th>
                  <th>Stock Mínimo</th>
                  <th>Costo Compra</th>
                  <th>Proveedor</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acciones Rápidas</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventario.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#6b7280' }}>
                      {loading ? 'Cargando insumos e inventario...' : 'No se encontraron insumos con los filtros seleccionados'}
                    </td>
                  </tr>
                ) : (
                  filteredInventario.map((item) => {
                    const ratio = Number(item.stockMinimo) > 0 ? (Number(item.stock) / Number(item.stockMinimo)) * 100 : 100;
                    return (
                      <tr key={item.id} style={{ opacity: item.activo ? 1 : 0.6 }}>
                        <td><strong>#{item.id}</strong></td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <strong>{item.nombre}</strong>
                            {item.descripcion && (
                              <small style={{ color: '#6b7280', fontSize: '11.5px' }}>
                                {item.descripcion}
                              </small>
                            )}
                          </div>
                        </td>
                        <td>
                          {item.categoria ? (
                            <span className="dish-category-tag" style={{ margin: 0, fontSize: '11px' }}>
                              {item.categoria.nombre}
                            </span>
                          ) : (
                            <span style={{ color: '#9ca3af', fontSize: '12px' }}>—</span>
                          )}
                        </td>
                        <td>
                          <div className="stock-level-bar">
                            <strong style={{ fontSize: '14px', minWidth: '60px' }}>
                              {item.stock} <small style={{ fontWeight: 'normal', color: '#6b7280' }}>{item.unidad}</small>
                            </strong>
                            <div className="stock-meter" title={`Nivel de stock: ${Math.round(ratio)}%`}>
                              <div
                                className={`stock-meter-fill ${item.alertaBajoStock ? 'warning' : 'normal'}`}
                                style={{ width: `${Math.min(Math.max(ratio, 5), 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ color: '#4b5563' }}>{item.stockMinimo} {item.unidad}</span>
                        </td>
                        <td>
                          <strong>Bs. {Number(item.precioCompra).toFixed(2)}</strong>
                        </td>
                        <td>
                          {item.proveedor ? (
                            <span style={{ fontSize: '12.5px' }}>{item.proveedor.nombre}</span>
                          ) : (
                            <span style={{ color: '#9ca3af', fontSize: '12px' }}>Sin asignar</span>
                          )}
                        </td>
                        <td>
                          {item.alertaBajoStock ? (
                            <span className="status preparing" title="Stock igual o menor al mínimo requerido">
                              ⚠️ Stock Bajo
                            </span>
                          ) : (
                            <span className="status paid" title="Stock adecuado">
                              🟢 Óptimo
                            </span>
                          )}
                          {!item.activo && (
                            <span className="status cancelled" style={{ marginLeft: '4px' }}>
                              Inactivo
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="action-btn-group">
                            <button
                              className="btn-row-action btn-row-entry"
                              title="Registrar entrada de este insumo"
                              onClick={() => openEntradaModal(item)}
                            >
                              ➕ Entrada
                            </button>
                            <button
                              className="btn-row-action btn-row-exit"
                              title="Registrar salida o merma de este insumo"
                              onClick={() => openSalidaModal(item)}
                            >
                              ➖ Salida
                            </button>
                            <button
                              className="btn-row-action btn-row-adjust"
                              title="Ajustar cantidad física"
                              onClick={() => openAjusteModal(item)}
                            >
                              ⚖️
                            </button>
                            <button
                              className="btn-row-action btn-row-movements"
                              title="Ver historial de movimientos de este producto"
                              onClick={() => openMovimientosItemModal(item)}
                            >
                              📜
                            </button>
                            <button
                              className="btn-row-action"
                              title="Editar producto"
                              onClick={() => openItemModal(item)}
                            >
                              ✏️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PESTAÑA 2: STOCK BAJO Y REPOSICIÓN */}
        {activeTab === 'stockBajo' && (
          <div className="table-wrapper">
            <div style={{ padding: '16px 20px', background: '#fef2f2', borderBottom: '1px solid #fecaca', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#991b1b', fontSize: '14px' }}>
                  ⚠️ {lowStockItems.length} producto(s) en alerta de stock bajo
                </strong>
                <p style={{ margin: '2px 0 0', color: '#b91c1c', fontSize: '12.5px' }}>
                  Estos productos han alcanzado o descendido de su nivel mínimo de seguridad y requieren compra o reposición.
                </p>
              </div>
              {lowStockItems.length > 0 && (
                <button className="btn-inv-action btn-purchase" onClick={() => openCompraModal()}>
                  🛒 Comprar Reposición
                </button>
              )}
            </div>

            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Producto Requerido</th>
                  <th>Categoría</th>
                  <th>Stock Actual</th>
                  <th>Stock Mínimo</th>
                  <th>Déficit Estimado</th>
                  <th>Costo Estimado Reposición</th>
                  <th>Proveedor Sugerido</th>
                  <th style={{ textAlign: 'right' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#16a34a' }}>
                      <div style={{ fontSize: '28px', marginBottom: '8px' }}>🎉</div>
                      <strong>¡Excelente! Todos los productos se encuentran en niveles óptimos de stock.</strong>
                    </td>
                  </tr>
                ) : (
                  lowStockItems.map((item) => {
                    const deficit = Math.max(0, Number(item.stockMinimo) - Number(item.stock));
                    const costoReposicion = deficit * Number(item.precioCompra);
                    return (
                      <tr key={item.id} style={{ background: '#fffdfd' }}>
                        <td><strong>#{item.id}</strong></td>
                        <td>
                          <strong>{item.nombre}</strong>
                          <small style={{ display: 'block', color: '#6b7280' }}>{item.unidad}</small>
                        </td>
                        <td>{item.categoria?.nombre || 'General'}</td>
                        <td>
                          <span style={{ color: '#dc2626', fontWeight: '800', fontSize: '14px' }}>
                            {item.stock} {item.unidad}
                          </span>
                        </td>
                        <td>
                          <strong>{item.stockMinimo} {item.unidad}</strong>
                        </td>
                        <td>
                          <span className="stock-diff-chip negative">
                            -{deficit.toFixed(2)} {item.unidad}
                          </span>
                        </td>
                        <td>
                          <strong>Bs. {costoReposicion.toFixed(2)}</strong>
                        </td>
                        <td>
                          {item.proveedor ? (
                            <div>
                              <div><strong>{item.proveedor.nombre}</strong></div>
                              {item.proveedor.telefono && <small style={{ color: '#6b7280' }}>📞 {item.proveedor.telefono}</small>}
                            </div>
                          ) : (
                            <span style={{ color: '#9ca3af' }}>No asignado</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn-inv-action btn-purchase"
                            style={{ fontSize: '11.5px', padding: '6px 10px' }}
                            onClick={() => openCompraModal(item.id)}
                            title="Abrir formulario de compra con este producto"
                          >
                            🛒 Comprar
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PESTAÑA 3: HISTORIAL DE MOVIMIENTOS */}
        {activeTab === 'movimientos' && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha y Hora</th>
                  <th>Tipo</th>
                  <th>Producto / Insumo</th>
                  <th>Cantidad</th>
                  <th>Stock Anterior → Posterior</th>
                  <th>Motivo / Referencia</th>
                  <th>Usuario</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovimientos.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#6b7280' }}>
                      No hay registros de movimientos de inventario todavía
                    </td>
                  </tr>
                ) : (
                  filteredMovimientos.map((m) => {
                    const anterior = Number(m.stockAnterior);
                    const posterior = Number(m.stockPosterior);
                    const diff = posterior - anterior;
                    return (
                      <tr key={m.id}>
                        <td><strong>#{m.id}</strong></td>
                        <td>{new Date(m.fecha).toLocaleString()}</td>
                        <td>
                          <span className={`movement-tag ${m.tipo}`}>
                            {m.tipo === 'ENTRADA' && '🟢 Entrada'}
                            {m.tipo === 'SALIDA' && '🔴 Salida'}
                            {m.tipo === 'AJUSTE' && '🟡 Ajuste'}
                          </span>
                        </td>
                        <td>
                          <strong>{m.inventario?.nombre || `Ítem #${m.inventarioId}`}</strong>
                        </td>
                        <td>
                          <strong>{m.cantidad} {m.inventario?.unidad}</strong>
                        </td>
                        <td>
                          <span style={{ color: '#6b7280' }}>{anterior}</span>
                          <span style={{ margin: '0 6px' }}>→</span>
                          <strong>{posterior}</strong>
                          <span
                            className={`stock-diff-chip ${diff >= 0 ? 'positive' : 'negative'}`}
                            style={{ marginLeft: '8px' }}
                          >
                            {diff >= 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)}
                          </span>
                        </td>
                        <td>
                          <span>{m.motivo || '—'}</span>
                          {m.compraId && (
                            <button
                              className="btn-row-action"
                              style={{ marginLeft: '6px', fontSize: '10.5px', padding: '2px 6px' }}
                              onClick={() => openDetalleCompraModal(m.compraId)}
                            >
                              Ver Compra #{m.compraId}
                            </button>
                          )}
                        </td>
                        <td>
                          {m.usuario ? (
                            <span style={{ fontSize: '12px' }}>
                              👤 {m.usuario.nombre} <small style={{ color: '#6b7280' }}>({m.usuario.rol})</small>
                            </span>
                          ) : (
                            <span style={{ color: '#9ca3af' }}>Sistema</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PESTAÑA 4: REGISTRO DE COMPRAS */}
        {activeTab === 'compras' && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID Compra</th>
                  <th>Fecha</th>
                  <th>Proveedor</th>
                  <th>Productos Comprados</th>
                  <th>Observación</th>
                  <th>Total Compra</th>
                  <th>Registrado Por</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {compras.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#6b7280' }}>
                      No se han registrado compras aún. Haz clic en "Registrar Compra" para abastecer stock.
                    </td>
                  </tr>
                ) : (
                  compras.map((c) => (
                    <tr key={c.id}>
                      <td><strong>#{c.id}</strong></td>
                      <td>{new Date(c.fecha).toLocaleString()}</td>
                      <td>
                        <strong>{c.proveedor?.nombre || 'Proveedor General'}</strong>
                        {c.proveedor?.telefono && <small style={{ display: 'block', color: '#6b7280' }}>📞 {c.proveedor.telefono}</small>}
                      </td>
                      <td>
                        <span style={{ fontSize: '12.5px' }}>
                          {c.detalles?.map((d) => `${d.cantidad}x ${d.inventario?.nombre}`).join(', ') || '—'}
                        </span>
                      </td>
                      <td>{c.observacion || '—'}</td>
                      <td>
                        <strong style={{ fontSize: '14.5px', color: '#16a34a' }}>
                          Bs. {Number(c.total).toFixed(2)}
                        </strong>
                      </td>
                      <td>
                        {c.usuario ? (
                          <span style={{ fontSize: '12px' }}>{c.usuario.nombre}</span>
                        ) : (
                          <span style={{ color: '#9ca3af' }}>—</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="secondary-btn"
                          style={{ padding: '5px 10px', fontSize: '12px' }}
                          onClick={() => openDetalleCompraModal(c.id)}
                        >
                          🔍 Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: REGISTRAR COMPRA / REPOSICIÓN MULTI-PRODUCTO                    */}
      {/* ========================================================================= */}
      {showCompraModal && (
        <div className="modal-backdrop">
          <div className="modal-card modal-lg">
            <div className="modal-header">
              <div>
                <h3>🛒 Registrar Compra / Reposición de Inventario</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6b7280' }}>
                  El stock de los productos se incrementará y se crearán los movimientos automáticamente.
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setShowCompraModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitCompra}>
              <div className="modal-body">
                {/* Cabecera de la compra */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Proveedor</label>
                    <select
                      className="form-select"
                      value={compraProveedorId}
                      onChange={(e) => setCompraProveedorId(e.target.value)}
                    >
                      <option value="">-- Proveedor General / Sin asignar --</option>
                      {proveedores.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre} {p.contacto ? `(${p.contacto})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Fecha y Hora de la Compra</label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      required
                      value={compraFecha}
                      onChange={(e) => setCompraFecha(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Observación / Nro. de Factura o Recibo</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej. Factura #4029 - Reposición semanal carnes y lácteos"
                    value={compraObservacion}
                    onChange={(e) => setCompraObservacion(e.target.value)}
                  />
                </div>

                {/* Tabla dinámica de productos comprados */}
                <div className="form-group" style={{ marginTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ margin: 0, fontWeight: '700' }}>Productos a Ingresar en la Compra</label>
                    <button
                      type="button"
                      className="secondary-btn"
                      style={{ padding: '4px 10px', fontSize: '12px' }}
                      onClick={handleAddCompraItemRow}
                    >
                      ➕ Agregar Fila
                    </button>
                  </div>

                  <div className="purchase-items-box">
                    <table className="purchase-items-table">
                      <thead>
                        <tr>
                          <th style={{ width: '40%' }}>Producto / Insumo</th>
                          <th style={{ width: '20%' }}>Cantidad</th>
                          <th style={{ width: '20%' }}>Precio Unit. (Bs.)</th>
                          <th style={{ width: '15%', textAlign: 'right' }}>Subtotal</th>
                          <th style={{ width: '5%' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {compraItems.map((row, idx) => {
                          const currentProd = inventario.find((i) => i.id === parseInt(row.inventarioId, 10));
                          const subtotal = (parseFloat(row.cantidad) || 0) * (parseFloat(row.precioUnitario) || 0);

                          return (
                            <tr key={idx}>
                              <td>
                                <select
                                  className="form-select"
                                  required
                                  value={row.inventarioId}
                                  onChange={(e) => handleCompraItemChange(idx, 'inventarioId', e.target.value)}
                                >
                                  <option value="">-- Seleccionar Insumo Existente --</option>
                                  {inventario.map((inv) => (
                                    <option key={inv.id} value={inv.id}>
                                      {inv.nombre} (Stock: {inv.stock} {inv.unidad})
                                    </option>
                                  ))}
                                </select>
                                {currentProd && (
                                  <div style={{ marginTop: '6px', padding: '6px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '11.5px', color: '#334155', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    <span>📦 Stock actual: <strong>{currentProd.stock} {currentProd.unidad}</strong></span>
                                    <span>⚠️ Mínimo: <strong>{currentProd.stockMinimo} {currentProd.unidad}</strong></span>
                                    <span>💵 Último costo: <strong>Bs. {Number(currentProd.precioCompra).toFixed(2)}</strong></span>
                                  </div>
                                )}
                              </td>
                              <td>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0.01"
                                  className="form-input"
                                  required
                                  placeholder="Cant."
                                  value={row.cantidad}
                                  onChange={(e) => handleCompraItemChange(idx, 'cantidad', e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  className="form-input"
                                  required
                                  placeholder="Precio Bs."
                                  value={row.precioUnitario}
                                  onChange={(e) => handleCompraItemChange(idx, 'precioUnitario', e.target.value)}
                                />
                              </td>
                              <td style={{ textAlign: 'right', fontWeight: '700' }}>
                                Bs. {subtotal.toFixed(2)}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                {compraItems.length > 1 && (
                                  <button
                                    type="button"
                                    style={{ color: '#dc2626', fontSize: '16px', background: 'none', cursor: 'pointer' }}
                                    title="Eliminar fila"
                                    onClick={() => handleRemoveCompraItemRow(idx)}
                                  >
                                    🗑️
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Tarjeta de Total */}
                <div className="purchase-total-card">
                  <div>
                    <span className="total-label">Total de la Compra ({compraItems.length} insumos):</span>
                  </div>
                  <div className="total-amount">
                    Bs. {totalCompraCalculado.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowCompraModal(false)}
                  disabled={compraSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-inv-action btn-purchase"
                  disabled={compraSubmitting || compraItems.length === 0}
                  style={{ padding: '10px 20px', fontSize: '14px' }}
                >
                  {compraSubmitting ? 'Guardando en BD...' : '💾 Guardar Compra y Actualizar Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ENTRADA MANUAL RÁPIDA                                           */}
      {/* ========================================================================= */}
      {showEntradaModal && selectedItemForAction && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>📥 Entrada Manual de Stock</h3>
              <button className="modal-close-btn" onClick={() => setShowEntradaModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmitEntrada}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Producto Seleccionado</label>
                  <select
                    className="form-select"
                    value={selectedItemForAction.id}
                    onChange={(e) => {
                      const found = inventario.find((i) => i.id === parseInt(e.target.value, 10));
                      if (found) setSelectedItemForAction(found);
                    }}
                  >
                    {inventario.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.nombre} (Stock actual: {i.stock} {i.unidad})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Cantidad a Ingresar ({selectedItemForAction.unidad})</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="form-input"
                    required
                    value={entradaCantidad}
                    onChange={(e) => setEntradaCantidad(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Motivo / Observación</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="Ej. Donación, sobrante de catering, reposición local..."
                    value={entradaMotivo}
                    onChange={(e) => setEntradaMotivo(e.target.value)}
                  />
                </div>

                {/* Previsualización del stock resultante */}
                <div style={{ background: '#ecfdf3', padding: '12px 16px', borderRadius: '8px', border: '1px solid #bbf7d0', marginTop: '14px' }}>
                  <div style={{ fontSize: '12.5px', color: '#166534' }}>
                    Stock actual: <strong>{selectedItemForAction.stock} {selectedItemForAction.unidad}</strong>
                  </div>
                  <div style={{ fontSize: '14px', color: '#15803d', fontWeight: '800', marginTop: '4px' }}>
                    Nuevo stock resultante: {(Number(selectedItemForAction.stock) + (parseFloat(entradaCantidad) || 0)).toFixed(2)} {selectedItemForAction.unidad}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary-btn" onClick={() => setShowEntradaModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="primary-btn">
                  Confirmar Entrada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: SALIDA / MERMA MANUAL                                           */}
      {/* ========================================================================= */}
      {showSalidaModal && selectedItemForAction && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>📤 Registrar Salida / Merma de Stock</h3>
              <button className="modal-close-btn" onClick={() => setShowSalidaModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmitSalida}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Producto Seleccionado</label>
                  <select
                    className="form-select"
                    value={selectedItemForAction.id}
                    onChange={(e) => {
                      const found = inventario.find((i) => i.id === parseInt(e.target.value, 10));
                      if (found) setSelectedItemForAction(found);
                    }}
                  >
                    {inventario.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.nombre} (Stock disponible: {i.stock} {i.unidad})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Cantidad a Retirar ({selectedItemForAction.unidad})</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={Number(selectedItemForAction.stock)}
                    className="form-input"
                    required
                    value={salidaCantidad}
                    onChange={(e) => setSalidaCantidad(e.target.value)}
                  />
                  {parseFloat(salidaCantidad) > Number(selectedItemForAction.stock) && (
                    <small style={{ color: '#dc2626', fontWeight: '600', display: 'block', marginTop: '4px' }}>
                      ⚠️ La cantidad excede el stock disponible ({selectedItemForAction.stock} {selectedItemForAction.unidad})
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label>Motivo de la Salida</label>
                  <select
                    className="form-select"
                    value={salidaMotivo}
                    onChange={(e) => setSalidaMotivo(e.target.value)}
                  >
                    <option value="Consumo / Elaboración en Cocina">Consumo / Elaboración en Cocina</option>
                    <option value="Merma por vencimiento">Merma por vencimiento</option>
                    <option value="Producto dañado / rotura">Producto dañado / rotura</option>
                    <option value="Degustación / Muestra">Degustación / Muestra</option>
                    <option value="Ajuste por pérdida">Ajuste por pérdida</option>
                  </select>
                </div>

                {/* Previsualización del stock resultante */}
                <div style={{ background: '#fef2f2', padding: '12px 16px', borderRadius: '8px', border: '1px solid #fecaca', marginTop: '14px' }}>
                  <div style={{ fontSize: '12.5px', color: '#991b1b' }}>
                    Stock actual: <strong>{selectedItemForAction.stock} {selectedItemForAction.unidad}</strong>
                  </div>
                  <div style={{ fontSize: '14px', color: '#b91c1c', fontWeight: '800', marginTop: '4px' }}>
                    Nuevo stock resultante: {Math.max(0, Number(selectedItemForAction.stock) - (parseFloat(salidaCantidad) || 0)).toFixed(2)} {selectedItemForAction.unidad}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary-btn" onClick={() => setShowSalidaModal(false)}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-inv-action btn-exit"
                  disabled={parseFloat(salidaCantidad) > Number(selectedItemForAction.stock)}
                >
                  Confirmar Salida
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: AJUSTE DE STOCK FÍSICO                                          */}
      {/* ========================================================================= */}
      {showAjusteModal && selectedItemForAction && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>⚖️ Ajustar Stock Físico (Conteo)</h3>
              <button className="modal-close-btn" onClick={() => setShowAjusteModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmitAjuste}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Producto a Ajustar</label>
                  <select
                    className="form-select"
                    value={selectedItemForAction.id}
                    onChange={(e) => {
                      const found = inventario.find((i) => i.id === parseInt(e.target.value, 10));
                      if (found) {
                        setSelectedItemForAction(found);
                        setAjusteNuevoStock(String(found.stock));
                      }
                    }}
                  >
                    {inventario.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.nombre} (Stock actual en sistema: {i.stock} {i.unidad})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Nuevo Stock Real ({selectedItemForAction.unidad})</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    required
                    value={ajusteNuevoStock}
                    onChange={(e) => setAjusteNuevoStock(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Motivo o Justificación del Ajuste (Obligatorio)</label>
                  <textarea
                    className="form-input"
                    rows="2"
                    required
                    placeholder="Ej. Conteo físico de inventario de fin de mes, diferencia por balanza..."
                    value={ajusteMotivo}
                    onChange={(e) => setAjusteMotivo(e.target.value)}
                  />
                </div>

                {/* Cálculo de la diferencia */}
                {(() => {
                  const ant = Number(selectedItemForAction.stock);
                  const post = parseFloat(ajusteNuevoStock) || 0;
                  const diff = post - ant;
                  return (
                    <div style={{ background: '#fffbeb', padding: '12px 16px', borderRadius: '8px', border: '1px solid #fde68a', marginTop: '14px' }}>
                      <div style={{ fontSize: '12.5px', color: '#78350f' }}>
                        Stock anterior: <strong>{ant} {selectedItemForAction.unidad}</strong>
                      </div>
                      <div style={{ fontSize: '13.5px', color: '#92400e', fontWeight: '800', marginTop: '4px' }}>
                        Diferencia a registrar: {diff >= 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)} {selectedItemForAction.unidad} ({diff >= 0 ? 'Excedente' : 'Faltante'})
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary-btn" onClick={() => setShowAjusteModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-inv-action btn-adjust">
                  Aplicar Ajuste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: NUEVO / EDITAR INSUMO                                           */}
      {/* ========================================================================= */}
      {showItemModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <h3>{editingItem ? '✏️ Editar Insumo' : '➕ Registrar Nuevo Insumo en Catálogo'}</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6b7280' }}>
                  {editingItem
                    ? 'Modifica los datos del producto registrado'
                    : 'Usa esta opción solo para productos NUEVOS que no existan todavía en el catálogo.'}
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setShowItemModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmitItem}>
              <div className="modal-body">
                {!editingItem && (
                  <div style={{ background: '#eff6ff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #bfdbfe', marginBottom: '16px', fontSize: '12.5px', color: '#1e40af' }}>
                    💡 <strong>Nota:</strong> Si este producto ya existe en el inventario y deseas comprar más unidades o reponer stock, cierra esta ventana y presiona <strong>🛒 Registrar Compra</strong>.
                  </div>
                )}
                <div className="form-group">
                  <label>Nombre del Producto / Insumo *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="Ej. Pechuga de Pollo Fresca"
                    value={itemNombre}
                    onChange={(e) => setItemNombre(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Descripción / Especificaciones</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej. Fileteada y envasada al vacío"
                    value={itemDescripcion}
                    onChange={(e) => setItemDescripcion(e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Categoría</label>
                    <select
                      className="form-select"
                      value={itemCategoriaId}
                      onChange={(e) => setItemCategoriaId(e.target.value)}
                    >
                      <option value="">-- Sin categoría --</option>
                      {categorias.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Unidad de Medida *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="kg, L, unidad, bolsa, caja, pack..."
                      value={itemUnidad}
                      onChange={(e) => setItemUnidad(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  {!editingItem && (
                    <div className="form-group">
                      <label>Stock Inicial *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-input"
                        required
                        value={itemStock}
                        onChange={(e) => setItemStock(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label>Stock Mínimo (Alerta) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-input"
                      required
                      value={itemStockMinimo}
                      onChange={(e) => setItemStockMinimo(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Precio de Compra Unit. (Bs.) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-input"
                      required
                      value={itemPrecioCompra}
                      onChange={(e) => setItemPrecioCompra(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Precio de Venta Sugerido (Bs.) (Opcional)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-input"
                      placeholder="Opcional"
                      value={itemPrecioVenta}
                      onChange={(e) => setItemPrecioVenta(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Proveedor Habitual</label>
                  <select
                    className="form-select"
                    value={itemProveedorId}
                    onChange={(e) => setItemProveedorId(e.target.value)}
                  >
                    <option value="">-- Sin proveedor predeterminado --</option>
                    {proveedores.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                  <input
                    type="checkbox"
                    id="chk-activo"
                    checked={itemActivo}
                    onChange={(e) => setItemActivo(e.target.checked)}
                  />
                  <label htmlFor="chk-activo" style={{ margin: 0, cursor: 'pointer' }}>
                    Producto Activo para Operaciones
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary-btn" onClick={() => setShowItemModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="primary-btn">
                  {editingItem ? 'Guardar Cambios' : 'Crear Insumo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: HISTORIAL DE MOVIMIENTOS DE UN PRODUCTO                         */}
      {/* ========================================================================= */}
      {showMovimientosItemModal && selectedItemForAction && (
        <div className="modal-backdrop">
          <div className="modal-card modal-lg">
            <div className="modal-header">
              <div>
                <h3>📜 Movimientos de "{selectedItemForAction.nombre}"</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6b7280' }}>
                  Stock Actual: <strong>{selectedItemForAction.stock} {selectedItemForAction.unidad}</strong> · Mínimo: {selectedItemForAction.stockMinimo} {selectedItemForAction.unidad}
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setShowMovimientosItemModal(false)}>
                ×
              </button>
            </div>

            <div className="modal-body" style={{ padding: 0 }}>
              <table className="purchase-items-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Cantidad</th>
                    <th>Stock Ant. → Post.</th>
                    <th>Motivo / Referencia</th>
                    <th>Usuario</th>
                  </tr>
                </thead>
                <tbody>
                  {itemMovimientosList.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>
                        No hay movimientos registrados para este insumo.
                      </td>
                    </tr>
                  ) : (
                    itemMovimientosList.map((m) => {
                      const ant = Number(m.stockAnterior);
                      const post = Number(m.stockPosterior);
                      const diff = post - ant;
                      return (
                        <tr key={m.id}>
                          <td>{new Date(m.fecha).toLocaleString()}</td>
                          <td>
                            <span className={`movement-tag ${m.tipo}`}>
                              {m.tipo}
                            </span>
                          </td>
                          <td><strong>{m.cantidad} {selectedItemForAction.unidad}</strong></td>
                          <td>
                            {ant} → <strong>{post}</strong>
                            <span
                              className={`stock-diff-chip ${diff >= 0 ? 'positive' : 'negative'}`}
                              style={{ marginLeft: '6px' }}
                            >
                              {diff >= 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)}
                            </span>
                          </td>
                          <td>{m.motivo || '—'}</td>
                          <td>{m.usuario?.nombre || 'Sistema'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="modal-footer">
              <button type="button" className="secondary-btn" onClick={() => setShowMovimientosItemModal(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: DETALLE DE COMPRA REALIZADA                                     */}
      {/* ========================================================================= */}
      {showDetalleCompraModal && selectedCompraDetail && (
        <div className="modal-backdrop">
          <div className="modal-card modal-lg">
            <div className="modal-header">
              <div>
                <h3>🧾 Comprobante de Compra #{selectedCompraDetail.id}</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6b7280' }}>
                  Fecha: {new Date(selectedCompraDetail.fecha).toLocaleString()}
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setShowDetalleCompraModal(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '14px', borderRadius: '10px', marginBottom: '16px' }}>
                <div>
                  <small style={{ color: '#64748b' }}>PROVEEDOR</small>
                  <div style={{ fontWeight: '700' }}>{selectedCompraDetail.proveedor?.nombre || 'Sin asignar / General'}</div>
                  {selectedCompraDetail.proveedor?.telefono && <small>📞 {selectedCompraDetail.proveedor.telefono}</small>}
                </div>
                <div>
                  <small style={{ color: '#64748b' }}>REGISTRADO POR</small>
                  <div style={{ fontWeight: '700' }}>{selectedCompraDetail.usuario?.nombre || 'Usuario del Sistema'}</div>
                  <small style={{ color: '#64748b' }}>Rol: {selectedCompraDetail.usuario?.rol || 'ADMIN'}</small>
                </div>
                {selectedCompraDetail.observacion && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <small style={{ color: '#64748b' }}>OBSERVACIÓN / FACTURA</small>
                    <div>{selectedCompraDetail.observacion}</div>
                  </div>
                )}
              </div>

              <h4>Detalle de Productos Comprados</h4>
              <div className="purchase-items-box">
                <table className="purchase-items-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio Unitario</th>
                      <th style={{ textAlign: 'right' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCompraDetail.detalles?.map((d) => (
                      <tr key={d.id}>
                        <td>
                          <strong>{d.inventario?.nombre || `Insumo #${d.inventarioId}`}</strong>
                        </td>
                        <td>{d.cantidad} {d.inventario?.unidad}</td>
                        <td>Bs. {Number(d.precioUnitario).toFixed(2)}</td>
                        <td style={{ textAlign: 'right', fontWeight: '700' }}>
                          Bs. {Number(d.subtotal).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="purchase-total-card" style={{ marginTop: '16px' }}>
                <span className="total-label">Total Facturado de la Compra:</span>
                <span className="total-amount">Bs. {Number(selectedCompraDetail.total).toFixed(2)}</span>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="secondary-btn" onClick={() => setShowDetalleCompraModal(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 9. PERSONAL & ROLES VIEW
// ==========================================
function PersonalView({ refreshTrigger, currentUser, onSwitchUser, onRefresh, addToast }) {
  const [usuarios, setUsuarios] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('MESERO');

  useEffect(() => {
    api
      .getUsuarios()
      .then((res) => setUsuarios(res.data))
      .catch((err) => addToast(err.message, 'error'));
  }, [refreshTrigger]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createUsuario({ nombre, email, password, rol });
      addToast('Usuario registrado correctamente');
      setShowAddModal(false);
      setNombre('');
      setEmail('');
      setPassword('');
      onRefresh();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2>Equipo y Roles del Restaurante</h2>
          <p>Control de acceso (ADMIN, MESERO, COCINERO, CAJERO)</p>
        </div>
        <button className="primary-btn" onClick={() => setShowAddModal(true)}>
          ➕ Nuevo Usuario
        </button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol Asignado</th>
              <th>Estado</th>
              <th>Sesión Activa</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>#{u.id}</td>
                <td><strong>{u.nombre}</strong></td>
                <td>{u.email}</td>
                <td>
                  <span className="status served">{u.rol}</span>
                </td>
                <td>
                  <span className={`status ${u.activo ? 'paid' : 'cancelled'}`}>
                    {u.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  {currentUser.id === u.id ? (
                    <span className="status paid">⭐ Sesión Actual</span>
                  ) : (
                    <button
                      className="secondary-btn"
                      style={{ padding: '4px 8px', fontSize: '11px' }}
                      onClick={() => {
                        onSwitchUser(u);
                        addToast(`Has cambiado a la sesión de ${u.nombre} (${u.rol})`);
                      }}
                    >
                      🔄 Cambiar a este usuario
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Registrar Usuario</h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nombre Completo</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="Ej. Juan Pérez"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Email de Acceso</label>
                  <input
                    type="email"
                    className="form-input"
                    required
                    placeholder="Ej. mesero@restaurante.local"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Contraseña</label>
                  <input
                    type="password"
                    className="form-input"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Rol</label>
                  <select className="form-select" value={rol} onChange={(e) => setRol(e.target.value)}>
                    <option value="ADMIN">ADMIN</option>
                    <option value="MESERO">MESERO</option>
                    <option value="COCINERO">COCINERO</option>
                    <option value="CAJERO">CAJERO</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="secondary-btn" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="primary-btn">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
