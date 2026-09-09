import React from "react";
import ReactDOM from "react-dom/client";

function App() {
  return (
    <main>
      <h1>RESTAURANTE-SIS</h1>
      <p>Sistema de gestión de restaurante</p>
      <p>Frontend funcionando correctamente.</p>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
