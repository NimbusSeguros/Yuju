
export const COMPANY_LOGOS: Record<string, string> = {
  'rus': 'https://res.cloudinary.com/dewcgbpvp/image/upload/v1722988252/RUS_mqiqvz.png',
  'san cristóbal': 'https://res.cloudinary.com/dewcgbpvp/image/upload/v1722988252/SANCRISTOBAL_kazpdd.png',
  'federación patronal': 'https://res.cloudinary.com/dewcgbpvp/image/upload/v1722988247/FEDPA_eq1khi.png',
  'experta': 'https://res.cloudinary.com/dewcgbpvp/image/upload/v1722988245/EXPERTA_n9hhnn.png',
  'mercantil andina': 'https://res.cloudinary.com/dewcgbpvp/image/upload/v1722988250/MERCANTIL_x2mdnw.png',
  'mapfre': 'https://res.cloudinary.com/dewcgbpvp/image/upload/v1722988250/MAPFRE_bxhq37.png',
  'integrity': 'https://res.cloudinary.com/dewcgbpvp/image/upload/v1722988249/INTEGRITY_gjydc4.png',
  'atm': 'https://res.cloudinary.com/dewcgbpvp/image/upload/v1722988244/ATM_frtz71.png',
  'meridional': 'https://res.cloudinary.com/dr8n9s55i/image/upload/v1764334028/2_mhfkzt.png',
};

/**
 * Normaliza el nombre de la aseguradora para encontrar el logo
 */
export const getInsurerLogo = (name: string): string | null => {
  if (!name) return null;
  const key = name.toLowerCase().trim();
  
  // Mapeo flexible para variaciones de nombre
  if (key.includes('rus')) return COMPANY_LOGOS['rus'];
  if (key.includes('mercantil')) return COMPANY_LOGOS['mercantil andina'];
  if (key.includes('experta')) return COMPANY_LOGOS['experta'];
  if (key.includes('san crist')) return COMPANY_LOGOS['san cristóbal'];
  if (key.includes('patronal') || key.includes('fedpa')) return COMPANY_LOGOS['federación patronal'];
  if (key.includes('integrity')) return COMPANY_LOGOS['integrity'];
  if (key.includes('atm')) return COMPANY_LOGOS['atm'];
  if (key.includes('mapfre')) return COMPANY_LOGOS['mapfre'];
  if (key.includes('meridional')) return COMPANY_LOGOS['meridional'];

  return COMPANY_LOGOS[key] || null;
};
