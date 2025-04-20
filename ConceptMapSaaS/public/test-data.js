// Datos de ejemplo para probar las visualizaciones de mapas conceptuales
const testConceptMapData = {
    title: "Inteligencia Artificial",
    concepts: [
        {
            id: "c1",
            name: "Inteligencia Artificial",
            description: "Campo de la informática enfocado en la creación de máquinas capaces de realizar tareas que normalmente requieren inteligencia humana",
            importance: "high",
            hierarchyLevel: 1,
            category: "tecnología"
        },
        {
            id: "c2",
            name: "Machine Learning",
            description: "Subcampo de la IA que permite a los sistemas aprender y mejorar a partir de la experiencia",
            importance: "high",
            hierarchyLevel: 2,
            category: "tecnología"
        },
        {
            id: "c3",
            name: "Deep Learning",
            description: "Subcampo del Machine Learning basado en redes neuronales artificiales con múltiples capas",
            importance: "high",
            hierarchyLevel: 3,
            category: "tecnología"
        },
        {
            id: "c4",
            name: "Procesamiento de Lenguaje Natural",
            description: "Rama de la IA que trabaja con la interacción entre computadoras y lenguaje humano",
            importance: "medium",
            hierarchyLevel: 2,
            category: "tecnología"
        },
        {
            id: "c5",
            name: "Visión por Computadora",
            description: "Rama que trabaja en la comprensión de imágenes y videos",
            importance: "medium",
            hierarchyLevel: 2,
            category: "tecnología"
        },
        {
            id: "c6",
            name: "Redes Neuronales",
            description: "Modelos computacionales inspirados en las redes neuronales biológicas",
            importance: "medium",
            hierarchyLevel: 3,
            category: "tecnología"
        },
        {
            id: "c7",
            name: "Transformers",
            description: "Arquitectura de red neuronal diseñada para procesar datos secuenciales",
            importance: "medium",
            hierarchyLevel: 4,
            category: "tecnología"
        },
        {
            id: "c8",
            name: "GPT",
            description: "Generative Pre-trained Transformer, modelo de lenguaje basado en transformers",
            importance: "medium",
            hierarchyLevel: 5,
            category: "tecnología"
        },
        {
            id: "c9",
            name: "CNN",
            description: "Redes Neuronales Convolucionales, utilizadas principalmente en visión por computadora",
            importance: "low",
            hierarchyLevel: 4,
            category: "tecnología"
        },
        {
            id: "c10",
            name: "RNN",
            description: "Redes Neuronales Recurrentes, utilizadas para datos secuenciales",
            importance: "low",
            hierarchyLevel: 4,
            category: "tecnología"
        },
        {
            id: "c11",
            name: "Aprendizaje Supervisado",
            description: "Técnica de ML donde el modelo se entrena con datos etiquetados",
            importance: "medium",
            hierarchyLevel: 3,
            category: "metodología"
        },
        {
            id: "c12",
            name: "Aprendizaje No Supervisado",
            description: "Técnica de ML donde el modelo descubre patrones sin etiquetas",
            importance: "medium",
            hierarchyLevel: 3,
            category: "metodología"
        },
        {
            id: "c13",
            name: "Ética en IA",
            description: "Consideraciones éticas en el desarrollo y uso de IA",
            importance: "high",
            hierarchyLevel: 2,
            category: "social"
        },
        {
            id: "c14",
            name: "Sesgo Algorítmico",
            description: "Tendencia de los algoritmos a favorecer ciertos resultados",
            importance: "medium",
            hierarchyLevel: 3,
            category: "social"
        },
        {
            id: "c15",
            name: "Aplicaciones de IA",
            description: "Diferentes usos prácticos de la IA en diversos sectores",
            importance: "high",
            hierarchyLevel: 2,
            category: "aplicación"
        }
    ],
    relationships: [
        {
            sourceId: "c1",
            targetId: "c2",
            type: "hierarchy",
            label: "incluye",
            description: "La IA incluye el Machine Learning como una de sus disciplinas principales",
            importance: "high"
        },
        {
            sourceId: "c1",
            targetId: "c4",
            type: "hierarchy",
            label: "incluye",
            description: "La IA incluye el Procesamiento de Lenguaje Natural",
            importance: "medium"
        },
        {
            sourceId: "c1",
            targetId: "c5",
            type: "hierarchy",
            label: "incluye",
            description: "La IA incluye la Visión por Computadora",
            importance: "medium"
        },
        {
            sourceId: "c1",
            targetId: "c13",
            type: "related",
            label: "considera",
            description: "La IA debe considerar aspectos éticos",
            importance: "high"
        },
        {
            sourceId: "c1",
            targetId: "c15",
            type: "related",
            label: "tiene",
            description: "La IA tiene múltiples aplicaciones",
            importance: "high"
        },
        {
            sourceId: "c2",
            targetId: "c3",
            type: "hierarchy",
            label: "incluye",
            description: "Machine Learning incluye Deep Learning",
            importance: "high"
        },
        {
            sourceId: "c2",
            targetId: "c11",
            type: "hierarchy",
            label: "utiliza",
            description: "Machine Learning utiliza Aprendizaje Supervisado",
            importance: "medium"
        },
        {
            sourceId: "c2",
            targetId: "c12",
            type: "hierarchy",
            label: "utiliza",
            description: "Machine Learning utiliza Aprendizaje No Supervisado",
            importance: "medium"
        },
        {
            sourceId: "c3",
            targetId: "c6",
            type: "hierarchy",
            label: "utiliza",
            description: "Deep Learning utiliza Redes Neuronales",
            importance: "high"
        },
        {
            sourceId: "c6",
            targetId: "c7",
            type: "hierarchy",
            label: "incluye",
            description: "Las Redes Neuronales incluyen arquitecturas Transformer",
            importance: "medium"
        },
        {
            sourceId: "c6",
            targetId: "c9",
            type: "hierarchy",
            label: "incluye",
            description: "Las Redes Neuronales incluyen CNN",
            importance: "low"
        },
        {
            sourceId: "c6",
            targetId: "c10",
            type: "hierarchy",
            label: "incluye",
            description: "Las Redes Neuronales incluyen RNN",
            importance: "low"
        },
        {
            sourceId: "c7",
            targetId: "c8",
            type: "hierarchy",
            label: "es base de",
            description: "La arquitectura Transformer es la base de GPT",
            importance: "medium"
        },
        {
            sourceId: "c13",
            targetId: "c14",
            type: "hierarchy",
            label: "estudia",
            description: "La Ética en IA estudia el Sesgo Algorítmico",
            importance: "medium"
        },
        {
            sourceId: "c4",
            targetId: "c7",
            type: "uses",
            label: "utiliza",
            description: "El PLN moderno utiliza Transformers",
            importance: "medium"
        },
        {
            sourceId: "c5",
            targetId: "c9",
            type: "uses",
            label: "utiliza",
            description: "La Visión por Computadora utiliza CNN",
            importance: "medium"
        }
    ],
    conclusion: {
        summary: "La Inteligencia Artificial es un campo amplio que engloba diversas disciplinas y metodologías, desde el Machine Learning y sus subcampos hasta consideraciones éticas importantes para su desarrollo responsable.",
        keyPoints: [
            "La IA abarca múltiples subdisciplinas como Machine Learning y Procesamiento de Lenguaje Natural",
            "El Deep Learning y los modelos de Transformers representan avances significativos en el campo",
            "Las consideraciones éticas son fundamentales para el desarrollo responsable de la IA"
        ]
    }
};

// Exportar para uso en otros archivos
if (typeof module !== 'undefined') {
    module.exports = { testConceptMapData };
} 