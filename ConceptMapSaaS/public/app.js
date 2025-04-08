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
    
    // Generar mapa conceptual
    generateBtn.addEventListener('click', async () => {
        const text = textInput.value.trim();
        
        if (!text) {
            showNotification('Por favor, ingresa un texto para generar el mapa conceptual', 'error');
            return;
        }
        
        // Mostrar indicador de carga
        showLoading(true);
        
        try {
            // Recopilar opciones de configuración
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
            console.log('Texto a procesar (primeros 50 caracteres):', text.substring(0, 50));
            
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
                // Guardar los datos del mapa - accediendo a la estructura correcta
                currentMapData = data.result.content;
                console.log('Contenido del mapa (primeros 100 caracteres):', data.result.content.substring(0, 100));
                
                // Renderizar el mapa conceptual
                renderMarkmap(data.result.content);
                
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
    
    // Función para renderizar el mapa conceptual usando Mermaid
    function renderMarkmap(content) {
        // Limpiar el contenedor
        markmapContainer.innerHTML = '';
        
        try {
            // Parsear el contenido markdown en HTML
            const htmlContent = marked.parse(content);
            
            // Crear un elemento div para mostrar el contenido
            const div = document.createElement('div');
            div.className = 'concept-map-container';
            div.innerHTML = htmlContent;
            markmapContainer.appendChild(div);
            
            // Extraer código Mermaid del contenido HTML
            let mermaidCode = '';
            const mermaidDivs = div.querySelectorAll('code');
            mermaidDivs.forEach((mermaidDiv) => {
                if (mermaidDiv.parentElement.tagName === 'PRE' && 
                   (mermaidDiv.textContent.includes('graph TD') || mermaidDiv.textContent.includes('flowchart TD'))) {
                    mermaidCode = mermaidDiv.textContent.trim();
                    // Eliminar el bloque de código original
                    mermaidDiv.parentElement.remove();
                }
            });
            
            // Si encontramos código Mermaid, creamos un contenedor dedicado para él
            if (mermaidCode) {
                // Crear un contenedor para el diagrama Mermaid
                const mermaidContainer = document.createElement('div');
                mermaidContainer.id = 'mermaid-concept-map';
                mermaidContainer.className = 'mermaid-container';
                div.appendChild(mermaidContainer);
                
                // Reinicializar Mermaid con configuración optimizada para mapas conceptuales
                mermaid.initialize({
                    startOnLoad: false,
                    securityLevel: 'loose',
                    theme: 'default',
                    fontFamily: 'var(--font-sans)',
                    flowchart: {
                        htmlLabels: true,
                        curve: 'basis',
                        useMaxWidth: true,
                        rankSpacing: 80,
                        nodeSpacing: 50,
                        padding: 15
                    }
                });
                
                // Aplicar estilos personalizados al SVG una vez renderizado
                const customStyleFunction = (svgElement) => {
                    // Añadir estilos a los nodos rectangulares
                    const rectNodes = svgElement.querySelectorAll('.node rect');
                    rectNodes.forEach(node => {
                        node.setAttribute('rx', '10');
                        node.setAttribute('ry', '10');
                        node.setAttribute('stroke-width', '2');
                    });
                    
                    // Mejorar los estilos de las flechas
                    const arrows = svgElement.querySelectorAll('.flowchart-link, .messageText');
                    arrows.forEach(arrow => {
                        arrow.setAttribute('stroke-width', '2');
                    });
                    
                    // Ajustar el tamaño del SVG
                    svgElement.setAttribute('width', '100%');
                    svgElement.setAttribute('height', 'auto');
                    
                    // Añadir clases para los estilos en CSS
                    svgElement.classList.add('concept-map-svg');
                };
                
                // Renderizar el diagrama Mermaid
                mermaid.render('concept-map-svg', mermaidCode)
                    .then(result => {
                        mermaidContainer.innerHTML = result.svg;
                        
                        // Aplicar estilos personalizados al SVG
                        const svgElement = mermaidContainer.querySelector('svg');
                        if (svgElement) {
                            customStyleFunction(svgElement);
                        }
                    })
                    .catch(err => {
                        console.error('Error al renderizar Mermaid:', err);
                        mermaidContainer.innerHTML = `
                            <div class="error-message">
                                <p>Error al renderizar el mapa conceptual.</p>
                                <p><strong>Detalle técnico:</strong> ${err.message || 'Error desconocido'}</p>
                            </div>
                        `;
                    });
            }
            
            // Añadir estilos adicionales para el mapa conceptual
            const style = document.createElement('style');
            style.textContent = `
                .concept-map-container {
                    padding: 20px;
                    overflow: auto;
                    height: 100%;
                    font-family: var(--font-sans);
                }
                .concept-map-container h1 {
                    color: #4f46e5;
                    text-align: center;
                    margin-bottom: 20px;
                }
                .mermaid-container {
                    overflow: auto;
                    margin: 0 auto;
                    text-align: center;
                    padding: 20px 0;
                    width: 100%;
                }
                .mermaid-container svg {
                    max-width: 100%;
                    height: auto;
                    margin: 0 auto;
                    display: block;
                }
                .error-message {
                    color: #e53e3e;
                    background-color: #fff5f5;
                    border: 1px solid #fc8181;
                    border-radius: 5px;
                    padding: 15px;
                    margin: 20px 0;
                    text-align: left;
                }
            `;
            document.head.appendChild(style);
        } catch (error) {
            console.error('Error al renderizar el mapa conceptual:', error);
            markmapContainer.innerHTML = `
                <div class="error-message">
                    <p>Error al procesar el contenido del mapa conceptual.</p>
                    <p><strong>Detalle técnico:</strong> ${error.message || 'Error desconocido'}</p>
                </div>
            `;
        }
    }
    
    // Función para mostrar notificaciones
    function showNotification(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Añadir al DOM
        document.body.appendChild(notification);
        
        // Mostrar con animación
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Ocultar después de un tiempo
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
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
});
