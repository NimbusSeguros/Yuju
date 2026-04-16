export type CoverageCategory = 'Responsabilidad Civil' | 'Terceros Completo' | 'Terceros Completo Full' | 'Todo Riesgo';

const COMPANY_DISCOUNTS: Record<string, Record<string, number>> = {
  rus: { rc: 0.85, terceros: 0.8, tercerosCompleto: 0.7, todoRiesgo: 0.7 },
  "san cristóbal": { rc: 0.85, terceros: 0.8, tercerosCompleto: 0.7, todoRiesgo: 0.7 },
  experta: { rc: 0.85, terceros: 0.8, tercerosCompleto: 0.7, todoRiesgo: 0.7 },
  "mercantil andina": { rc: 0.85, terceros: 0.8, tercerosCompleto: 0.7, todoRiesgo: 0.7 },
  integrity: { rc: 0.85, terceros: 0.8, tercerosCompleto: 0.7, todoRiesgo: 0.7 },
  atm: { rc: 0.85, terceros: 0.8, tercerosCompleto: 0.7, todoRiesgo: 0.7 },
  meridional: { rc: 0.85, terceros: 0.8, tercerosCompleto: 0.7, todoRiesgo: 0.7 },
};

const COVERAGE_FILTERS: any = {
  rus: {
    rc: { include: ["rca s/grua", "s/grua", "sin grua"], exclude: ["con grua", "c/grua", "c/ grua"] },
    terceros: { include: ["b1", "robo e incendio total"], exclude: [] },
    tercerosCompleto: { include: ["tercero completo full (s0)", "tercero completo full", "full (s0)", "s0", "s - sigma", "sigma"], exclude: [] },
    todoRiesgo: { include: ["tr franquicia del 2%", "franquicia del 2%", "2%", "t31 5% de la sa (t31)", "t31", "5% de la sa"], exclude: ["1.5%", "3%", "10%"] },
  },
  integrity: {
    rc: { include: ["0064"], exclude: [] },
    terceros: { include: ["0050"], exclude: [] },
    tercerosCompleto: { include: ["0054", "0053"], exclude: [] },
    todoRiesgo: { include: ["0045"], exclude: [] },
  },
  "san cristóbal": {
    rc: { include: ["cobertura a", "ca7_a"], exclude: ["b1", "b3", "cobertura b", "terceros", "todo riesgo"] },
    terceros: { include: ["cobertura b1", "ca7_b1", "b1"], exclude: ["b3", "ca7_b3", "cobertura b3"] },
    tercerosCompleto: { include: ["terceros completos premium", "ca7_cm", "cm", "premium"], exclude: ["c4", "ca7_c4", "terceros completos c4", "ca7_c1", "ca7_c ", "cplus", "ca7_cplus", "terceros completos plus"] },
    todoRiesgo: { include: ["todo riesgo", "ca7_d"], exclude: [] },
  },
  experta: {
    rc: { include: ["e", "responsabilidad civil"], exclude: ["completo", "granizo"] },
    terceros: { include: ["b"], exclude: ["completo", "xl", "granizo"] },
    tercerosCompleto: { include: ["terceros completo xl", "tercero completo xl", "completo xl"], exclude: ["granizo"] },
    todoRiesgo: { include: ["todo riesgo xl - 2%", "todo riesgo xl - 5%", "todo riesgo xl – franquicia 2 %", "todo riesgo xl – franquicia 5 %", "franquicia 2 %", "franquicia 5 %"], exclude: [] },
  },
  "mercantil andina": {
    rc: { include: ["a"], exclude: [] },
    terceros: { include: ["b  - r.c.l.- incendio, robo y accidente total", "b - r.c.l.", "r.c.l."], exclude: [] },
    tercerosCompleto: { include: [], exclude: [] },
    todoRiesgo: { include: ["tr franquicia del 5%", "franquicia del 5%", "5%"], exclude: ["3%", "10%"] },
  },
  atm: {
    rc: { include: ["responsabilidad civil"], exclude: ["robo", "incendio", "terceros", "todo riesgo"] },
    terceros: { include: ["robo e incendio", "robo, incendio"], exclude: ["terceros completos", "todo riesgo"] },
    tercerosCompleto: { include: ["terceros completos plus", "terceros completos premium", "terceros completos black"], exclude: [] },
    todoRiesgo: { include: ["todo riesgo"], exclude: [] },
  }
};

type InternalType = 'rc' | 'terceros' | 'tercerosCompleto' | 'todoRiesgo';

function mapToInternalType(c: CoverageCategory): InternalType {
  switch (c) {
    case 'Responsabilidad Civil': return 'rc';
    case 'Terceros Completo': return 'terceros';
    case 'Terceros Completo Full': return 'tercerosCompleto';
    case 'Todo Riesgo': return 'todoRiesgo';
  }
}

/**
 * Lógica base heredada de v1 para mapear la categoría genérica
 */
