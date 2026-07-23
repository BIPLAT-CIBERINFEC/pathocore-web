export default function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        padding: "10px 12px",
        borderRadius: 6,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        fontSize: 13,
      }}
    >
      <div style={{ marginBottom: 4 }}>{label}</div>
      <div style={{ color: "#0f766e" }}>
        value : <b>{payload[0].value}</b>
      </div>
    </div>
  );
}
