export const convertToISO = (dateStr: string): string => {
  const parts = dateStr.trim().split("/");
  if (parts.length === 3) {
    const day = parts[0].padStart(2, "0");
    const month = parts[1].padStart(2, "0");
    const year = parts[2];
    return `${year}-${month}-${day}T00:00:00-03:00`;
  }
  return dateStr;
};

export const convertToBrazilian = (isoStr: string): string => {
  if (!isoStr) return "";
  try {
    const datePart = isoStr.split("T")[0];
    const parts = datePart.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  } catch (e) {
    // fallback
  }
  return isoStr;
};
