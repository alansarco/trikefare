export default function FixedLoading() {
  return (
    <div
      className="position-fixed"
      style={{
        zIndex: 9999,
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#eeeeee00",
      }}
    >
      <div style={{ position: "relative", width: 80, height: 80 }}>
        {/* Circular spinner border */}
        <div
          className="spinner-border text-warning"
          style={{
            width: "100%",
            height: "100%",
            borderWidth: "7px",
            position: "absolute",
            top: 0,
            left: 0,
            borderRadius: "50%",
            boxSizing: "border-box",
          }}
          role="status"
        >
          <span className="visually-hidden">Loading...</span>
        </div>

        {/* Logo in center */}
        <img
          src="/logo_load.png" // Replace this with your actual logo path
          alt="Logo"
          style={{
            width: 60,
            height: 60,
            objectFit: "contain",
            position: "absolute",
            borderRadius: "50%",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>
    </div>
  );
}
