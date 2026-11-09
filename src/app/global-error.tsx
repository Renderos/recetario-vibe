"use client";

// Último recurso: reemplaza el layout raíz si este falla
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="es">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#faf6ef", color: "#1f1a16" }}>
        <div style={{ maxWidth: 480, margin: "15vh auto", padding: 16, textAlign: "center" }}>
          <h1>La aplicación tuvo un problema</h1>
          <p>Intenta recargar la página.</p>
          <button
            onClick={() => retry()}
            style={{ marginTop: 16, padding: "10px 20px", borderRadius: 999, border: 0, background: "#c2410c", color: "#fff", fontWeight: 600 }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
