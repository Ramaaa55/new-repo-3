/**
 * Repara las etiquetas XML problemáticas en los mapas conceptuales
 * @param {string} xml - Contenido XML a reparar
 * @returns {string} XML con etiquetas corregidas
 */
function fixXmlNameTags(xml) {
  if (!xml) return '';
  
  console.log("Reparando etiquetas XML:", xml.length, "caracteres");
  
  // Mapa de reemplazo para etiquetas problemáticas
  // Formato: [etiqueta problemática, etiqueta correcta]
  const replacements = [
    // Corregir etiquetas específicas para mapas conceptuales
    ['<n>', '<nombre>'],
    ['</n>', '</nombre>'],
    // Etiquetas para mapa conceptual
    ['<concepto nivel=', '<concepto nivel='],
    ['</concepto>', '</concepto>'],
    ['<subconcepto nivel=', '<subconcepto nivel='],
    ['</subconcepto>', '</subconcepto>'],
    ['<definición concepto=', '<definición concepto='],
    ['</definición>', '</definición>'],
    ['<relación tipo=', '<relación tipo='],
    ['</relación>', '</relación>'],
    // Etiquetas con acentos que pueden causar problemas
    ['<definición>', '<definicion>'],
    ['</definición>', '</definicion>'],
    ['<relación>', '<relacion>'],
    ['</relación>', '</relacion>']
  ];
  
  let fixed = xml;
  
  // Aplicar todos los reemplazos
  for (const [problematic, corrected] of replacements) {
    fixed = fixed.split(problematic).join(corrected);
  }
  
  // Verificación adicional para etiquetas XML mal formadas
  fixed = fixed.replace(/<([a-zA-Z]+)([^>]*)\/>/g, '<$1$2></$1>');
  
  console.log("Etiquetas XML reparadas");
  
  return fixed;
}

/**
 * Escapar caracteres especiales XML
 * @param {string} str - Cadena a escapar
 * @returns {string} Cadena con caracteres XML escapados
 */
function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

module.exports = { 
  fixXmlNameTags,
  escapeXml
}; 