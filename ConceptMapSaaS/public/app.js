document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos DOM
    const textInput = document.getElementById('text-input');
    const generateBtn = document.getElementById('generate-btn');
    const clearBtn = document.getElementById('clear-btn');
    const downloadBtn = document.getElementById('download-btn');
    const shareBtn = document.getElementById('share-btn');
    const editBtn = document.getElementById('edit-btn');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const markmapContainer = document.getElementById('markmap-container');
    
    // Variables para el mapa conceptual
    let markmapInstance = null;
    let currentMapData = null;
    
    // Cambio de pestañas
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Desactivar todas las pestañas
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Activar la pestaña seleccionada
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // Limpiar texto
    clearBtn.addEventListener('click', () => {
        textInput.value = '';
    });
    
    // Función para procesar el texto y generar el mapa conceptual
    generateBtn.addEventListener('click', async () => {
        try {
            // Obtener el texto del área de texto
            const text = textInput.value.trim();
            
            // Validar que haya texto
            if (!text) {
                showNotification('Por favor, ingresa un texto para generar el mapa conceptual', 'error');
                return;
            }
            
            // Mostrar indicador de carga
            showLoading(true);
            
            // Opciones para la generación del mapa
            const options = {
                stages: {
                    organization: document.getElementById('stage1').checked,
                    reasoning: document.getElementById('stage2').checked,
                    enrichment: document.getElementById('stage3').checked,
                    validation: document.getElementById('stage4').checked,
                    aesthetics: document.getElementById('stage5').checked
                },
                visualStyle: document.getElementById('visual-style').value,
                complexity: document.getElementById('complexity').value
            };
            
            console.log('Opciones de configuración:', options);
            console.log('Texto a procesar (primeros 50 caracteres):', text ? text.substring(0, 50) : 'No hay texto');
            
            // Simular procesamiento por etapas (en una implementación real, esto sería una llamada a la API)
            await simulateProcessing(options);
            
            console.log('Iniciando llamada a la API...');
            
            // Llamada a la API para generar el mapa conceptual
            const response = await fetch('/api/generate-map', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text, options })
            });
            
            console.log('Respuesta API status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error en la respuesta:', errorText);
                throw new Error(`Error al generar el mapa conceptual: ${response.status} ${errorText}`);
            }
            
            const data = await response.json();
            console.log('Datos recibidos:', data);
            
            if (data.success) {
                // Determinar la estructura de datos correcta
                let contentData = null;
                
                if (data.result.content) {
                    // La API devolvió la estructura esperada directamente
                    contentData = data.result.content;
                    console.log('Usando contenido directo de result.content');
                } else if (data.result) {
                    // La API devolvió result pero sin .content
                    contentData = data.result;
                    console.log('Usando contenido de result');
                }
                
                if (!contentData) {
                    console.error('No se pudo determinar la estructura del contenido');
                    contentData = {
                        concepts: [],
                        relationships: [],
                        title: "Error: No se pudo cargar el mapa"
                    };
                }
                
                // Guardar los datos del mapa
                currentMapData = contentData;
                
                // Registro detallado para depuración
                console.log('Contenido del mapa conceptual:', {
                    conceptCount: contentData.concepts ? contentData.concepts.length : 0,
                    relationshipCount: contentData.relationships ? contentData.relationships.length : 0
                });
                
                // Renderizar el mapa conceptual
                await renderModularConceptMap(contentData);
                
                // Cambiar a la pestaña de salida
                document.querySelector('[data-tab="output"]').click();
                
                showNotification('Mapa conceptual generado exitosamente', 'success');
            } else {
                console.error('Error en datos recibidos:', data.error || 'Error desconocido');
                throw new Error(data.error || 'Error desconocido');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification(error.message, 'error');
        } finally {
            showLoading(false);
        }
    });
    
    // Descargar mapa conceptual
    downloadBtn.addEventListener('click', () => {
        if (!currentMapData) {
            showNotification('No hay un mapa conceptual para descargar', 'error');
            return;
        }
        
        // En una implementación real, aquí se generaría el archivo para descargar
        // Por ahora, simplemente descargamos el contenido como un archivo markdown
        const blob = new Blob([currentMapData], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mapa-conceptual.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Mapa conceptual descargado', 'success');
    });
    
    // Compartir mapa conceptual
    shareBtn.addEventListener('click', () => {
        if (!currentMapData) {
            showNotification('No hay un mapa conceptual para compartir', 'error');
            return;
        }
        
        // Simular compartir (en una implementación real, esto abriría un modal o generaría un enlace)
        showNotification('Función de compartir en desarrollo', 'info');
    });
    
    // Editar mapa conceptual
    editBtn.addEventListener('click', () => {
        if (!currentMapData) {
            showNotification('No hay un mapa conceptual para editar', 'error');
            return;
        }
        
        // Volver a la pestaña de entrada con el texto actual
        textInput.value = currentMapData;
        document.querySelector('[data-tab="input"]').click();
    });
    
    /**
     * Renderiza el mapa conceptual utilizando la biblioteca adecuada según el formato
     * @param {string} data - Contenido del mapa conceptual en formato XML, Markdown o Mermaid
     * @param {string} format - Formato de visualización ('markmap', 'mermaid', 'd3')
     */
    async function renderMarkmap(data, container = null) {
        try {
            // Si no se proporciona contenedor, usar el predeterminado
            const targetContainer = container || document.getElementById('diagramContainer');
            targetContainer.innerHTML = '';
            
            let markdownContent = '';
            
            // Verificar si los datos son del formato antiguo o nuevo
            if (typeof data === 'string') {
                // Formato antiguo - contenido markdown directo
                markdownContent = data;
            } else {
                // Formato nuevo - objeto con conceptos y relaciones
                markdownContent = convertConceptsToMarkdown(data);
            }
            
            // Crear un elemento para Markmap
            const markmapContainer = document.createElement('div');
            markmapContainer.style.width = '100%';
            markmapContainer.style.height = '70vh';
            markmapContainer.style.overflow = 'hidden';
            targetContainer.appendChild(markmapContainer);
            
            // Verificar que markmap está correctamente cargado
            if (!window.markmap) {
                console.error('La biblioteca markmap no está disponible');
                throw new Error('No se pudo cargar la biblioteca markmap');
            }
            
            // Verificar que los componentes necesarios existen
            if (!window.markmap.Markmap) {
                console.error('Markmap.Markmap no está disponible', window.markmap);
                throw new Error('Componente Markmap no disponible');
            }
            
            // Inicializar Markmap y obtener los componentes
            const { Markmap, loadCSS, loadJS } = window.markmap;
            
            // Verificar que la función transform existe
            if (!window.markmap.transform || typeof window.markmap.transform.transform !== 'function') {
                console.error('window.markmap.transform no está disponible o no es una función');
                console.log('Propiedades disponibles en window.markmap:', Object.keys(window.markmap));
                
                // Intentar cargar transform de una manera alternativa
                if (!window.markmap.transform) {
                    window.markmap.transform = {
                        transform: function(content) {
                            return {
                                root: {
                                    t: markdownContent,
                                    d: 0,
                                    v: '',
                                    c: [{
                                        t: 'Error: No se pudo transformar el contenido',
                                        d: 1,
                                        v: '',
                                        c: []
                                    }]
                                }
                            };
                        }
                    };
                    console.log('Se ha creado un objeto transform alternativo');
                }
            }
            
            // Crear el SVG para Markmap
            const markmapSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            markmapSvg.style.width = '100%';
            markmapSvg.style.height = '100%';
            markmapContainer.appendChild(markmapSvg);
            
            // Intentar procesar el markdown con transform
            let transformedData;
            try {
                transformedData = window.markmap.transform.transform(markdownContent);
            } catch (transformError) {
                console.error('Error al transformar el contenido markdown:', transformError);
                
                // Proporcionar datos transformados manualmente en caso de error
                transformedData = {
                    root: {
                        t: 'Mapa Conceptual',
                        d: 0,
                        v: '',
                        c: [{
                            t: 'Error: No se pudo transformar el contenido',
                            d: 1,
                            v: 'Verifica que la biblioteca markmap está correctamente cargada',
                            c: []
                        }]
                    }
                };
            }
            
            // Renderizar Markmap
            try {
                const mm = Markmap.create(markmapSvg, {
                    embedAssets: false,
                    duration: 500,
                    nodeFont: 'var(--main-font, "Arial")',
                    zoom: true,
                    pan: true
                });
                
                mm.setData(transformedData);
                mm.fit();
                
                return mm; // Devolver la instancia de markmap para posibles interacciones futuras
            } catch (renderError) {
                console.error('Error al renderizar el mapa:', renderError);
                targetContainer.innerHTML = `<div class="error-message" style="padding: 20px; color: red; text-align: center;">
                    <h3>Error al renderizar el mapa conceptual</h3>
                    <p>${renderError.message}</p>
                    <p>Intenta recargar la página o usa otro formato de visualización</p>
                </div>`;
                throw renderError;
            }
        } catch (error) {
            console.error('Error al renderizar markmap:', error);
            throw error;
        }
    }
    
    function convertConceptsToMarkdown(data) {
        // Función para convertir el objeto de conceptos en formato markdown
        let markdown = '# ' + (data.title || 'Mapa Conceptual') + '\n\n';
        
        if (data.concepts && data.concepts.length > 0) {
            // Ordenar conceptos por nivel jerárquico
            const sortedConcepts = [...data.concepts].sort((a, b) => 
                (a.hierarchyLevel || 0) - (b.hierarchyLevel || 0)
            );
            
            // Función recursiva para generar markdown jerárquico
            function addConceptsRecursively(parentId = null, level = 1) {
                const children = sortedConcepts.filter(c => 
                    (!parentId && !c.parentId) || // Conceptos raíz
                    (c.parentId === parentId)     // Hijos directos
                );
                
                let result = '';
                for (const concept of children) {
                    const prefix = '#'.repeat(Math.min(level + 1, 6)) + ' ';
                    result += prefix + concept.name + '\n';
                    
                    // Añadir descripción si existe
                    if (concept.description) {
                        result += concept.description + '\n\n';
                    }
                    
                    // Añadir enlaces a otros conceptos si existen relaciones
                    const relationships = data.relationships?.filter(r => 
                        r.sourceId === concept.id || r.targetId === concept.id
                    );
                    
                    if (relationships && relationships.length > 0) {
                        result += '- **Relaciones:**\n';
                        for (const rel of relationships) {
                            const otherConcept = sortedConcepts.find(c => 
                                (rel.sourceId === concept.id && c.id === rel.targetId) || 
                                (rel.targetId === concept.id && c.id === rel.sourceId)
                            );
                            if (otherConcept) {
                                result += `  - ${rel.type || 'Relacionado con'}: ${otherConcept.name}\n`;
                            }
                        }
                        result += '\n';
                    }
                    
                    // Recursivamente añadir hijos
                    const childrenMd = addConceptsRecursively(concept.id, level + 1);
                    if (childrenMd) {
                        result += childrenMd;
                    }
                }
                return result;
            }
            
            markdown += addConceptsRecursively();
        }
        
        return markdown;
    }

    async function renderMermaid(data, container) {
        try {
            const targetContainer = container || document.getElementById('diagramContainer');
            targetContainer.innerHTML = '';
            
            // Crear un contenedor para el diagrama Mermaid
            const mermaidContainer = document.createElement('div');
            mermaidContainer.className = 'mermaid-diagram';
            mermaidContainer.style.width = '100%';
            mermaidContainer.style.height = '70vh';
            mermaidContainer.style.overflow = 'auto';
            targetContainer.appendChild(mermaidContainer);
            
            // Convertir conceptos a formato Mermaid
            const mermaidDef = convertConceptsToMermaid(data);
            
            // Crear el contenedor para el código Mermaid
            const mermaidDiv = document.createElement('div');
            mermaidDiv.className = 'mermaid';
            mermaidDiv.textContent = mermaidDef;
            mermaidContainer.appendChild(mermaidDiv);
            
            // Inicializar y renderizar Mermaid
            await window.mermaid.initialize({
                startOnLoad: true,
                theme: 'default',
                flowchart: {
                    useMaxWidth: false,
                    htmlLabels: true,
                    curve: 'cardinal'
                }
            });
            
            await window.mermaid.run();
        } catch (error) {
            console.error('Error al renderizar mermaid:', error);
            throw error;
        }
    }

    function convertConceptsToMermaid(data) {
        // Construir diagrama Mermaid en formato flowchart
        let mermaid = 'flowchart TB\n';
        
        // Añadir nodos
        if (data.concepts && data.concepts.length > 0) {
            for (const concept of data.concepts) {
                // Formato del nodo basado en importancia
                let nodeStyle = '';
                if (concept.importance === 'high') {
                    nodeStyle = '([" ' + concept.name + ' "]):::important';
                } else if (concept.importance === 'medium') {
                    nodeStyle = '[" ' + concept.name + ' "]:::medium';
                } else {
                    nodeStyle = '(" ' + concept.name + ' "):::standard';
                }
                
                mermaid += `    ${concept.id}${nodeStyle}\n`;
            }
            
            // Añadir relaciones
            if (data.relationships && data.relationships.length > 0) {
                mermaid += '\n    %% Relationships\n';
                for (const rel of data.relationships) {
                    // Solo incluir un subconjunto de relaciones para no saturar
                    if (Math.random() > 0.7) continue; // Incluir solo ~30% de relaciones para mayor claridad
                    
                    const linkStyle = rel.type === 'includes' ? '-->' : '---';
                    const linkLabel = rel.type ? "|" + rel.type + "|" : "";
                    mermaid += `    ${rel.sourceId}${linkStyle}${linkLabel}${rel.targetId}\n`;
                }
            }
            
            // Añadir estilos
            mermaid += '\n    %% Styles\n';
            mermaid += '    classDef important fill:#f9d5e5,stroke:#333,stroke-width:2px;\n';
            mermaid += '    classDef medium fill:#eeeeee,stroke:#666;\n';
            mermaid += '    classDef standard fill:#e3f2fd,stroke:#64b5f6;\n';
        }
        
        return mermaid;
    }

    async function renderD3ConceptMap(data, container) {
        try {
            const targetContainer = container || document.getElementById('diagramContainer');
            targetContainer.innerHTML = '';
            
            // Crear contenedor para la visualización D3
            const d3Container = document.createElement('div');
            d3Container.id = 'd3-concept-map';
            d3Container.style.width = '100%';
            d3Container.style.height = '70vh';
            targetContainer.appendChild(d3Container);
            
            // Preparar datos para D3
            const d3Data = prepareD3Data(data);
            
            // Crear SVG para D3
            const d3Svg = d3.select('#d3-concept-map')
                .append('svg')
                .attr('width', '100%')
                .attr('height', '100%')
                .attr('viewBox', '0 0 1000 800')
                .append('g')
                .attr('transform', 'translate(500, 400)');
            
            // Simulación de fuerzas para grafo
            const simulation = d3.forceSimulation(d3Data.nodes)
                .force('link', d3.forceLink(d3Data.links).id(d => d.id).distance(100))
                .force('charge', d3.forceManyBody().strength(-200))
                .force('center', d3.forceCenter(0, 0))
                .force('collision', d3.forceCollide().radius(50));
            
            // Añadir links
            const link = d3Svg.append('g')
                .selectAll('line')
                .data(d3Data.links)
                .enter()
                .append('line')
                .attr('stroke', '#999')
                .attr('stroke-opacity', 0.6)
                .attr('stroke-width', d => Math.sqrt(d.value || 1));
            
            // Añadir nodos
            const node = d3Svg.append('g')
                .selectAll('.node')
                .data(d3Data.nodes)
                .enter()
                .append('g')
                .attr('class', 'node')
                .call(d3.drag()
                    .on('start', dragstarted)
                    .on('drag', dragged)
                    .on('end', dragended));
            
            // Círculos para nodos
            node.append('circle')
                .attr('r', d => getNodeRadius(d))
                .attr('fill', d => getNodeColor(d))
                .attr('stroke', '#fff')
                .attr('stroke-width', 1.5);
            
            // Texto para nodos
            node.append('text')
                .text(d => d.name)
                .attr('x', 0)
                .attr('y', 4)
                .attr('text-anchor', 'middle')
                .style('font-size', '12px')
                .style('font-family', 'var(--main-font, Arial)')
                .style('fill', d => getTextColor(d))
                .style('pointer-events', 'none');
            
            // Funciones de ayuda para D3
            function dragstarted(event, d) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }
            
            function dragged(event, d) {
                d.fx = event.x;
                d.fy = event.y;
            }
            
            function dragended(event, d) {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }
            
            // Actualizar posiciones
            simulation.on('tick', () => {
                link
                    .attr('x1', d => d.source.x)
                    .attr('y1', d => d.source.y)
                    .attr('x2', d => d.target.x)
                    .attr('y2', d => d.target.y);
                
                node
                    .attr('transform', d => `translate(${d.x}, ${d.y})`);
            });
            
            // Funciones de ayuda para estilos
            function getNodeRadius(d) {
                if (d.importance === 'high') return 25;
                if (d.importance === 'medium') return 18;
                return 12;
            }
            
            function getNodeColor(d) {
                if (d.importance === 'high') return '#ff7043';
                if (d.importance === 'medium') return '#4fc3f7';
                return '#81c784';
            }
            
            function getTextColor(d) {
                return d.importance === 'high' ? '#fff' : '#333';
            }
            
        } catch (error) {
            console.error('Error al renderizar D3:', error);
            throw error;
        }
    }

    function prepareD3Data(data) {
        // Convertir datos para D3
        const nodes = data.concepts.map(concept => ({
            id: concept.id,
            name: concept.name,
            importance: concept.importance || 'low',
            group: concept.category || 1,
            level: concept.hierarchyLevel || 1
        }));
        
        const links = (data.relationships || []).map(rel => ({
            source: rel.sourceId,
            target: rel.targetId,
            value: 1,
            type: rel.type || 'related'
        }));
        
        return { nodes, links };
    }
    
    // Función para mostrar notificaciones
    function showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Permitir HTML para mensajes más ricos
        notification.innerHTML = message;
        
        // Añadir icono según el tipo de notificación
        const iconMap = {
            'info': '&#8505;', // Símbolo de información
            'success': '&#10004;', // Marca de verificación
            'warning': '&#9888;', // Señal de advertencia
            'error': '&#10060;' // Símbolo de error
        };
        
        if (iconMap[type]) {
            const icon = document.createElement('span');
            icon.className = 'notification-icon';
            icon.innerHTML = iconMap[type];
            notification.prepend(icon);
        }
        
        // Añadir botón para cerrar
        const closeBtn = document.createElement('span');
        closeBtn.className = 'notification-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = function() {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        };
        notification.appendChild(closeBtn);
        
        document.body.appendChild(notification);
        
        // Mostrar la notificación
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Ocultar después de un tiempo (si no es error)
        if (type !== 'error' || duration > 0) {
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, duration);
        }
        
        return notification; // Devolver referencia para manipulación adicional
    }
    
    // Función para mostrar/ocultar indicador de carga
    function showLoading(show) {
        // Si ya existe un loader, eliminarlo
        const existingLoader = document.querySelector('.loader-container');
        if (existingLoader) {
            document.body.removeChild(existingLoader);
        }
        
        if (show) {
            // Crear y mostrar el loader
            const loaderContainer = document.createElement('div');
            loaderContainer.className = 'loader-container';
            
            const loader = document.createElement('div');
            loader.className = 'loader';
            
            const message = document.createElement('p');
            message.textContent = 'Procesando texto...';
            
            loaderContainer.appendChild(loader);
            loaderContainer.appendChild(message);
            document.body.appendChild(loaderContainer);
        }
    }
    
    // Función para simular el procesamiento por etapas
    async function simulateProcessing(options) {
        const stages = [
            { name: 'Organización y Jerarquía', enabled: options.stages.organization, time: 500 },
            { name: 'Razonamiento y Comprensión', enabled: options.stages.reasoning, time: 700 },
            { name: 'Enriquecimiento Semántico', enabled: options.stages.enrichment, time: 600 },
            { name: 'Validación y Verificación', enabled: options.stages.validation, time: 400 },
            { name: 'Estética Adaptativa', enabled: options.stages.aesthetics, time: 300 }
        ];
        
        // Actualizar mensaje del loader para cada etapa
        for (const stage of stages) {
            if (stage.enabled) {
                const loaderMessage = document.querySelector('.loader-container p');
                if (loaderMessage) {
                    loaderMessage.textContent = `Procesando: ${stage.name}...`;
                }
                
                // Simular tiempo de procesamiento
                await new Promise(resolve => setTimeout(resolve, stage.time));
            }
        }
    }
    
    // Añadir estilos para notificaciones y loader
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            transform: translateY(-100px);
            opacity: 0;
            transition: all 0.3s ease;
        }
        
        .notification.show {
            transform: translateY(0);
            opacity: 1;
        }
        
        .notification.success {
            background-color: #10b981;
        }
        
        .notification.error {
            background-color: #ef4444;
        }
        
        .notification.info {
            background-color: #3b82f6;
        }
        
        .loader-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        
        .loader {
            width: 48px;
            height: 48px;
            border: 5px solid #fff;
            border-bottom-color: #4f46e5;
            border-radius: 50%;
            animation: rotation 1s linear infinite;
            margin-bottom: 16px;
        }
        
        .loader-container p {
            color: white;
            font-weight: 500;
        }
        
        @keyframes rotation {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Cargar un ejemplo inicial de mapa conceptual
    const exampleMarkmap = `
# Mapa Conceptual
## Organización y Jerarquía
### LangGraph
- Columna vertebral de jerarquía lógica
- Define flujos de pensamiento
### Penrose
- Arquitecto visual
- Mantiene orden y simetría
## Razonamiento y Comprensión
### DeepSeek API
- Procesamiento semántico
### GraphRAG
- Conversión a grafos de conocimiento
## Enriquecimiento Semántico
### Semantic Kernel
- Enriquece con conocimiento
### ConceptNet
- Red semántica de conocimiento
## Validación y Verificación
### Arguflow
- Validación de relaciones lógicas
### Trieve
- Verificación con evidencia
## Estética Adaptativa
### Markmap
- Mapas interactivos en Markdown
### Open Props
- Estilos adaptativos
    `;
    
    // Renderizar el ejemplo inicial después de un breve retraso
    setTimeout(() => {
        currentMapData = exampleMarkmap;
        renderMarkmap(exampleMarkmap);
    }, 1000);

    async function renderModularConceptMap(data) {
        try {
            console.log('Renderizando mapa conceptual modular:', data);
            const container = document.getElementById('diagramContainer');
            container.innerHTML = ''; // Limpiar contenedor existente
            
            // Si no hay datos o conceptos, mostrar mensaje
            if (!data || !data.concepts || data.concepts.length === 0) {
                container.innerHTML = '<div class="alert alert-warning">No se pudieron generar conceptos del texto proporcionado.</div>';
                return;
            }
            
            // Aplicar configuración estética del stage 5
            if (data.aesthetics && data.aesthetics.visualStyle) {
                applyVisualStyle(data.aesthetics.visualStyle);
            }
            
            // Determinar el formato de visualización basado en la complejidad
            let visualizationFormat = 'markmap'; // Predeterminado
            
            if (data.concepts.length > 50) {
                visualizationFormat = 'd3'; // Para mapas muy complejos
            } else if (data.concepts.length > 20) {
                visualizationFormat = 'mermaid'; // Para mapas de complejidad media
            }
            
            // Override con preferencia de usuario si existe
            if (data.aesthetics && data.aesthetics.preferredFormat) {
                visualizationFormat = data.aesthetics.preferredFormat;
            }
            
            // Renderizar según el formato elegido
            try {
                console.log('Intentando renderizar con formato:', visualizationFormat);
                switch (visualizationFormat) {
                    case 'markmap':
                        await renderMarkmap(data, container);
                        break;
                    case 'mermaid':
                        await renderMermaid(data, container);
                        break;
                    case 'd3':
                        await renderD3ConceptMap(data, container);
                        break;
                    default:
                        await renderMarkmap(data, container);
                }
            } catch (renderError) {
                console.error('Error al renderizar con formato principal, intentando método alternativo:', renderError);
                
                // Intentar con un método alternativo si el principal falla
                try {
                    // Mostramos una tabla simple como método alternativo
                    renderConceptsAsTable(data, container);
                } catch (fallbackError) {
                    console.error('Error en método alternativo de renderizado:', fallbackError);
                    container.innerHTML = `
                        <div class="alert alert-danger">
                            <h4>Error al visualizar el mapa conceptual</h4>
                            <p>No se pudo renderizar el mapa conceptual. Error: ${renderError.message}</p>
                            <p>Detalles: ${fallbackError.message}</p>
                        </div>
                    `;
                }
            }
            
            // Mostrar estadísticas y conclusión si existen
            if (data.conclusion) {
                renderConclusion(data.conclusion);
            }
            
            // Activar botones de interacción
            document.getElementById('download-btn').disabled = false;
            document.getElementById('share-btn').disabled = false;
            document.getElementById('edit-btn').disabled = false;
            
        } catch (error) {
            console.error('Error al renderizar mapa conceptual:', error);
            const container = document.getElementById('diagramContainer');
            container.innerHTML = `<div class="alert alert-danger">Error al visualizar el mapa conceptual: ${error.message}</div>`;
        }
    }

    function applyVisualStyle(style) {
        const container = document.getElementById('diagramContainer');
        const rootElement = document.documentElement;
        
        // Aplicar tema de color
        if (style.theme) {
            if (style.theme === 'dark') {
                rootElement.style.setProperty('--node-color', '#e0e0e0');
                rootElement.style.setProperty('--node-bg', '#2d2d2d');
                rootElement.style.setProperty('--line-color', '#888');
                container.classList.add('dark-theme');
            } else if (style.theme === 'light') {
                rootElement.style.setProperty('--node-color', '#333');
                rootElement.style.setProperty('--node-bg', '#f5f5f5');
                rootElement.style.setProperty('--line-color', '#666');
                container.classList.add('light-theme');
            } else if (style.theme === 'colorful') {
                rootElement.style.setProperty('--node-color', '#fff');
                rootElement.style.setProperty('--node-bg', '#3498db');
                rootElement.style.setProperty('--line-color', '#e74c3c');
                container.classList.add('colorful-theme');
            }
        }
        
        // Aplicar tipo de fuente
        if (style.font) {
            rootElement.style.setProperty('--main-font', style.font);
        }
        
        // Aplicar animaciones si están habilitadas
        if (style.animations === true) {
            container.classList.add('animated-map');
        }
    }

    function renderConclusion(conclusion) {
        const outputTab = document.getElementById('output-tab');
        
        // Crear elemento para la conclusión si no existe
        let conclusionContainer = document.getElementById('conclusion-container');
        if (!conclusionContainer) {
            conclusionContainer = document.createElement('div');
            conclusionContainer.id = 'conclusion-container';
            conclusionContainer.className = 'conclusion-container mt-4';
            outputTab.querySelector('.output-container').appendChild(conclusionContainer);
        }
        
        // Contenido de la conclusión
        let content = `
            <h3>Resumen del Mapa Conceptual</h3>
            <div class="conclusion-content">
        `;
        
        if (conclusion.summary) {
            content += `<p class="conclusion-summary">${conclusion.summary}</p>`;
        }
        
        if (conclusion.statistics) {
            content += `
                <div class="conclusion-stats">
                    <h4>Estadísticas</h4>
                    <ul>
                        <li><strong>Conceptos:</strong> ${conclusion.statistics.totalConcepts || 0}</li>
                        <li><strong>Relaciones:</strong> ${conclusion.statistics.totalRelationships || 0}</li>
                        <li><strong>Nivel de profundidad:</strong> ${conclusion.statistics.maxDepth || 0}</li>
                        <li><strong>Concepto central:</strong> ${conclusion.statistics.centralConcept || 'No identificado'}</li>
                    </ul>
                </div>
            `;
        }
        
        content += `</div>`;
        conclusionContainer.innerHTML = content;
    }

    // Función para renderizar conceptos como tabla simple (método alternativo de visualización)
    function renderConceptsAsTable(data, container) {
        console.log('Renderizando conceptos como tabla simple');
        
        // Crear tabla de conceptos
        const conceptsTable = document.createElement('div');
        conceptsTable.className = 'concepts-table';
        conceptsTable.style.width = '100%';
        conceptsTable.style.padding = '20px';
        conceptsTable.style.backgroundColor = '#f5f5f5';
        conceptsTable.style.borderRadius = '8px';
        
        // Título
        const title = document.createElement('h3');
        title.textContent = 'Mapa Conceptual (Visualización Simple)';
        title.style.textAlign = 'center';
        title.style.marginBottom = '20px';
        title.style.color = '#333';
        conceptsTable.appendChild(title);
        
        // Conceptos principales
        const mainConcepts = document.createElement('div');
        mainConcepts.className = 'main-concepts';
        mainConcepts.style.marginBottom = '30px';
        
        // Filtrar conceptos principales (sin padres o de nivel superior)
        const topLevelConcepts = data.concepts.filter(c => 
            !c.parentId || c.hierarchyLevel === 0 || c.hierarchyLevel === 1
        ).slice(0, 5); // Limitar a 5 conceptos principales
        
        mainConcepts.innerHTML = `
            <h4 style="margin-bottom: 10px;">Conceptos Principales</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
                ${topLevelConcepts.map(concept => `
                    <div style="padding: 10px 15px; background-color: #3498db; color: white; 
                         border-radius: 20px; font-weight: bold;">
                        ${concept.name}
                    </div>
                `).join('')}
            </div>
        `;
        conceptsTable.appendChild(mainConcepts);
        
        // Lista completa de conceptos
        const conceptsList = document.createElement('div');
        conceptsList.className = 'concepts-list';
        conceptsList.style.marginBottom = '30px';
        
        // Ordenar conceptos por importancia o jerarquía
        const sortedConcepts = [...data.concepts].sort((a, b) => {
            // Priorizar por importancia
            if (a.importance === 'high' && b.importance !== 'high') return -1;
            if (a.importance !== 'high' && b.importance === 'high') return 1;
            
            // Luego por nivel jerárquico
            return (a.hierarchyLevel || 0) - (b.hierarchyLevel || 0);
        });
        
        conceptsList.innerHTML = `
            <h4 style="margin-bottom: 10px;">Todos los Conceptos</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;">
                ${sortedConcepts.map(concept => `
                    <div style="padding: 10px; background-color: ${
                        concept.importance === 'high' ? '#e74c3c' : 
                        concept.importance === 'medium' ? '#f39c12' : '#2ecc71'
                    }; color: white; border-radius: 5px;">
                        <div style="font-weight: bold;">${concept.name}</div>
                        ${concept.description ? `<div style="font-size: 0.9em; margin-top: 5px;">${concept.description}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
        conceptsTable.appendChild(conceptsList);
        
        // Relaciones principales
        if (data.relationships && data.relationships.length > 0) {
            const relationshipsList = document.createElement('div');
            relationshipsList.className = 'relationships-list';
            
            // Limitar a 15 relaciones para no saturar
            const topRelationships = data.relationships.slice(0, 15);
            
            relationshipsList.innerHTML = `
                <h4 style="margin-bottom: 10px;">Relaciones Principales</h4>
                <div style="padding: 10px; background-color: #fff; border-radius: 5px;">
                    <ul style="list-style-type: none; padding: 0;">
                        ${topRelationships.map(rel => {
                            const sourceConcept = data.concepts.find(c => c.id === rel.sourceId);
                            const targetConcept = data.concepts.find(c => c.id === rel.targetId);
                            if (sourceConcept && targetConcept) {
                                return `
                                    <li style="padding: 5px; border-bottom: 1px solid #eee;">
                                        <b>${sourceConcept.name}</b> 
                                        <span style="color: #666; font-style: italic;">${rel.type || 'relacionado con'}</span> 
                                        <b>${targetConcept.name}</b>
                                    </li>
                                `;
                            }
                            return '';
                        }).join('')}
                    </ul>
                </div>
            `;
            conceptsTable.appendChild(relationshipsList);
        }
        
        // Añadir botón para alternar a otro formato
        const formatToggle = document.createElement('div');
        formatToggle.style.textAlign = 'center';
        formatToggle.style.marginTop = '20px';
        formatToggle.innerHTML = `
            <p style="margin-bottom: 10px; color: #666;">
                Formato alternativo simple activado debido a problemas con el renderizador principal.
            </p>
            <button id="try-alternative-format" style="padding: 8px 15px; background-color: #333; color: white; 
                    border: none; border-radius: 4px; cursor: pointer;">
                Intentar con formato Mermaid
            </button>
        `;
        conceptsTable.appendChild(formatToggle);
        
        // Añadir al contenedor
        container.appendChild(conceptsTable);
        
        // Evento para el botón de formato alternativo
        document.getElementById('try-alternative-format').addEventListener('click', async () => {
            try {
                await renderMermaid(data, container);
            } catch (error) {
                console.error('Error al intentar formato alternativo:', error);
                alert('No se pudo renderizar con el formato alternativo. Por favor, intenta recargar la página.');
            }
        });
    }
});
