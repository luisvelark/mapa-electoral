export default function MaintenancePage() {
  return (
    <main style={{
      display: "flex",
      height: "100vh",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      textAlign: "center",
      fontFamily: "sans-serif"
    }}>
      <h1 style={{ fontSize: "2rem" }}>🚧 Estamos en mantenimiento</h1>
      <p style={{ marginTop: "10px" }}>
        Estamos trabajando para solucionar un problema.  
        Por favor vuelve en unos minutos.
      </p>
    </main>
  );
}
