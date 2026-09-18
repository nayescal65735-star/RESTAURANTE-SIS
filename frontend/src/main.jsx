import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import { api } from "./services/api";

const emptyClient = { nombre: "", telefono: "", email: "" };
const emptyReservation = { clienteId: "", mesaId: "", fecha: "", hora: "", cantidad: "1", observacion: "" };

function Feedback({ loading, error, success }) {
  if (loading) return <p className="feedback">Cargando...</p>;
  if (error) return <p className="feedback error">{error}</p>;
  if (success) return <p className="feedback success">{success}</p>;
  return null;
}

function Dashboard({ clients, reservations, orders, mesas }) {
  const occupied = mesas.filter((mesa) => mesa.estado === "OCUPADA").length;
  const total = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  return (
    <>
      <header className="topbar"><div><h1>Dashboard</h1><p>Datos actuales de PostgreSQL.</p></div></header>
      <section className="stats-grid">
        <div className="stat-card"><p>Ventas/pedidos registrados</p><h2>Bs {total.toFixed(2)}</h2></div>
        <div className="stat-card"><p>Pedidos</p><h2>{orders.length}</h2></div>
        <div className="stat-card"><p>Mesas ocupadas</p><h2>{occupied} / {mesas.length}</h2></div>
        <div className="stat-card"><p>Clientes</p><h2>{clients.length}</h2></div>
      </section>
      <section className="dashboard-grid">
        <div className="panel"><div className="panel-header"><div><h2>Pedidos recientes</h2><p>Consultados desde la API</p></div></div>
          {orders.length === 0 ? <p className="empty">No hay pedidos registrados.</p> : <div className="table-wrapper"><table><thead><tr><th>ID</th><th>Mesa</th><th>Cliente</th><th>Total</th><th>Estado</th></tr></thead><tbody>{orders.slice(0, 8).map((order) => <tr key={order.id}><td>#{order.id}</td><td>{order.mesa ? `Mesa ${order.mesa.numero}` : "-"}</td><td>{order.cliente?.nombre || "General"}</td><td>Bs {Number(order.total).toFixed(2)}</td><td>{order.estado}</td></tr>)}</tbody></table></div>}
        </div>
        <div className="panel"><div className="panel-header"><div><h2>Próximas reservas</h2><p>Horarios activos</p></div></div>{reservations.length === 0 ? <p className="empty">No hay reservas registradas.</p> : reservations.slice(0, 5).map((reservation) => <div className="list-row" key={reservation.id}><strong>{reservation.cliente.nombre}</strong><span>Mesa {reservation.mesa.numero} · {new Date(reservation.fecha).toLocaleString()}</span></div>)}</div>
      </section>
    </>
  );
}

function Clients({ onChanged }) {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(emptyClient);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    setLoading(true);
    try { setClients(await api.get("/api/clientes")); } catch (err) { setError(err.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  function change(event) { setForm({ ...form, [event.target.name]: event.target.value }); }
  async function submit(event) {
    event.preventDefault(); setError(""); setSuccess(""); setLoading(true);
    try {
      if (editingId) await api.put(`/api/clientes/${editingId}`, form);
      else await api.post("/api/clientes", form);
      setForm(emptyClient); setEditingId(null); setSuccess(editingId ? "Cliente actualizado correctamente." : "Cliente registrado correctamente.");
      await load(); onChanged();
    } catch (err) { setError(err.message); setLoading(false); }
  }
  async function remove(id) {
    if (!window.confirm("¿Eliminar este cliente?")) return;
    setError(""); setSuccess("");
    try { await api.delete(`/api/clientes/${id}`); setSuccess("Cliente eliminado correctamente."); await load(); onChanged(); } catch (err) { setError(err.message); }
  }
  return <section className="content-section"><header className="topbar"><div><h1>Clientes</h1><p>Registra y administra clientes reales.</p></div></header>
    <div className="form-panel"><h2>{editingId ? "Editar cliente" : "Nuevo cliente"}</h2><form onSubmit={submit} className="form-grid">{["nombre", "telefono", "email"].map((field) => <label key={field}>{field[0].toUpperCase() + field.slice(1)}<input name={field} type={field === "email" ? "email" : "text"} value={form[field]} onChange={change} required /></label>)}<button className="primary-button" type="submit">{editingId ? "Guardar cambios" : "Registrar cliente"}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyClient); }}>Cancelar</button>}</form><Feedback loading={loading && clients.length > 0} error={error} success={success} /></div>
    <div className="panel"><div className="panel-header"><h2>Clientes registrados</h2></div>{loading && clients.length === 0 ? <p className="empty">Cargando clientes...</p> : clients.length === 0 ? <p className="empty">No hay clientes registrados.</p> : <div className="table-wrapper"><table><thead><tr><th>Nombre</th><th>Teléfono</th><th>Email</th><th>Acciones</th></tr></thead><tbody>{clients.map((client) => <tr key={client.id}><td>{client.nombre}</td><td>{client.telefono}</td><td>{client.email}</td><td><button onClick={() => { setEditingId(client.id); setForm({ nombre: client.nombre, telefono: client.telefono, email: client.email }); }}>Editar</button> <button onClick={() => remove(client.id)}>Eliminar</button></td></tr>)}</tbody></table></div>}</div>
  </section>;
}

function Reservations({ clients, mesas, onChanged }) {
  const [reservations, setReservations] = useState([]);
  const [form, setForm] = useState(emptyReservation);
  const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [success, setSuccess] = useState("");
  async function load() { setLoading(true); try { setReservations(await api.get("/api/reservas")); } catch (err) { setError(err.message); } finally { setLoading(false); } }
  useEffect(() => { load(); }, []);
  function change(event) { setForm({ ...form, [event.target.name]: event.target.value }); }
  async function submit(event) { event.preventDefault(); setError(""); setSuccess(""); setLoading(true); try { await api.post("/api/reservas", form); setForm(emptyReservation); setSuccess("Reserva registrada correctamente."); await load(); onChanged(); } catch (err) { setError(err.message); setLoading(false); } }
  return <section className="content-section"><header className="topbar"><div><h1>Reservas</h1><p>Verifica disponibilidad y capacidad antes de guardar.</p></div></header>
    <div className="form-panel"><h2>Nueva reserva</h2><form onSubmit={submit} className="form-grid"><label>Cliente<select name="clienteId" value={form.clienteId} onChange={change} required><option value="">Seleccionar cliente</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.nombre}</option>)}</select></label><label>Mesa<select name="mesaId" value={form.mesaId} onChange={change} required><option value="">Seleccionar mesa</option>{mesas.map((mesa) => <option key={mesa.id} value={mesa.id}>Mesa {mesa.numero} ({mesa.capacidad} personas)</option>)}</select></label><label>Fecha<input name="fecha" type="date" value={form.fecha} onChange={change} required /></label><label>Hora<input name="hora" type="time" value={form.hora} onChange={change} required /></label><label>Personas<input name="cantidad" type="number" min="1" value={form.cantidad} onChange={change} required /></label><label>Observación<input name="observacion" value={form.observacion} onChange={change} /></label><button className="primary-button" type="submit">Registrar reserva</button></form><Feedback loading={loading && reservations.length > 0} error={error} success={success} /></div>
    <div className="panel"><div className="panel-header"><h2>Reservas registradas</h2></div>{loading && reservations.length === 0 ? <p className="empty">Cargando reservas...</p> : reservations.length === 0 ? <p className="empty">No hay reservas registradas.</p> : <div className="table-wrapper"><table><thead><tr><th>Cliente</th><th>Mesa</th><th>Fecha</th><th>Personas</th><th>Estado</th></tr></thead><tbody>{reservations.map((reservation) => <tr key={reservation.id}><td>{reservation.cliente.nombre}</td><td>Mesa {reservation.mesa.numero}</td><td>{new Date(reservation.fecha).toLocaleString()}</td><td>{reservation.cantidad}</td><td>{reservation.estado}</td></tr>)}</tbody></table></div>}</div>
  </section>;
}

