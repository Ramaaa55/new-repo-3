/**
 * Script de prueba para el sistema modular de mapas conceptuales
 * Ejecuta todo el pipeline con un texto de ejemplo y guarda el resultado
 */

const fs = require('fs').promises;
const path = require('path');

// Importar el gestor de pipeline y los módulos
const PipelineManager = require('./server/modules/PipelineManager');
const OrganizationModule = require('./server/modules/organization/OrganizationModule');
const ReasoningModule = require('./server/modules/reasoning/ReasoningModule');
const EnrichmentModule = require('./server/modules/enrichment/EnrichmentModule');
const ValidationModule = require('./server/modules/validation/ValidationModule');
const AestheticsModule = require('./server/modules/aesthetics/AestheticsModule');
const ConclusionModule = require('./server/modules/conclusion/ConclusionModule');

// Texto de ejemplo en español para probar el sistema
const textoEjemplo = `
La inteligencia artificial (IA) es la simulación de procesos de inteligencia humana por parte de máquinas, especialmente sistemas informáticos. Estos procesos incluyen el aprendizaje (la adquisición de información y reglas para el uso de la información), el razonamiento (usando las reglas para llegar a conclusiones aproximadas o definitivas) y la autocorrección.

El aprendizaje automático es una rama de la inteligencia artificial que se centra en el desarrollo de técnicas que permiten que las computadoras aprendan. Es decir, las computadoras pueden detectar patrones en datos masivos y hacer predicciones basadas en lo que han "aprendido". El aprendizaje profundo utiliza redes neuronales artificiales con múltiples capas (de ahí lo de "profundo"), para analizar datos con una estructura lógica similar a la forma en que un ser humano sacaría conclusiones.

El procesamiento del lenguaje natural (PLN) permite a las máquinas leer y entender el lenguaje humano. Un uso típico del PLN es la interpretación de lenguaje natural para buscar en bases de datos. La visión por computadora utiliza reconocimiento de patrones y aprendizaje profundo para reconocer lo que hay en una imagen o video. Cuando las máquinas pueden procesar, analizar y comprender imágenes, pueden capturar imágenes o videos en tiempo real y interpretarlos.

La robótica se centra en el diseño y fabricación de robots, máquinas que pueden sustituir a los humanos y replicar acciones humanas. Los robots pueden ser utilizados en muchas situaciones y para muchos propósitos, pero hoy en día se utilizan principalmente en entornos industriales peligrosos, procesos de fabricación o donde los humanos no pueden sobrevivir.

La ética de la IA es un conjunto de valores, principios y técnicas que emplean estándares ampliamente aceptados de lo correcto y lo incorrecto para guiar el comportamiento moral en el desarrollo y uso de tecnologías de IA. La ética de la IA aborda cuestiones como la privacidad, la discriminación algorítmica y la toma de decisiones automatizada, entre otras.
`;

// Configurar el pipeline con todos los módulos
const setupPipeline = () => {
  const pipelineManager = new PipelineManager();
  
  // Crear instancias de los módulos
  const organizationModule = new OrganizationModule();
  const reasoningModule = new ReasoningModule();
  const enrichmentModule = new EnrichmentModule();
  const validationModule = new ValidationModule();
  const aestheticsModule = new AestheticsModule({
    theme: 'adaptive',
    viewMode: 'hierarchical',
    animationsEnabled: true
  });
  const conclusionModule = new ConclusionModule();
  
  // Registrar los módulos en el pipeline
  pipelineManager.registerModule(organizationModule);
  pipelineManager.registerModule(reasoningModule);
  pipelineManager.registerModule(enrichmentModule);
  pipelineManager.registerModule(validationModule);
  pipelineManager.registerModule(aestheticsModule);
  pipelineManager.registerModule(conclusionModule);
  
  return pipelineManager;
};

// Función principal para ejecutar la prueba
const runTest = async () => {
  console.log('Iniciando prueba del sistema modular de mapas conceptuales...');
  
  try {
    // Crear el pipeline
    const pipeline = setupPipeline();
    
    // Preparar datos de entrada
    const inputData = {
      original: {
        text: textoEjemplo,
        language: 'es'
      },
      metadata: {
        startTime: new Date().toISOString(),
        testId: `test-${Date.now()}`
      }
    };
    
    console.log(`Procesando texto de ejemplo (${textoEjemplo.length} caracteres)...`);
    
    // Ejecutar el pipeline
    const startTime = Date.now();
    const result = await pipeline.processPipeline(inputData);
    const endTime = Date.now();
    
    // Agregar metadata final
    result.metadata.endTime = new Date().toISOString();
    result.metadata.processingTimeMs = endTime - startTime;
    
    // Mostrar estadísticas básicas
    console.log('\n===== RESULTADOS DE LA PRUEBA =====');
    console.log(`Tiempo de procesamiento: ${result.metadata.processingTimeMs} ms`);
    console.log(`Conceptos extraídos: ${result.concepts?.length || 0}`);
    console.log(`Relaciones identificadas: ${result.relationships?.length || 0}`);
    
    // Verificar etapas ejecutadas
    const stageVerification = result.metadata?.conclusion?.stageVerification;
    if (stageVerification) {
      console.log(`Etapas completadas: ${stageVerification.completedStages}/${stageVerification.totalStages}`);
      
      if (stageVerification.missingStages && stageVerification.missingStages.length > 0) {
        console.warn(`ADVERTENCIA: Etapas no completadas: ${stageVerification.missingStages.join(', ')}`);
      }
    }
    
    // Guardar resultado en un archivo
    const resultFileName = 'resultado_prueba.json';
    await fs.writeFile(
      path.join(__dirname, resultFileName),
      JSON.stringify(result, null, 2)
    );
    
    console.log(`\nResultado guardado en ${resultFileName}`);
    console.log('Prueba completada con éxito');
    
  } catch (error) {
    console.error('Error durante la prueba:', error);
    console.error(error.stack);
  }
};

// Ejecutar la prueba
runTest(); 