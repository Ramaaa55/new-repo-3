# Sistema Modular de Mapas Conceptuales

## Descripción General

Este sistema modular para la generación autónoma de mapas conceptuales implementa una arquitectura de seis etapas críticas, cada una enfocada en diferentes aspectos del proceso de construcción de conocimiento. La arquitectura modular permite una fácil extensión, mantenimiento y personalización.

## Etapas del Sistema

### 1. Organización y Jerarquía

Responsable de extraer conceptos del texto fuente y organizarlos en una estructura jerárquica.

**Tecnologías:**
- LangGraph: Procesamiento de lenguaje natural y construcción de jerarquías
- Penrose: Representación visual de estructuras jerárquicas
- spaCy: Extracción de entidades y análisis sintáctico
- Haystack: Procesamiento de documentos y extracción de información

### 2. Razonamiento y Comprensión

Analiza relaciones semánticas entre conceptos y mejora la comprensión conceptual del mapa.

**Tecnologías:**
- DeepSeek API: Comprensión semántica profunda
- OpenAGI: Razonamiento sobre conceptos
- GraphRAG: Recuperación aumentada de grafos para conexiones semánticas
- LangGraph: Procesamiento de relaciones

### 3. Enriquecimiento Semántico

Enriquece los conceptos con definiciones, ejemplos, propiedades y conexiones a fuentes externas.

**Tecnologías:**
- Semantic Kernel: Procesamiento semántico y contextual
- Semantic Scholar API: Conexión con fuentes académicas
- Wikidata Toolkit: Integración con bases de conocimiento estructuradas
- ConceptNet: Red semántica de conocimiento común

### 4. Validación y Verificación

Verifica la precisión y coherencia de los conceptos y relaciones en el mapa.

**Tecnologías:**
- Arguflow: Verificación de la coherencia argumental
- Trieve: Búsqueda semántica para validación
- DePlot: Análisis y visualización para verificación
- NeMo Guardrails: Control de calidad y seguridad

### 5. Estética Adaptativa / UX Visual

Genera visualizaciones adaptativas e interactivas del mapa conceptual.

**Tecnologías:**
- Markmap: Mapas mentales en formato Markdown
- Shiki Twoslash: Resaltado sintáctico avanzado
- Open Props: Sistema de diseño para UI consistente
- Lottie: Animaciones para mejorar la experiencia
- Tippy.js: Tooltips y elementos interactivos

### 6. Conclusión Descriptiva

Proporciona una validación final y un resumen descriptivo del mapa conceptual.

## Arquitectura del Sistema

### Componentes Clave

1. **`BaseModule`**: Clase base abstracta que define la interfaz común para todos los módulos
2. **`PipelineManager`**: Orquestador central que gestiona el flujo entre módulos, maneja errores y recuperación
3. **Módulos específicos**: Implementaciones concretas para cada etapa del proceso

### Características Principales

#### Modularidad y Extensibilidad

- Cada módulo es independiente y sigue una interfaz común
- Nuevos módulos pueden ser añadidos sin modificar el código existente
- Los módulos pueden ser reemplazados o extendidos fácilmente

#### Configuración Flexible

- Cada módulo acepta opciones de configuración específicas
- El pipeline completo puede ser configurado globalmente
- Se pueden habilitar/deshabilitar herramientas específicas por módulo

#### Robustez y Recuperación de Errores

- Sistema de manejo de errores multinivel (módulo y pipeline)
- Estrategias de recuperación por tipo de módulo y error
- Continuación del proceso incluso cuando un módulo falla parcialmente
- Registro detallado para diagnóstico y depuración

#### Monitoreo y Métricas

- Recopilación de métricas de rendimiento para cada módulo
- Seguimiento de tiempos de procesamiento
- Estadísticas de éxito/fracaso por tipo de operación
- Validación de coherencia y calidad de los resultados

## Flujos de Trabajo

### Pipeline Completo

```
OrganizationModule → ReasoningModule → EnrichmentModule → ValidationModule → AestheticsModule → ConclusionModule
```

### Pipeline Rápido

```
OrganizationModule → ReasoningModule → ConclusionModule
```

### Pipeline de Enriquecimiento

```
OrganizationModule → ReasoningModule → EnrichmentModule → ConclusionModule
```

