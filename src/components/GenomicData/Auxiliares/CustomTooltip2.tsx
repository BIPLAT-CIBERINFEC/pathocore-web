export default function CustomTooltip2({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        padding: "10px 12px",
        borderRadius: 6,
        fontSize: 13,
      }}
    >
      <div style={{ marginBottom: 4 }}>{label}</div>
      <div style={{ color: "#1f7a6b" }}>
        value : <b>{payload[0].value}</b>
      </div>
    </div>
  );
}
