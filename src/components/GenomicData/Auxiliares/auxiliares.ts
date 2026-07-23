export const limpiarTexto = (texto: string): string => {
  if (!texto) return "";
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") 
    .replace(/comunidad de /g, "")
    .replace(/comunitat /g, "")
    .replace(/principado de /g, "")
    .replace(/region de /g, "")
    .replace(/islas /g, "")
    .replace(/illes /g, "")
    .trim();
};
