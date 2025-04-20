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
    
    // Exponer funciones y variables importantes en el objeto window para acceso global
    window.currentMapData = null;
    window.renderMarkmap = renderMarkmap;
    window.renderMermaid = renderMermaid;
    window.renderD3ConceptMap = renderD3ConceptMap;
    window.renderModularConceptMap = renderModularConceptMap;
    window.renderConceptsAsTable = renderConceptsAsTable;
    
    // Añadir funcionalidad para los botones de formato
    const formatButtons = document.querySelectorAll('#visualization-controls button');
    if (formatButtons.length > 0) {
        console.log('Inicializando botones de formato de visualización...');
        
        formatButtons.forEach(button => {
            button.addEventListener('click', function() {
                const format = this.getAttribute('data-format');
                
                // Resaltar el botón activo
                formatButtons.forEach(btn => {
                    btn.classList.remove('active', 'btn-primary');
                    btn.classList.add('btn-outline-primary');
                });
                this.classList.add('active', 'btn-primary');
                this.classList.remove('btn-outline-primary');
                
                // Si hay un mapa actual, intentar cambiar su visualización
                if (window.currentMapData) {
                    const container = document.getElementById('diagramContainer');
                    
                    // Mostrar indicador de carga
                    container.classList.add('loading');
                    container.innerHTML = '';
                    
                    // Determinar qué función de renderizado usar según el formato
                    setTimeout(() => {
                        try {
                            if (format === 'markmap') {
                                renderMarkmap(window.currentMapData, container);
                            } else if (format === 'mermaid') {
                                renderMermaid(window.currentMapData, container);
                            } else if (format === 'd3') {
                                renderD3ConceptMap(window.currentMapData, container);
                            } else {
                                throw new Error(`Formato "${format}" no soportado`);
                            }
                        } catch (error) {
                            console.error('Error al cambiar formato:', error);
                            container.innerHTML = `
                                <div class="alert alert-danger">
                                    <h4>Error al cambiar visualización</h4>
                                    <p>${error.message}</p>
                                    <p>Intente recargar la página o utilice otro formato de visualización.</p>
            </div>
        `;
                        } finally {
                            container.classList.remove('loading');
                        }
                    }, 100);
                } else {
                    console.log('No hay datos de mapa conceptual para visualizar');
                }
            });
        });
    } else {
        console.warn('No se encontraron botones de formato de visualización');
    }

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
        
            // Desactivar el botón durante el procesamiento
            generateBtn.disabled = true;
            generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        
        // Mostrar indicador de carga
        showLoading(true);
        
            // Obtener opciones de configuración
            const options = {
                stages: {
                    organization: document.getElementById('stage1')?.checked ?? true,
                    reasoning: document.getElementById('stage2')?.checked ?? true,
                    enrichment: document.getElementById('stage3')?.checked ?? true,
                    validation: document.getElementById('stage4')?.checked ?? true,
                    aesthetics: document.getElementById('stage5')?.checked ?? true
                },
                visualStyle: document.getElementById('visual-style')?.value || 'professional',
                complexity: document.getElementById('complexity')?.value || 3
            };
            
            console.log('Opciones de configuración:', options);
            console.log('Texto a procesar (primeros 50 caracteres):', 
                text ? text.substring(0, 50) + '...' : 'No hay texto');
            
            // Simular procesamiento por etapas para UI
            await simulateProcessing(options);
            
            // Llamada a la API para generar el mapa conceptual
            console.log('Iniciando llamada a la API...');
            let response;
            
            try {
                response = await fetch('/api/generate-map', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text, options })
            });
            
            console.log('Respuesta API status:', response.status);
            } catch (networkError) {
                console.error('Error de red al contactar la API:', networkError);
                throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
            }
            
            // Manejar errores de la API
            if (!response.ok) {
                let errorMessage = `Error del servidor: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    // Si no podemos parsear como JSON, intentamos obtener texto
                    try {
                        errorMessage = await response.text();
                    } catch (textError) {
                        // Si todo falla, mantenemos el mensaje original
                    }
                }
                throw new Error(errorMessage);
            }
            
            // Procesar datos recibidos
            let data;
            try {
                data = await response.json();
                console.log('Datos recibidos (resumidos):', {
                    success: data.success,
                    resultKeys: data.result ? Object.keys(data.result) : 'No hay result',
                    hasContent: data.result?.content ? true : false
                });
            } catch (parseError) {
                console.error('Error al parsear la respuesta JSON:', parseError);
                throw new Error('La respuesta del servidor no es válida. Inténtalo de nuevo más tarde.');
            }
            
            // Verificar si la respuesta es exitosa
            if (!data.success) {
                console.error('La API reportó un error:', data.error);
                throw new Error(data.error || 'Error desconocido al procesar el texto');
            }
            
            // Determinar la estructura de datos correcta
            let contentData = null;
            
            if (data.result && data.result.content) {
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
                throw new Error('Datos incompletos o en formato incorrecto');
            }
            
            // Validar que contentData tenga la estructura mínima necesaria
            if (!contentData.concepts || !Array.isArray(contentData.concepts)) {
                console.error('Los datos no contienen conceptos válidos', contentData);
                contentData = {
                    concepts: [],
                    relationships: [],
                    title: "Error: Datos incompletos"
                };
            }
            
            // Guardar los datos del mapa
            currentMapData = contentData;
            
            // Asegurar accesibilidad global para el selector de formato de visualización
            window.currentMapData = contentData;
            
            // Seleccionar el formato de visualización más apropiado basado en la complejidad
            let visualizationFormat = 'markmap'; // Formato predeterminado
            const conceptCount = contentData.concepts?.length || 0;
            
            if (conceptCount > 50) {
                visualizationFormat = 'd3'; // Para mapas muy complejos
            } else if (conceptCount > 20) {
                visualizationFormat = 'mermaid'; // Para mapas de complejidad media
            }
            
            // Seleccionar el botón de formato correspondiente
            const formatButton = document.querySelector(`#visualization-controls button[data-format="${visualizationFormat}"]`);
            if (formatButton) {
                // Simular clic en el botón para activar ese formato
                formatButton.click();
            } else {
                // Renderizar directamente si no se encontró el botón
                try {
                // Renderizar el mapa conceptual
                    await renderModularConceptMap(contentData);
                } catch (renderError) {
                    console.error('Error al renderizar el mapa:', renderError);
                    throw new Error(`Error al visualizar el mapa: ${renderError.message}`);
                }
            }
                
                // Cambiar a la pestaña de salida
                document.querySelector('[data-tab="output"]').click();
            
            // Activar los botones de acción
            document.getElementById('download-btn').disabled = false;
            document.getElementById('share-btn').disabled = false;
            document.getElementById('edit-btn').disabled = false;
                
                showNotification('Mapa conceptual generado exitosamente', 'success');
        } catch (error) {
            console.error('Error al generar el mapa conceptual:', error);
            
            // Mostrar una notificación de error amigable
            const errorContainer = document.getElementById('diagramContainer');
            if (errorContainer) {
                errorContainer.innerHTML = `
                    <div class="alert alert-danger">
                        <h4><i class="fas fa-exclamation-triangle"></i> Error al generar el mapa conceptual</h4>
                        <p>${error.message}</p>
                        <button class="btn btn-sm btn-outline-danger mt-2" onclick="document.querySelector('[data-tab=\\'input\\']').click()">
                            Volver al editor
                        </button>
                    </div>
                `;
                
                // Cambiar a la pestaña de salida para mostrar el error
                document.querySelector('[data-tab="output"]').click();
            }
            
            showNotification(error.message, 'error');
        } finally {
            // Restaurar el botón y ocultar el indicador de carga
            generateBtn.disabled = false;
            generateBtn.innerHTML = 'Generar Mapa Conceptual';
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
            if (!targetContainer) {
                throw new Error('No se encontró el contenedor para el mapa');
            }
            
            // Limpiar el contenedor antes de renderizar
            targetContainer.innerHTML = '';
            
            // Crear el contenedor específico para markmap
            const markmapContainer = document.createElement('div');
            markmapContainer.className = 'markmap';
            targetContainer.appendChild(markmapContainer);
            
            // Si no hay datos, mostrar un mensaje
            if (!data) {
                markmapContainer.innerHTML = '<div class="alert alert-warning">No hay datos disponibles para visualizar.</div>';
                return;
            }
            
            console.log('Preparando datos para Markmap:', typeof data);
            
            // Convertir los datos al formato adecuado según su tipo
            let markdownContent = '';
            
            if (typeof data === 'string') {
                // Ya es una cadena, posiblemente markdown
                markdownContent = data;
            } else if (data.concepts && Array.isArray(data.concepts)) {
                // Es un objeto con conceptos, convertir a markdown
                markdownContent = convertConceptsToMarkdown(data.concepts, data.relationships || []);
            } else {
                // Intentar usar como está o convertir a string
                markdownContent = JSON.stringify(data, null, 2);
            }
            
            // Parsear el markdown a una estructura de nodos para markmap
            const markdownNodes = parseMarkdownToNodes(markdownContent);
            
            // Verificación de seguridad
            if (!markdownNodes) {
                throw new Error('No se pudo generar la estructura de nodos para el mapa');
            }
            
            // Crear el SVG para markmap
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100%');
            markmapContainer.appendChild(svg);
            
            // Función para transformar la estructura de nodos al formato esperado por markmap
            const transformNodeToMarkmap = (node) => {
                if (!node) return null;
                
                // Formato para markmap: { t: title, d: depth, v: value/content, c: children }
                const markmapNode = {
                    t: node.name || 'Sin título',
                    d: 0, // Será ajustado más adelante
                    v: node.content || '',
                    c: []
                };
                
                // Procesar hijos recursivamente
                if (node.children && Array.isArray(node.children) && node.children.length > 0) {
                    markmapNode.c = node.children
                        .map(child => transformNodeToMarkmap(child))
                        .filter(child => child !== null);
                }
                
                return markmapNode;
            };
            
            // Convertir la estructura de nodos al formato de markmap
            const markmapTree = transformNodeToMarkmap(markdownNodes);
            
            // Función recursiva para ajustar las profundidades
            const adjustDepths = (nodes, depth = 1) => {
                if (!nodes) return;
                
                nodes.forEach(node => {
                    node.d = depth;
                    if (node.c && node.c.length > 0) {
                        adjustDepths(node.c, depth + 1);
                    }
                });
            };
            
            // Ajustar profundidades
            if (markmapTree && markmapTree.c) {
                adjustDepths([markmapTree], 1);
            }
            
            // Configuración de markmap
            const { Markmap, loadCSS, loadJS } = window.markmap;
            
            // Cargar estilos y scripts necesarios
            const { styles, scripts } = window.markmap.getUsedAssets([markmapTree]);
            if (styles) loadCSS(styles);
            if (scripts) await loadJS(scripts);
            
            // Crear la instancia de markmap
            const mm = Markmap.create(svg, {
                autoFit: true,
                color: (node) => {
                    // Colores según nivel de profundidad
                    const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b'];
                    return colors[(node.d - 1) % colors.length];
                },
                duration: 500,
                maxWidth: 300,
                paddingX: 30
            }, [markmapTree]);
            
            // Agregar controles de zoom si está disponible la función
            if (typeof addZoomControls === 'function') {
                addZoomControls(svg, mm);
            }
            
            // Agregar tooltips si está disponible la función
            if (typeof addNodeTooltips === 'function') {
                addNodeTooltips(svg, data);
            }
            
            // Guardar referencia a la instancia de markmap
            targetContainer.markmapInstance = mm;
            
            return mm; // Devolver la instancia de markmap
            
        } catch (error) {
            console.error('Error al renderizar markmap:', error);
            
            // Mostrar mensaje de error en el contenedor
            if (container) {
                container.innerHTML = `
                    <div class="alert alert-danger">
                        <h4>Error al visualizar el mapa conceptual</h4>
                        <p>${error?.message || 'Error desconocido'}</p>
                        <small>Consulta la consola del navegador para más detalles.</small>
                    </div>
                `;
            }
            
            showNotification('Error al visualizar el mapa: ' + (error?.message || 'Error desconocido'), 'error');
        }
    }

    function applyVisualStyle(style) {
        if (!style) return; // No aplicar si no hay estilo
        
        const container = document.getElementById('diagramContainer');
        const rootElement = document.documentElement;
        
        // Aplicar tema de color
        if (style.theme) {
            if (style.theme === 'dark') {
                rootElement.style.setProperty('--node-color', '#e0e0e0');
                rootElement.style.setProperty('--node-bg', '#2d2d2d');
                rootElement.style.setProperty('--line-color', '#888');
                container?.classList.add('dark-theme');
            } else if (style.theme === 'light') {
                rootElement.style.setProperty('--node-color', '#333');
                rootElement.style.setProperty('--node-bg', '#f5f5f5');
                rootElement.style.setProperty('--line-color', '#666');
                container?.classList.add('light-theme');
            } else if (style.theme === 'colorful') {
                rootElement.style.setProperty('--node-color', '#fff');
                rootElement.style.setProperty('--node-bg', '#3498db');
                rootElement.style.setProperty('--line-color', '#e74c3c');
                container?.classList.add('colorful-theme');
            }
        }
        
        // Aplicar tipo de fuente
        if (style.font) {
            rootElement.style.setProperty('--main-font', style.font);
        }
        
        // Aplicar animaciones si están habilitadas
        if (style.animations === true) {
            container?.classList.add('animated-map');
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

    // Función de fallback si falla la estructura de árbol
    function fallbackForceSimulation(svg, data) {
        console.log('Aplicando layout de fallback mejorado');
        
        // Asegurarnos de que los datos son válidos
        if (!data || !data.nodes || data.nodes.length === 0) {
            svg.append("text")
                .attr("text-anchor", "middle")
                .attr("x", 0)
                .attr("y", 0)
                .text("No hay datos suficientes para visualizar")
                .style("font-size", "16px")
                .style("fill", "#666");
            return;
        }
        
        // Encontrar el nodo raíz (nivel 1 o el primer nodo)
        const rootNode = data.nodes.find(n => n.level === 1) || data.nodes[0];
        
        // Añadir marcador de flecha para los enlaces
        svg.append('defs').append('marker')
            .attr('id', 'arrowhead-fallback')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 25) // Ajustado para evitar solapamiento con nodos
            .attr('refY', 0)
            .attr('orient', 'auto')
            .attr('markerWidth', 8)
            .attr('markerHeight', 8)
            .attr('xoverflow', 'visible')
            .append('svg:path')
            .attr('d', 'M 0,-5 L 10,0 L 0,5')
            .attr('fill', '#999')
            .style('stroke', 'none');
        
        // Crear la simulación de fuerzas
        const simulation = d3.forceSimulation(data.nodes)
            // Fuerza para enlaces con distancia ajustada según importancia
            .force('link', d3.forceLink(data.links)
                .id(d => d.id)
                .distance(d => {
                    // Mayor distancia para enlaces menos importantes
                    if (d.source.importance === 'high' && d.target.importance === 'high') return 130;
                    if (d.source.importance === 'high' || d.target.importance === 'high') return 150;
                    if (d.source.importance === 'medium' || d.target.importance === 'medium') return 170;
                    return 190;
                }))
            // Fuerza repulsiva entre nodos, más fuerte para nodos importantes
            .force('charge', d3.forceManyBody()
                .strength(d => {
                    if (d.id === rootNode.id) return -400; // Nodo raíz más repulsivo
                    if (d.importance === 'high') return -250;
                    if (d.importance === 'medium') return -180;
                    return -130;
                }))
            .force('center', d3.forceCenter(0, 0))
            // Prevenir solapamiento con radio basado en importancia
            .force('collision', d3.forceCollide().radius(d => {
                if (d.id === rootNode.id) return 60;
                if (d.importance === 'high') return 45;
                if (d.importance === 'medium') return 35;
                return 25;
            }))
            // Fuerza vertical basada en nivel jerárquico
            .force('y', d3.forceY().strength(0.1).y(d => {
                if (d.id === rootNode.id) return -100; // Nodo raíz más arriba
                return (d.level - 1) * 120 - 50;
            }))
            // Distribución radial para conceptos del mismo nivel
            .force('x', d3.forceX().strength(0.05).x(d => {
                if (d.id === rootNode.id) return 0; // Nodo raíz centrado
                // Distribuir nodos en semicírculo basado en su nivel y orden alfabético
                const angleOffset = (d.name.charCodeAt(0) % 26) / 26; // 0-1 basado en primera letra
                const angle = (angleOffset * Math.PI) + Math.PI / 2;
                const distance = 180 * d.level;
                return Math.cos(angle) * distance;
            }));
        
        // Crear contenedor para etiquetas de relación
        const labelGroup = svg.append('g').attr('class', 'relationship-labels');
        
        // Añadir enlaces con estilo mejorado
        const link = svg.append('g')
            .attr('class', 'links')
            .selectAll('path') // Usar path en lugar de line para curvar los enlaces
            .data(data.links)
            .enter()
            .append('path')
            .attr('stroke', d => {
                if (d.type === 'hierarchy' || d.type === 'parent') return '#7c4dff';
                if (d.type === 'definition') return '#00b0ff';
                if (d.importance === 'high') return '#e57373';
                return '#90a4ae';
            })
            .attr('stroke-opacity', 0.7)
            .attr('stroke-width', d => {
                if (d.source.id === rootNode.id || d.target.id === rootNode.id) return 3;
                if (d.importance === 'high') return 2.5;
                if (d.importance === 'medium') return 1.5;
                return 1;
            })
            .attr('stroke-dasharray', d => {
                // Líneas punteadas para relaciones no jerárquicas
                if (d.type !== 'hierarchy' && d.type !== 'parent') return '3,3';
                return null;
            })
            .attr('fill', 'none')
            .attr('marker-end', 'url(#arrowhead-fallback)');
        
        // Añadir nodos
        const node = svg.append('g')
            .attr('class', 'nodes')
            .selectAll('g')
            .data(data.nodes)
            .enter()
            .append('g')
            .attr('class', d => `node-group level-${d.level} importance-${d.importance}`)
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended));
        
        // Círculos para nodos con estilos mejorados
        node.append('circle')
            .attr('r', d => {
                if (d.id === rootNode.id) return 40;
                if (d.importance === 'high') return 30;
                if (d.importance === 'medium') return 22;
                return 15;
            })
            .attr('fill', d => {
                if (d.id === rootNode.id) return '#ff7043'; // Tema principal
                if (d.importance === 'high') return '#f44336'; // Conceptos importantes
                if (d.importance === 'medium') return '#2196f3'; // Conceptos medios
                return '#4caf50'; // Conceptos regulares
            })
            .attr('stroke', '#fff')
            .attr('stroke-width', d => d.id === rootNode.id ? 3 : 2)
            // Añadir brillo para resaltar nodos importantes
            .attr('filter', d => {
                if (d.id === rootNode.id) return 'url(#glow-strong)';
                if (d.importance === 'high') return 'url(#glow-medium)';
                return null;
            });
        
        // Definir filtros de brillo
        const defs = svg.append('defs');
        
        // Brillo fuerte para nodo raíz
        const glowStrong = defs.append('filter')
            .attr('id', 'glow-strong')
            .attr('x', '-50%')
            .attr('y', '-50%')
            .attr('width', '200%')
            .attr('height', '200%');
        
        glowStrong.append('feGaussianBlur')
            .attr('stdDeviation', '6')
            .attr('result', 'coloredBlur');
            
        const femergeStrong = glowStrong.append('feMerge');
        femergeStrong.append('feMergeNode').attr('in', 'coloredBlur');
        femergeStrong.append('feMergeNode').attr('in', 'SourceGraphic');
        
        // Brillo medio para nodos importantes
        const glowMedium = defs.append('filter')
            .attr('id', 'glow-medium')
            .attr('x', '-50%')
            .attr('y', '-50%')
            .attr('width', '200%')
            .attr('height', '200%');
        
        glowMedium.append('feGaussianBlur')
            .attr('stdDeviation', '3')
            .attr('result', 'coloredBlur');
            
        const femergeMedium = glowMedium.append('feMerge');
        femergeMedium.append('feMergeNode').attr('in', 'coloredBlur');
        femergeMedium.append('feMergeNode').attr('in', 'SourceGraphic');
        
        // Texto para nodos con mejor legibilidad
        node.append('text')
            .text(d => d.name)
            .attr('dy', d => d.id === rootNode.id ? 6 : 4)
            .attr('text-anchor', 'middle')
            .style('fill', d => {
                if (d.id === rootNode.id || d.importance === 'high') {
                    return '#fff';
                }
                return '#333';
            })
            .style('font-weight', d => {
                if (d.id === rootNode.id) return 'bold';
                if (d.importance === 'high') return 'bold';
                return 'normal';
            })
            .style('font-size', d => {
                if (d.id === rootNode.id) return '16px';
                if (d.importance === 'high') return '14px';
                if (d.importance === 'medium') return '12px';
                return '10px';
            })
            .style('pointer-events', 'none')
            .each(function(d) {
                // Truncar texto si es demasiado largo
                const text = d3.select(this);
                const textLength = text.node().getComputedTextLength();
                const radius = d.id === rootNode.id ? 38 : 
                            d.importance === 'high' ? 28 : 
                            d.importance === 'medium' ? 20 : 14;
                
                if (textLength > radius * 2) {
                    let name = d.name;
                    // Truncar y añadir puntos suspensivos
                    while (text.node().getComputedTextLength() > radius * 2) {
                        name = name.slice(0, -1);
                        text.text(name + '...');
                        if (name.length <= 3) break;
                    }
                }
            });
        
        // Añadir tooltips detallados
        node.append('title')
            .text(d => {
                let tooltip = `${d.name}`;
                if (d.description) tooltip += `\n\n${d.description}`;
                if (d.category) tooltip += `\n\nCategoría: ${d.category}`;
                if (d.examples && d.examples.length > 0) {
                    tooltip += `\n\nEjemplos: ${d.examples.join(', ')}`;
                }
                if (d.properties && d.properties.length > 0) {
                    tooltip += `\n\nPropiedades: ${d.properties.join(', ')}`;
                }
                return tooltip;
            });
        
        // Agregar etiquetas solo para relaciones importantes
        const relationshipLabels = labelGroup.selectAll('text')
            .data(data.links.filter(d => 
                (d.importance === 'high' || d.source.id === rootNode.id || d.target.id === rootNode.id) && 
                d.label && d.label !== 'relacionado con' && d.label !== 'related' 
            ))
            .enter()
            .append('text')
            .attr('dy', -5)
            .attr('text-anchor', 'middle')
            .style('font-size', '10px')
            .style('font-style', 'italic')
            .style('fill', '#666')
            .style('pointer-events', 'none')
            .text(d => d.label);
        
        // Funciones para manejar el arrastre de nodos
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
            // Mantener fijos solo los nodos importantes
            if (d.id !== rootNode.id && d.importance !== 'high') {
                d.fx = null;
                d.fy = null;
            }
        }
        
        // Función para generar curvas para los enlaces
        function linkArc(d) {
            const dx = d.target.x - d.source.x;
            const dy = d.target.y - d.source.y;
            const dr = Math.sqrt(dx * dx + dy * dy) * 1.5; // Factor de curvatura
            
            // Si es una relación jerárquica, línea recta
            if (d.type === 'hierarchy' || d.type === 'parent') {
                return `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`;
            }
            
            // Si no, añadir curva
            return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
        }
        
        // Actualizar posiciones en cada tick
        simulation.on('tick', () => {
            link.attr('d', linkArc);
            
            node.attr('transform', d => `translate(${d.x}, ${d.y})`);
            
            // Actualizar posición de las etiquetas de relación
            relationshipLabels
                .attr('transform', d => {
                    // Posición a mitad de camino entre nodos con pequeño desplazamiento
                    const midX = (d.source.x + d.target.x) / 2;
                    const midY = (d.source.y + d.target.y) / 2;
                    
                    // Pequeño desplazamiento perpendicular a la línea
                    const dx = d.target.x - d.source.x;
                    const dy = d.target.y - d.source.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    const offsetX = -dy / dist * 10;
                    const offsetY = dx / dist * 10;
                    
                    return `translate(${midX + offsetX}, ${midY + offsetY})`;
                });
        });
        
        // Añadir el zoom
        const zoom = d3.zoom()
            .scaleExtent([0.5, 4])
            .on('zoom', (event) => {
                svg.attr('transform', event.transform);
            });
        
        d3.select(svg.node().parentNode)
            .call(zoom)
            .on('dblclick.zoom', null);
        
        // Fijar posición inicial del nodo raíz para mejor organización
        if (rootNode) {
            rootNode.fx = 0;
            rootNode.fy = -100;
        }
        
        // Fijar posiciones iniciales de nodos importantes (nivel 2) para mejor organización
        data.nodes.filter(n => n.level === 2).forEach((node, i, arr) => {
            const angle = (i / arr.length) * 2 * Math.PI;
            const radius = 200;
            node.fx = Math.cos(angle) * radius;
            node.fy = Math.sin(angle) * radius - 50;
        });
        
        // Ejecutar la simulación con enfriamiento gradual
        simulation
            .alpha(1)
            .alphaDecay(0.02) // Enfriamiento más lento para mejor organización
            .restart();
    }
});
