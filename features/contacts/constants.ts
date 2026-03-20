export const contactTypeValues = ["customer", "supplier", "both"] as const;

export const identificationTypeValues = ["01", "02", "03", "04", "05"] as const;

export const contactTypeOptions = [
  { label: "Cliente", value: "customer" },
  { label: "Proveedor", value: "supplier" },
  { label: "Ambos", value: "both" },
] as const;

export const identificationTypeOptions = [
  { label: "01 - Cedula fisica", value: "01" },
  { label: "02 - Cedula juridica", value: "02" },
  { label: "03 - DIMEX", value: "03" },
  { label: "04 - NITE", value: "04" },
  { label: "05 - Extranjero", value: "05" },
] as const;

const identificationTypeLabelMap: Record<string, string> = {
  "01": "Cedula fisica",
  "02": "Cedula juridica",
  "03": "DIMEX",
  "04": "NITE",
  "05": "Extranjero",
  dimex: "DIMEX",
  extranjero: "Extranjero",
  fisica: "Cedula fisica",
  juridica: "Cedula juridica",
  legal: "Cedula juridica",
  nite: "NITE",
};

const contactTypeLabelMap: Record<string, string> = {
  both: "Ambos",
  customer: "Cliente",
  supplier: "Proveedor",
};

export function getContactTypeLabel(type?: string | null) {
  if (!type) {
    return "Sin tipo";
  }

  return contactTypeLabelMap[type] ?? type;
}

export function getIdentificationTypeLabel(value?: string | null) {
  if (!value) {
    return "Sin tipo";
  }

  return identificationTypeLabelMap[value] ?? value;
}
