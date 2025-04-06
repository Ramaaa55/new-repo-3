/**
 * Configuración global para la aplicación ConceptMap SaaS
 */

module.exports = {
  // Configuración del servidor
  server: {
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development'
  },
  
  // Configuración de APIs externas
  apis: {
    deepseek: {
      apiKey: process.env.DEEPSEEK_API_KEY || 'sk-96a7994b00d646809acf5e17fc63ce74', // Esta es la clave de ejemplo mencionada en la documentación
      baseUrl: 'https://api.deepseek.com/v1'
    },
    semanticScholar: {
      baseUrl: 'https://api.semanticscholar.org/v1'
    },
    wikidata: {
      baseUrl: 'https://www.wikidata.org/w/api.php'
    }
  },
  
  // Configuración de procesamiento de mapas conceptuales
  conceptMap: {
    // Límites por plan
    limits: {
      free: {
        maxTextLength: 5000, // caracteres
        maxMapsPerMonth: 5,
        enabledStages: ['organization', 'reasoning', 'aesthetics']
      },
      professional: {
        maxTextLength: 20000,
        maxMapsPerMonth: 50,
        enabledStages: ['organization', 'reasoning', 'enrichment', 'validation', 'aesthetics', 'conclusion']
      },
      enterprise: {
        maxTextLength: 50000,
        maxMapsPerMonth: -1, // ilimitado
        enabledStages: ['organization', 'reasoning', 'enrichment', 'validation', 'aesthetics', 'conclusion']
      }
    },
    
    // Estilos visuales disponibles
    visualStyles: [
      'professional',
      'sketch',
      'minimalist',
      'colorful'
    ]
  }
};
