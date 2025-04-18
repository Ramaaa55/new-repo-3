/**
 * Repara las etiquetas <n> por <name> en el XML
 * @param {string} xml - Contenido XML a reparar
 * @returns {string} XML con etiquetas corregidas
 */
function fixXmlNameTags(xml) {
  if (!xml) return '';
  
  console.log('Reparando etiquetas XML:', xml.length, 'caracteres');
  // Usar split/join para mayor compatibilidad
  let fixed = xml;
  fixed = fixed.split('<n>').join('<name>');
  fixed = fixed.split('</n>').join('</name>');
  console.log('Etiquetas XML reparadas');
  
  return fixed;
}

module.exports = { fixXmlNameTags };
