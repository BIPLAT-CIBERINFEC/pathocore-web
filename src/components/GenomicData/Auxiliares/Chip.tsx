export default function Chip({ item }: any) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "#f1f5f9",
        padding: "10px 14px",
        borderRadius: 12,
        minWidth: 220,
        justifyContent: "space-between",
      }}
    >
      
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
            maxWidth: 160,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.label}
        </span>
      </div>

      <span style={{ fontWeight: 600 }}>{item.value}</span>
    </div>
  );
}
