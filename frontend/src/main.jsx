
import React from "react";
import ReactDOM from "react-dom/client";
import "./style.css";

const stats = [
  { icon: "💰", title: "Ventas del día", value: "Bs 163", detail: "+12,5%" },
  { icon: "🧾", title: "Pedidos", value: "12", detail: "+3 hoy" },
  { icon: "🪑", title: "Mesas ocupadas", value: "5 / 20", detail: "25% ocupación" },
  { icon: "👥", title: "Clientes", value: "32", detail: "+4 nuevos" },
];

const orders = [
  { id: "#1008", table: "Mesa 05", customer: "Cliente general", total: "Bs 42,50", status: "En preparación" },
  { id: "#1007", table: "Mesa 12", customer: "María López", total: "Bs 35,00", status: "Servido" },
  { id: "#1006", table: "Mesa 03", customer: "Carlos Pérez", total: "Bs 31,50", status: "Pendiente" },
  { id: "#1005", table: "Mesa 08", customer: "Ana García", total: "Bs 54,00", status: "Pagado" },
];

const tables = [
  { number: 1, seats: 4, status: "Libre" },
  { number: 2, seats: 2, status: "Ocupada" },
  { number: 3, seats: 4, status: "Ocupada" },
  { number: 4, seats: 6, status: "Libre" },
  { number: 5, seats: 4, status: "Ocupada" },
  { number: 6, seats: 2, status: "Reservada" },
];

function App() {
  return (
    <div className="app">

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">🍽️</div>
          <div>
            <strong>RESTAURANTE</strong>
            <span>SIS</span>
          </div>
        </div>

        <nav>
          <p className="nav-title">MENÚ PRINCIPAL</p>

          <a className="nav-item active">
            <span>🏠</span>
            Dashboard
          </a>

          <a className="nav-item">
            <span>🪑</span>
            Mesas
          </a>

          <a className="nav-item">
            <span>🧾</span>
            Pedidos
          </a>

          <a className="nav-item">
            <span>🍔</span>
            Productos
          </a>

          <a className="nav-item">
            <span>👥</span>
            Clientes
          </a>

          <p className="nav-title secondary-title">GESTIÓN</p>

          <a className="nav-item">
            <span>📊</span>
            Reportes
          </a>

          <a className="nav-item">
            <span>👨‍🍳</span>
            Personal
          </a>

          <a className="nav-item">
            <span>⚙️</span>
            Configuración
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="user-avatar">F</div>
          <div>
            <strong>Administrador</strong>
            <small>Administrador</small>
          </div>
          <span className="logout">↪</span>
        </div>
      </aside>

      <main className="content">

        <header className="topbar">
          <div>
            <h1>Dashboard</h1>
            <p>Bienvenido al sistema de gestión del restaurante.</p>
          </div>

          <div className="topbar-actions">
            <button className="icon-button">🔔</button>

            <div className="date-box">
              📅
              <span>Hoy, 10 de septiembre</span>
            </div>
          </div>
        </header>

        <section className="stats-grid">
          {stats.map((stat) => (
            <div className="stat-card" key={stat.title}>
              <div className="stat-top">
                <div className="stat-icon">{stat.icon}</div>
                <span className="stat-detail">{stat.detail}</span>
              </div>

              <p>{stat.title}</p>
              <h2>{stat.value}</h2>
            </div>
          ))}
        </section>

        <section className="dashboard-grid">

          <div className="panel orders-panel">
            <div className="panel-header">
              <div>
                <h2>Pedidos recientes</h2>
                <p>Últimos pedidos registrados</p>
              </div>

              <button className="outline-button">Ver todos →</button>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>PEDIDO</th>
                    <th>MESA</th>
                    <th>CLIENTE</th>
                    <th>TOTAL</th>
                    <th>ESTADO</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="order-id">{order.id}</td>
                      <td>{order.table}</td>
                      <td>{order.customer}</td>
                      <td className="total">{order.total}</td>
                      <td>
                        <span
                          className={`status ${
                            order.status === "Pagado"
                              ? "paid"
                              : order.status === "Servido"
                              ? "served"
                              : order.status === "En preparación"
                              ? "preparing"
                              : "pending"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel quick-panel">
            <div className="panel-header">
              <div>
                <h2>Acciones rápidas</h2>
                <p>Operaciones frecuentes</p>
              </div>
            </div>

            <div className="quick-actions">
              <button>
                <span>➕</span>
                <div>
                  <strong>Nuevo pedido</strong>
                  <small>Registrar un pedido</small>
                </div>
              </button>

              <button>
                <span>🍔</span>
                <div>
                  <strong>Nuevo producto</strong>
                  <small>Agregar al menú</small>
                </div>
              </button>

              <button>
                <span>👤</span>
                <div>
                  <strong>Nuevo cliente</strong>
                  <small>Registrar cliente</small>
                </div>
              </button>

              <button>
                <span>📊</span>
                <div>
                  <strong>Ver reportes</strong>
                  <small>Consultar estadísticas</small>
                </div>
              </button>
            </div>
          </div>

        </section>

        <section className="panel tables-panel">

          <div className="panel-header">
            <div>
              <h2>Estado de mesas</h2>
              <p>Situación actual del salón</p>
            </div>

            <div className="legend">
              <span><i className="dot free"></i> Libre</span>
              <span><i className="dot busy"></i> Ocupada</span>
              <span><i className="dot reserved"></i> Reservada</span>
            </div>
          </div>

          <div className="tables-grid">
            {tables.map((table) => (
              <div
                className={`table-card ${
                  table.status === "Libre"
                    ? "table-free"
                    : table.status === "Ocupada"
                    ? "table-busy"
                    : "table-reserved"
                }`}
                key={table.number}
              >
                <div className="table-number">Mesa {table.number}</div>
                <div className="table-symbol">🪑</div>
                <strong>{table.status}</strong>
                <small>{table.seats} personas</small>
              </div>
            ))}
          </div>

        </section>

        <footer>
          RESTAURANTE-SIS · Sistema de gestión de restaurante
        </footer>

      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