### Pipeline de Validación

```
OrganizationModule → ReasoningModule → ValidationModule → ConclusionModule
```

### Pipeline de Estética

```
OrganizationModule → ReasoningModule → AestheticsModule → ConclusionModule
```

### Pipeline Personalizado

Permite especificar cualquier combinación de módulos en cualquier orden.

## Uso del Sistema

### Creación de Pipeline Estándar

```javascript
const { createPipeline } = require('./modules');

// Configuración global
const config = {
  maxTextLength: 5000,
  language: 'es',
  modules: {
    organization: { maxConcepts: 40 },
    reasoning: { confidenceThreshold: 0.7 }
    // ... otras configuraciones específicas
  }
};

// Crear pipeline
const pipeline = createPipeline(config);

// Procesar texto
const result = await pipeline.processText(textoFuente);
```

### Creación de Pipeline Personalizado

```javascript
const { createCustomPipeline } = require('./modules');

// Definir etapas a utilizar
const etapas = ['organization', 'reasoning', 'enrichment', 'conclusion'];

// Crear pipeline personalizado
const pipeline = createCustomPipeline(etapas, config);
```

### Integración con API

```javascript
// En una ruta Express
app.post('/api/generate-map/enhanced', async (req, res) => {
  const { text, options } = req.body;
  
  // Configurar pipeline según opciones
  const pipeline = createPipeline({
    // Configuración basada en options
  });
  
  // Procesar y devolver resultado
  const result = await pipeline.processText(text);
  res.json(result);
});
```

## Recuperación de Errores

El sistema implementa estrategias sofisticadas de recuperación para garantizar la robustez:

1. **Recuperación a nivel de módulo**: Cada módulo puede manejar errores internos y continuar con funcionalidad reducida.
2. **Recuperación a nivel de pipeline**: El PipelineManager puede detectar fallos completos en un módulo y ofrecer alternativas:
   - Para fallos en organización: Generación mínima de conceptos
   - Para fallos en razonamiento: Creación de relaciones básicas
   - Para fallos en enriquecimiento: Continuar sin enriquecer
   - Para fallos en validación: Marcar como no validado y continuar
   - Para fallos en estética: Usar formato visual básico
   - Para fallos en conclusión: Generar conclusión mínima

## Integración de Servicios Externos

El sistema está diseñado para integrar fácilmente servicios externos:

1. **Carga dinámica de servicios**: Intenta cargar servicios si están disponibles, con graceful fallback
2. **Simulación de servicios**: Proporciona implementaciones simuladas cuando los servicios reales no están disponibles
3. **Priorización de fuentes**: Permite configurar qué fuentes de datos se utilizan y en qué orden
4. **Caché de resultados**: Almacena resultados de operaciones costosas para mejorar rendimiento

## Personalización y Extensión

Para extender el sistema con nuevos módulos:

1. Crear una nueva clase que extienda `BaseModule`
2. Implementar los métodos requeridos (`validateInput`, `_processImplementation`)
3. Registrar el nuevo módulo en el pipeline

Para integrar nuevos servicios externos:
1. Crear un nuevo archivo de servicio en `/services`
2. Implementar los métodos necesarios de API
3. Importar el servicio en los módulos relevantes

## Rendimiento y Optimización

El sistema implementa varias estrategias para optimizar el rendimiento:

1. **Procesamiento por lotes**: Agrupa operaciones similares
2. **Procesamiento concurrente**: Ejecuta tareas independientes en paralelo
3. **Priorización inteligente**: Prioriza conceptos más importantes para enriquecimiento detallado
4. **Enriquecimiento adaptativo**: Aplica diferentes niveles de procesamiento según la importancia
5. **Control de límites**: Configurable para restringir operaciones costosas

## Estado del Proyecto

El sistema está en desarrollo activo con mejoras continuas:

- **Completo**: Arquitectura modular, flujo básico, manejo de errores, configuración
- **En desarrollo**: Integración con servicios externos reales, optimización de rendimiento
- **Planificado**: Persistencia de mapas, colaboración en tiempo real, exportación a múltiples formatos

## Licencia

Este proyecto está bajo licencia MIT.

---

Documentación elaborada para el Sistema Modular de Mapas Conceptuales, 2024. 