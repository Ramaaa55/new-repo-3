# ConceptMap SaaS

## Plataforma para la construcción autónoma de mapas conceptuales

ConceptMap SaaS es una aplicación web que permite convertir texto en mapas conceptuales estructurados y visualmente atractivos mediante un proceso de 6 etapas críticas que garantizan precisión, jerarquía y enriquecimiento semántico.

## Características principales

- **Procesamiento en 6 etapas**: Organización, Razonamiento, Enriquecimiento, Validación, Estética y Conclusión
- **Tecnologías avanzadas**: Integración con herramientas como LangGraph, Penrose, DeepSeek y más
- **Visualización adaptativa**: Mapas conceptuales con estética personalizable y UX optimizada
- **Validación automática**: Verificación de coherencia lógica y precisión conceptual
- **API accesible**: Integración sencilla con otros sistemas

## Arquitectura

El sistema procesa el texto a través de las siguientes etapas:

1. **Organización y Jerarquía**: Estructura la información en niveles lógicos usando LangGraph, Penrose, spaCy y Haystack
2. **Razonamiento y Comprensión**: Procesa semánticamente el contenido con DeepSeek API, OpenAGI, GraphRAG y LangGraph
3. **Enriquecimiento Semántico**: Amplía conceptos con información contextual usando Semantic Kernel, Semantic Scholar API, Wikidata Toolkit y ConceptNet
4. **Validación y Verificación**: Asegura la coherencia lógica y precisión con Arguflow, Trieve, DePlot y NeMo Guardrails
5. **Estética Adaptativa**: Optimiza la presentación visual con Markmap, Shiki Twoslash, Open Props, Lottie y Tippy.js
6. **Conclusión Descriptiva**: Verifica la correcta implementación de todas las etapas

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/concept-map-saas.git

# Instalar dependencias
cd concept-map-saas
npm install

# Iniciar en modo desarrollo
npm run dev
```

## Uso

1. Accede a la aplicación web
2. Pega o escribe el texto que deseas convertir en mapa conceptual
3. Configura las opciones de visualización (opcional)
4. Haz clic en "Generar mapa conceptual"
5. Explora, edita y descarga tu mapa conceptual

## Licencia

MIT
