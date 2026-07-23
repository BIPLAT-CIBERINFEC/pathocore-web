export default function SchemaChip({ item }: any) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "#f1f5f9",
        padding: "12px 18px",
        borderRadius: 14,
        minWidth: 260, 
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: item.color,
          }}
        />
        <span
          style={{
            fontSize: 14,
            color: "#334155",
          }}
        >
          {item.label}
        </span>
      </div>

      <span style={{ fontWeight: 600 }}>{item.value}</span>
    </div>
  );
}