function Orders({ clients, mesas, platos, onChanged }) {
  const [orders, setOrders] = useState([]); const [mesaId, setMesaId] = useState(""); const [clienteId, setClienteId] = useState(""); const [items, setItems] = useState([{ platoId: "", cantidad: 1 }]); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [success, setSuccess] = useState("");
  async function load() { setLoading(true); try { setOrders(await api.get("/api/pedidos")); } catch (err) { setError(err.message); } finally { setLoading(false); } }
  useEffect(() => { load(); }, []);
  const total = useMemo(() => items.reduce((sum, item) => { const plato = platos.find((value) => value.id === Number(item.platoId)); return sum + (plato ? Number(plato.precio) * Number(item.cantidad || 0) : 0); }, 0), [items, platos]);
  function updateItem(index, key, value) { setItems(items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item)); }
  async function submit(event) { event.preventDefault(); setError(""); setSuccess(""); setLoading(true); try { await api.post("/api/pedidos", { mesaId: mesaId || null, clienteId: clienteId || null, detalles: items }); setMesaId(""); setClienteId(""); setItems([{ platoId: "", cantidad: 1 }]); setSuccess("Pedido registrado correctamente."); await load(); onChanged(); } catch (err) { setError(err.message); setLoading(false); } }
  return <section className="content-section"><header className="topbar"><div><h1>Pedidos</h1><p>El total se calcula en el backend con precios de PostgreSQL.</p></div></header>
    <div className="form-panel"><h2>Nuevo pedido</h2><form onSubmit={submit} className="form-grid"><label>Mesa<select value={mesaId} onChange={(event) => setMesaId(event.target.value)}><option value="">Sin mesa</option>{mesas.map((mesa) => <option key={mesa.id} value={mesa.id}>Mesa {mesa.numero}</option>)}</select></label><label>Cliente<select value={clienteId} onChange={(event) => setClienteId(event.target.value)}><option value="">Cliente general</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.nombre}</option>)}</select></label><div className="items-field"><strong>Platos</strong>{items.map((item, index) => <div className="item-row" key={index}><select value={item.platoId} onChange={(event) => updateItem(index, "platoId", event.target.value)} required><option value="">Seleccionar plato</option>{platos.map((plato) => <option key={plato.id} value={plato.id}>{plato.nombre} · Bs {Number(plato.precio).toFixed(2)}</option>)}</select><input type="number" min="1" value={item.cantidad} onChange={(event) => updateItem(index, "cantidad", event.target.value)} required />{items.length > 1 && <button type="button" onClick={() => setItems(items.filter((_, itemIndex) => itemIndex !== index))}>Quitar</button>}</div>)}<button type="button" onClick={() => setItems([...items, { platoId: "", cantidad: 1 }])}>Agregar plato</button></div><strong>Total estimado: Bs {total.toFixed(2)}</strong><button className="primary-button" type="submit">Registrar pedido</button></form><Feedback loading={loading && orders.length > 0} error={error} success={success} /></div>
    <div className="panel"><div className="panel-header"><h2>Pedidos registrados</h2></div>{loading && orders.length === 0 ? <p className="empty">Cargando pedidos...</p> : orders.length === 0 ? <p className="empty">No hay pedidos registrados.</p> : <div className="table-wrapper"><table><thead><tr><th>ID</th><th>Mesa</th><th>Cliente</th><th>Total</th><th>Estado</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td>#{order.id}</td><td>{order.mesa ? `Mesa ${order.mesa.numero}` : "-"}</td><td>{order.cliente?.nombre || "General"}</td><td>Bs {Number(order.total).toFixed(2)}</td><td>{order.estado}</td></tr>)}</tbody></table></div>}</div>
  </section>;
}

