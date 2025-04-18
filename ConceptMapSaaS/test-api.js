const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testConceptMap() {
  try {
    const demoText = `
      La inteligencia artificial (IA) es un campo de la informática que se centra en la creación de máquinas 
      inteligentes capaces de realizar tareas que típicamente requieren inteligencia humana. La IA abarca 
      desde sistemas simples de reglas hasta complejos modelos de aprendizaje profundo.

      El aprendizaje automático, una subcategoría de la IA, permite que las computadoras aprendan de los 
      datos sin ser explícitamente programadas. Los algoritmos mejoran automáticamente a través de la 
      experiencia y el uso de datos.
    `;

    console.log('Ejecutando prueba del API de mapas conceptuales...');
    
    const response = await fetch('http://localhost:3000/api/generate-map', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: demoText,
        options: {
          stages: {
            organization: true,
            reasoning: true,
            enrichment: true,
            validation: true,
            aesthetics: true
          },
          visualStyle: 'professional',
          complexity: 3
        }
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ API respondió correctamente');
      console.log('Estructura de la respuesta:');
      console.log('- success:', data.success);
      
      if (data.result) {
        console.log('- result.content existe:', !!data.result.content);
        console.log('- Longitud del contenido:', data.result.content ? data.result.content.length : 0);
        console.log('- Primeros 100 caracteres:', data.result.content ? data.result.content.substring(0, 100) : 'No hay contenido');
      } else {
        console.log('- No hay resultado en la respuesta');
      }
    } else {
      console.error('❌ Error al llamar al API:', data.error);
    }
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

testConceptMap(); 