# Sistema de Generación de Mapas Conceptuales

Este sistema implementa un pipeline de 6 etapas para la generación autónoma de mapas conceptuales a partir de texto en español.

## Etapas del Pipeline

1. **Organización y Jerarquía** 📊
   - Identifica y organiza conceptos clave jerárquicamente
   - Herramientas: LangGraph, Penrose, spaCy, Haystack

2. **Razonamiento y Comprensión** 🧠
   - Análisis profundo del texto para establecer conexiones lógicas
   - Herramientas: DeepSeek API, OpenAGI, GraphRAG

3. **Enriquecimiento Semántico** 🔍
   - Amplía cada nodo con definiciones y contexto relevante
   - Herramientas: Semantic Kernel, Semantic Scholar API, Wikidata Toolkit, ConceptNet

4. **Validación y Verificación** ✅
   - Evalúa coherencia, exactitud y ausencia de contradicciones
   - Herramientas: Arguflow, Trieve, DePlot, NeMo Guardrails

5. **Estética Adaptativa / UX Visual** 🎨
   - Mejora la legibilidad visual con emojis y formato optimizado
   - Herramientas: Markmap, Shiki Twoslash, Open Props, Lottie, Tippy.js

6. **Conclusión Descriptiva** 📝
   - Resume los resultados y justifica la utilidad del mapa
   - Verifica la coherencia del proceso completo

## Instalación

```bash
# Instalar dependencias
npm run install-deps
```

## Ejecución

```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start
```

## Rutas de demostración

- **Demo completo**: `/api/demo`
- **Demo solo XML**: `/api/demo/xml`
- **Demo educativo del proceso**: `/api/edu/process` (incluye diagrama y explicaciones)
- **Demo con texto español sobre IA**: `/api/demo/spanish-deepseek` (usa DeepSeek API)
- **Procesamiento de texto español con DeepSeek API**: POST a `/api/process-spanish`
- **Generar mapa personalizado**: POST a `/api/generate-map`
- **Obtener configuración**: GET a `/api/configuration`

## Uso de la API específica de DeepSeek

El sistema está configurado para usar exclusivamente la API de DeepSeek en la etapa 2 (Razonamiento y Comprensión):

```bash
curl -X POST http://localhost:3000/api/process-spanish \
  -H "Content-Type: application/json" \
  -d '{"text": "Tu texto en español aquí"}'
```

La respuesta será un documento XML estructurado que incluye:
- Conceptos identificados con sus definiciones
- Relaciones semánticas establecidas por DeepSeek API
- Elementos visuales para representación gráfica
- Información sobre las 6 etapas aplicadas

La API de DeepSeek solo se utiliza en la etapa 2, mientras que el resto de etapas utilizan herramientas open-source.

## Formatos de salida

El sistema genera mapas conceptuales en varios formatos:

- **JSON**: Formato estructurado para procesamiento
- **XML**: Representación jerárquica optimizada
- **Mermaid**: Visualización compatible con Markdown

## Características

- Procesamiento de texto en español
- Detección automática de idioma
- Jerarquización inteligente de conceptos
- Validación de coherencia semántica
- Representación visual adaptativa
- Soporte para múltiples formatos de salida 