# Sistema Modular para Mapas Conceptuales

Este directorio contiene la implementación de un sistema modular de 6 etapas para la generación autónoma de mapas conceptuales a partir de texto.

## Arquitectura del Sistema

El sistema está organizado en módulos independientes que representan cada etapa del proceso:

1. **Organización y Jerarquía** (`organization/`) - Estructura el contenido jerárquicamente
2. **Razonamiento y Comprensión** (`reasoning/`) - Analiza semánticamente el contenido y determina relaciones
3. **Enriquecimiento Semántico** (`enrichment/`) - Añade contexto adicional a los conceptos
4. **Validación y Verificación** (`validation/`) - Asegura la precisión y coherencia del mapa
5. **Estética Adaptativa/UX Visual** (`aesthetics/`) - Optimiza la presentación visual
6. **Conclusión Descriptiva** (`conclusion/`) - Verifica que todas las etapas anteriores se hayan ejecutado correctamente

### Clases Base

- `BaseModule.js` - Clase base que proporciona la estructura común para todos los módulos
- `PipelineManager.js` - Gestor del flujo de procesamiento entre módulos

### Características Principales

- **Modularidad**: Cada etapa está encapsulada como un módulo independiente
- **Extensibilidad**: Fácil integración de nuevas herramientas y servicios
- **Robustez**: Manejo de errores en todas las etapas
- **Configurabilidad**: Pipelines personalizables según las necesidades
- **Independencia**: Las etapas pueden ejecutarse individualmente o en secuencia

## Integración de Herramientas

### Etapa 1: Organización y Jerarquía
- LangGraph: Estructuración de contenido
- Penrose: Organización óptima
- spaCy: Procesamiento de lenguaje natural
- Haystack: Búsqueda y recuperación

### Etapa 2: Razonamiento y Comprensión
- DeepSeek API: Comprensión semántica
- OpenAGI: Razonamiento avanzado
- GraphRAG: Recuperación basada en grafos
- LangGraph: Construcción de relaciones lógicas

### Etapa 3: Enriquecimiento Semántico
- Semantic Kernel: Contextualización
- Semantic Scholar API: Referencias académicas
- Wikidata Toolkit: Datos estructurados
- ConceptNet: Red de conocimiento común

### Etapa 4: Validación y Verificación
- Arguflow: Validación de coherencia
- Trieve: Verificación de datos
- DePlot: Análisis estructural
- NeMo Guardrails: Protección contra inconsistencias

### Etapa 5: Estética Adaptativa/UX Visual
- Markmap: Visualización de mapas mentales
- Shiki Twoslash: Resaltado de código
- Open Props: Variables CSS modernas
- Lottie: Animaciones fluidas
- Tippy.js: Tooltips interactivos

## Uso Básico

```javascript
// Importar el sistema
const { processText } = require('./modules');

// Procesar texto con pipeline completo
const result = await processText('Texto para analizar', { 
  maxConcepts: 20,
  includeHierarchy: true
});

// Crear pipeline personalizado
const { createCustomPipeline } = require('./modules');

const customPipeline = createCustomPipeline([
  'organization', 
  'reasoning', 
  'aesthetics'
]);

const customResult = await customPipeline.processText('Texto para analizar');
```

## Configuración

Cada módulo puede configurarse individualmente mediante opciones:

```javascript
const { createPipeline } = require('./modules');

const pipeline = createPipeline({
  modules: {
    organization: {
      tools: {
        haystack: true,
        spacy: true
      }
    },
    reasoning: {
      tools: {
        deepSeek: true
      }
    }
    // ... más configuraciones
  }
});
```

## Pipelines Preconfigurados

El sistema ofrece varios pipelines preconfigurados para casos de uso comunes:

- `createPipeline()` - Pipeline completo con todas las etapas
- `createFastPipeline()` - Pipeline rápido con procesamiento mínimo
- `createEnrichmentPipeline()` - Pipeline enfocado en enriquecimiento
- `createValidationPipeline()` - Pipeline enfocado en validación
- `createAestheticsPipeline()` - Pipeline enfocado en presentación visual

## Formato de Datos

Cada etapa recibe y produce un objeto con la siguiente estructura básica:

```javascript
{
  original: {
    text: "...",
    language: "es"
  },
  concepts: [
    { id: "c1", name: "Concepto 1", ... }
  ],
  relationships: [
    { id: "r1", source: "c1", target: "c2", type: "incluye", ... }
  ],
  metadata: {
    // Información de procesamiento
  }
}
```

Las etapas posteriores pueden añadir propiedades adicionales como `aesthetics`, `conclusion`, etc. 