function classifyLegacy(plan: any, companyName: string): InternalType | null {
  const name = (plan.nombre || plan.cobertura || plan.producto || "").toLowerCase();
  const code = String(plan.codigo || "").toLowerCase();
  const companyKey = companyName.toLowerCase();

  if (code.includes("meridional") || companyKey.includes("meridional")) {
    const c = code.toUpperCase().trim();
    if (c === "MERIDIONAL_01" || c === "MERIDIONAL_1" || c === "01" || c === "1") return "rc";
    if (c === "MERIDIONAL_03" || c === "MERIDIONAL_3" || c === "03" || c === "3") return "terceros";
    if (c === "MERIDIONAL_14" || c === "14") return "tercerosCompleto";
    if (c === "MERIDIONAL_67" || c === "67" || c === "MERIDIONAL_70" || c === "70") return "todoRiesgo";
    return null;
  }

  if (code === "0064") return "rc";
  if (code === "0050") return "terceros";
  if (code === "0054" || code === "0053") return "tercerosCompleto";
  if (code === "0045") return "todoRiesgo";
  if (name.includes("cobertura a") || code === "ca7_a") return "rc";
  if (name.includes("todo riesgo") || name.includes("franquicia") || /^t\d{2}/i.test(code)) return "todoRiesgo";
  if (name.includes("responsabilidad civil") || code === "rca" || name.includes("rca")) return "rc";
  if (
    name.includes("terceros completos") ||
    (name.includes("completo") && name.includes("terceros")) ||
    name.includes("full") ||
    name.includes("plus") ||
    name.includes("premium")
  ) {
    return "tercerosCompleto";
  }
  if (name.includes("tercero") || name.includes("terceros")) return "terceros";

  return "terceros";
}

/**
 * Aplica reglas estrictas por edad o combinaciones
 */
function shouldShowPlan(plan: any, coverageType: InternalType, companyName: string, vehicleYear: number): boolean {
  const planName = (plan.nombre || plan.cobertura || plan.producto || "").toLowerCase();
  const planCode = String(plan.codigo || "").toLowerCase();
  const companyKey = companyName?.toLowerCase() || "";

  const vehicleAge = vehicleYear ? new Date().getFullYear() - Number(vehicleYear) : 0;

  if (companyKey === "integrity") {
    const integrityMapping: any = { "0064": "rc", "0050": "terceros", "0053": "tercerosCompleto", "0045": "todoRiesgo" };
    return integrityMapping[planCode] === coverageType;
  }

  if (companyKey === "atm") {
    if (coverageType === "rc") return planName.includes("responsabilidad civil") && planName.includes("sin asistencia");
    if (coverageType === "terceros") return planName === "robo e incendio total";
    if (coverageType === "tercerosCompleto") {
      if (planName.includes("terceros completos black")) return vehicleAge <= 10;
      if (planName.includes("terceros completos premium")) return vehicleAge > 10 && vehicleAge <= 15;
      if (planName.includes("terceros completos plus")) return vehicleAge > 15 && vehicleAge <= 20;
      return false;
    }
    if (coverageType === "todoRiesgo") return planName.includes("todo riesgo");
    return false;
  }

  let filters = COVERAGE_FILTERS[companyKey]?.[coverageType];
  if (!filters) return true;

  const isExcluded = filters.exclude.some((term: string) => planName.includes(term) || planCode.includes(term));
  if (isExcluded) return false;

  if (filters.include.length > 0) {
    return filters.include.some((term: string) => planName.includes(term) || planCode.includes(term));
  }
  return true;
}

/**
 * Calculo oficial heredado de V1
 */
function getCalculatedPrice(price: number, companyName: string, coverageType: InternalType, cuotas?: number): number {
  if (typeof price !== "number" || !isFinite(price) || price <= 0) return 0;

  const companyKey = companyName?.toLowerCase() || "";
  let adjustedPrice = price;

  // Lógica de cuotas para Experta de V1
  if (companyKey === "experta" && cuotas === 3) {
    adjustedPrice = price * 3;
  }

  const multiplier = COMPANY_DISCOUNTS[companyKey]?.[coverageType] || 1.0;
  let discountedPrice = adjustedPrice * multiplier;

  if (companyKey === "san cristóbal") discountedPrice = discountedPrice / 6;
  else if (companyKey === "integrity") discountedPrice = discountedPrice / 12;
  else if (companyKey === "atm") discountedPrice = discountedPrice / 3;
  else if (companyKey === "meridional") discountedPrice = discountedPrice / 4;

  return discountedPrice;
}

/**
 * Interfaz unificada de procesamiento. Devuelve null si no pasa los filtros.
 */
export function enrichAndValidateQuote(
  plan: any,
  companyName: string,
  vehicleYear: number,
  cuotas: number
): { finalCategory: CoverageCategory, monthlyPrice: number } | null {

  const internalClass = classifyLegacy(plan, companyName);
  if (!internalClass) return null; // Compañías como Meridional filtran ciertos planes al retornar null desde classify

  if (!shouldShowPlan(plan, internalClass, companyName, vehicleYear)) {
    return null;
  }

  const rawPrice = Number(plan.precio || plan.premio || plan.cuota || 0);
  const monthlyPrice = getCalculatedPrice(rawPrice, companyName, internalClass, cuotas);

  if (monthlyPrice <= 0) return null;

  let finalCategory: CoverageCategory;
  switch (internalClass) {
    case 'rc': finalCategory = 'Responsabilidad Civil'; break;
    case 'terceros': finalCategory = 'Terceros Completo'; break;
    case 'tercerosCompleto': finalCategory = 'Terceros Completo Full'; break;
    case 'todoRiesgo': finalCategory = 'Todo Riesgo'; break;
  }

  return {
    finalCategory,
    monthlyPrice
  };
}