function App() {
  const [view, setView] = useState("dashboard"); const [clients, setClients] = useState([]); const [reservations, setReservations] = useState([]); const [orders, setOrders] = useState([]); const [mesas, setMesas] = useState([]); const [platos, setPlatos] = useState([]); const [error, setError] = useState("");
  async function refresh() { try { const [clientsData, reservationsData, ordersData, mesasData, platosData] = await Promise.all([api.get("/api/clientes"), api.get("/api/reservas"), api.get("/api/pedidos"), api.get("/api/mesas"), api.get("/api/platos")]); setClients(clientsData); setReservations(reservationsData); setOrders(ordersData); setMesas(mesasData); setPlatos(platosData); } catch (err) { setError(err.message); } }
  useEffect(() => { refresh(); }, []);
  const links = [["dashboard", "🏠 Dashboard"], ["reservas", "📅 Reservas"], ["pedidos", "🧾 Pedidos"], ["clientes", "👥 Clientes"]];
  return <div className="app"><aside className="sidebar"><div className="brand"><div className="brand-icon">🍽️</div><div><strong>RESTAURANTE</strong><span>SIS</span></div></div><nav><p className="nav-title">MENÚ PRINCIPAL</p>{links.map(([key, label]) => <button key={key} className={`nav-item ${view === key ? "active" : ""}`} onClick={() => setView(key)}>{label}</button>)}</nav><div className="sidebar-footer"><div className="user-avatar">A</div><div><strong>Administrador</strong><small>Sesión local</small></div></div></aside><main className="content">{error && <p className="feedback error">{error}</p>}{view === "dashboard" && <Dashboard clients={clients} reservations={reservations} orders={orders} mesas={mesas} />}{view === "clientes" && <Clients onChanged={refresh} />}{view === "reservas" && <Reservations clients={clients} mesas={mesas} onChanged={refresh} />}{view === "pedidos" && <Orders clients={clients} mesas={mesas} platos={platos} onChanged={refresh} />}</main></div>;
}

ReactDOM.createRoot(document.getElementById("root")).render(<React.StrictMode><App /></React.StrictMode>);
