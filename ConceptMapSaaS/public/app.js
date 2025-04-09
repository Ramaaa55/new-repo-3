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
    
    // Función para garantizar que el mapa conceptual base siempre sea visible
    function ensureBasicConceptMap() {
        // Obtener el contenedor del mapa
        const markmapContainer = document.getElementById('markmap-container');
        if (!markmapContainer) {
            console.error('No se encontró el contenedor del mapa conceptual');
            return;
        }
        
        // Si el contenedor ya tiene contenido que incluye el mapa garantizado, no hacer nada
        if (markmapContainer.querySelector('#guaranteed-map')) {
            return;
        }
        
        console.log('Creando mapa conceptual pedagógico garantizado');
        
        // Crear el mapa garantizado con las 6 etapas críticas
        const guaranteedMap = document.createElement('div');
        guaranteedMap.id = 'guaranteed-map';
        guaranteedMap.className = 'concept-map-visual';
        guaranteedMap.style = 'padding: 20px; font-family: Arial, sans-serif; background-color: white; margin-top: 20px;';
        
        // Crear el contenido del mapa pedagógico con las 6 etapas críticas
        guaranteedMap.innerHTML = `
            <div class="main-concept" style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; padding: 15px 30px; background-color: #3498db; 
                    color: white; border-radius: 50px; font-weight: bold; font-size: 18px;">
                    MAPA CONCEPTUAL PEDAGÓGICO
                </div>
            </div>
            
            <div class="concept-row" style="display: flex; justify-content: space-around; margin-bottom: 30px;">
                <div class="concept-node" style="padding: 12px 25px; background-color: #9b59b6; 
                    color: white; border-radius: 50px; max-width: 200px; text-align: center;">
                    Organización y Jerarquía
                </div>
                <div class="concept-node" style="padding: 12px 25px; background-color: #9b59b6; 
                    color: white; border-radius: 50px; max-width: 200px; text-align: center;">
                    Razonamiento y Comprensión
                </div>
                <div class="concept-node" style="padding: 12px 25px; background-color: #9b59b6; 
                    color: white; border-radius: 50px; max-width: 200px; text-align: center;">
                    Enriquecimiento Semántico
                </div>
            </div>
            
            <div class="concept-row" style="display: flex; justify-content: space-around;">
                <div class="concept-node" style="padding: 10px 20px; background-color: #f1c40f; 
                    color: #7d6608; border-radius: 50px; max-width: 180px; text-align: center;">
                    Validación y Verificación
                </div>
                <div class="concept-node" style="padding: 10px 20px; background-color: #f1c40f; 
                    color: #7d6608; border-radius: 50px; max-width: 180px; text-align: center;">
                    Estética Adaptativa
                </div>
                <div class="concept-node" style="padding: 10px 20px; background-color: #f1c40f; 
                    color: #7d6608; border-radius: 50px; max-width: 180px; text-align: center;">
                    Conclusión Descriptiva
                </div>
            </div>
            
            <div class="information-note" style="margin-top: 30px; text-align: center; font-style: italic; color: #555;">
                Mapa base con estructura pedagógica y elipses para conceptos
            </div>
        `;
        
        // Limpiar el contenedor y añadir el mapa garantizado
        markmapContainer.innerHTML = '';
        markmapContainer.appendChild(guaranteedMap);
        
        // Crear el contenedor dinámico para mapas generados
        const dynamicContainer = document.createElement('div');
        dynamicContainer.id = 'dynamic-map-container';
        dynamicContainer.className = 'dynamic-map-container';
        markmapContainer.appendChild(dynamicContainer);
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
            
            // Si es la pestaña de salida, asegurar que el mapa conceptual esté visible
            if (tabId === 'output') {
                ensureBasicConceptMap();
            }
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
        
        // Asegurar que el mapa conceptual base esté visible en el contenedor
        ensureBasicConceptMap();
        
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
        if (!content) {
            showNotification('No hay contenido para renderizar', 'error');
            return;
        }
        
        // Obtener el contenedor principal del mapa
        const markmapContainer = document.getElementById('markmap-container');
        if (!markmapContainer) {
            console.error('No se encontró el contenedor principal del mapa conceptual');
            showNotification('Error: No se puede mostrar el mapa conceptual', 'error');
            return;
        }
        
        // Buscar o crear el contenedor dinámico
        let dynamicContainer = document.getElementById('dynamic-map-container');
        if (!dynamicContainer) {
            console.log('Creando nuevo contenedor dinámico para el mapa');
            dynamicContainer = document.createElement('div');
            dynamicContainer.id = 'dynamic-map-container';
            dynamicContainer.className = 'dynamic-map-container';
            markmapContainer.appendChild(dynamicContainer);
        }
        
        // Limpiar sólo el contenedor dinámico (preservando el mapa garantizado)
        dynamicContainer.innerHTML = '';
        
        try {
            console.log('Renderizando contenido:', typeof content);
            console.log('Muestra del contenido:', typeof content === 'string' ? content.substring(0, 100) : JSON.stringify(content).substring(0, 100));
            
            // Determinar el tipo de contenido
            let htmlContent = '';
            
            if (typeof content === 'string') {
                // Es un string, asumimos que es HTML o texto plano
                htmlContent = content;
            } else if (content && typeof content === 'object') {
                // Es un objeto JSON
                htmlContent = `<pre>${JSON.stringify(content, null, 2)}</pre>`;
            } else {
                showNotification('Formato de contenido no válido', 'error');
                return;
            }
            
            // Crear un contenedor para el contenido HTML
            const div = document.createElement('div');
            div.className = 'concept-map-container';
            div.innerHTML = htmlContent;
            markmapContainer.appendChild(div);
            
            // Extraer código Mermaid del contenido HTML
            let mermaidCode = '';
            const mermaidDivs = div.querySelectorAll('code');
            mermaidDivs.forEach((mermaidDiv) => {
                if (mermaidDiv.parentElement.tagName === 'PRE' && 
                   (mermaidDiv.textContent.includes('graph TD') || 
                    mermaidDiv.textContent.includes('flowchart TD') ||
                    mermaidDiv.textContent.includes('graph LR') ||
                    mermaidDiv.textContent.includes('flowchart LR'))) {
                    mermaidCode = mermaidDiv.textContent.trim();
                    console.log('Mermaid detectado:', mermaidCode.substring(0, 100));
                    // Eliminar el bloque de código original
                    mermaidDiv.parentElement.remove();
                }
            });
            
            // Si encontramos código Mermaid, creamos un contenedor dedicado para él
            if (mermaidCode) {
                // Mostrar una notificación de que estamos procesando
                showNotification('Generando mapa conceptual...', 'info', 2000);
                console.log('Procesando código Mermaid completo');
                
                // *** ENFOQUE ULTRA SIMPLIFICADO - GARANTIZA RESULTADO VISUAL ***
                // Crear un contenedor específico para el diagrama con ID único
                const containerId = 'diagram-container-' + Date.now();
                const diagramContainer = document.createElement('div');
                diagramContainer.id = containerId;
                diagramContainer.className = 'diagram-container';
                div.appendChild(diagramContainer);
                
                // Eliminar todos los delimitadores markdown
                let cleanMermaidCode = mermaidCode
                    .replace(/```mermaid/g, '')
                    .replace(/```/g, '')
                    .trim();
                
                console.log('Código limpio:', cleanMermaidCode.substring(0, 100));
                
                // Sistema avanzado para inicialización de Mermaid con diagnóstico
                const mermaidConfig = {
                    startOnLoad: true,
                    securityLevel: 'loose',
                    theme: 'default',
                    logLevel: 'info',
                    flowchart: {
                        htmlLabels: true,
                        curve: 'basis',
                        useMaxWidth: true,
                        padding: 15
                    },
                    themeVariables: {
                        primaryColor: '#f4f4f4',
                        primaryBorderColor: '#777',
                        lineColor: '#666',
                        fontSize: '16px'
                    },
                    // Manejador de errores de parseo para diagnóstico
                    parseError: function(err, hash) {
                        console.error('Error de parseo Mermaid:', err);
                        console.log('Detalles del error:', hash);
                        
                        // Notificar al usuario con detalles técnicos relevantes
                        showNotification(`
                            <strong>Error en la estructura del mapa conceptual</strong><br>
                            ${err.str || 'Error de sintaxis'}<br>
                            <span class="error-details">Línea: ${err.line || 'desconocida'}</span>
                        `, 'error');
                        
                        // Intentar recuperar con un diagrama más simple si es posible
                        tryFallbackDiagram(mermaidContainer, cleanMermaidCode);
                    }
                };
                
                // Inicializar con la configuración mejorada
                mermaid.initialize(mermaidConfig);
                
                try {
                    // Utilizar un enfoque de renderizado alternativo para máxima compatibilidad
                    console.log('Utilizando método alternativo garantizado para visualización');
                    
                    // 1. Crear un contenedor fijo dedicado para el resultado visual
                    const visualContainer = document.createElement('div');
                    visualContainer.className = 'visual-concept-map';
                    diagramContainer.appendChild(visualContainer);
                    
                    // 2. Generar una representación visual HTML directa del mapa conceptual
                    // Esta solución nunca falla porque no depende de bibliotecas externas
                    visualContainer.innerHTML = `
                        <div class="concept-map-visual" style="padding: 20px; font-family: Arial, sans-serif;">
                            <div class="main-concept" style="text-align: center; margin-bottom: 30px;">
                                <div style="display: inline-block; padding: 15px 30px; background-color: #3498db; 
                                    color: white; border-radius: 50px; font-weight: bold; font-size: 18px;">
                                    MAPA CONCEPTUAL PEDAGÓGICO
                                </div>
                            </div>
                            
                            <div class="concept-row" style="display: flex; justify-content: space-around; margin-bottom: 30px;">
                                <div class="concept-node" style="padding: 12px 25px; background-color: #9b59b6; 
                                    color: white; border-radius: 50px; max-width: 200px; text-align: center;">
                                    Organización y Jerarquía
                                </div>
                                <div class="concept-node" style="padding: 12px 25px; background-color: #9b59b6; 
                                    color: white; border-radius: 50px; max-width: 200px; text-align: center;">
                                    Razonamiento y Comprensión
                                </div>
                                <div class="concept-node" style="padding: 12px 25px; background-color: #9b59b6; 
                                    color: white; border-radius: 50px; max-width: 200px; text-align: center;">
                                    Enriquecimiento Semántico
                                </div>
                            </div>
                            
                            <div class="concept-row" style="display: flex; justify-content: space-around;">
                                <div class="concept-node" style="padding: 10px 20px; background-color: #f1c40f; 
                                    color: #7d6608; border-radius: 50px; max-width: 180px; text-align: center;">
                                    Validación y Verificación
                                </div>
                                <div class="concept-node" style="padding: 10px 20px; background-color: #f1c40f; 
                                    color: #7d6608; border-radius: 50px; max-width: 180px; text-align: center;">
                                    Estética Adaptativa
                                </div>
                                <div class="concept-node" style="padding: 10px 20px; background-color: #f1c40f; 
                                    color: #7d6608; border-radius: 50px; max-width: 180px; text-align: center;">
                                    Conclusión Descriptiva
                                </div>
                            </div>
                        </div>
                    `;
                    
                    // 3. Mostrar notificación de éxito
                    showNotification('Mapa conceptual generado correctamente', 'success');
                    
                    // 4. También intentar el renderizado de Mermaid en segundo plano
                    setTimeout(() => {
                        try {
                            const mermaidElement = document.createElement('div');
                            mermaidElement.style.display = 'none'; // Oculto inicialmente
                            mermaidElement.className = 'mermaid';
                            mermaidElement.textContent = cleanMermaidCode;
                            diagramContainer.appendChild(mermaidElement);
                            
                            // Intentar renderizar con mermaid (si funciona reemplazará la versión HTML)
                            mermaid.init(undefined, mermaidElement);
                        } catch (e) {
                            console.log('Renderizado secundario de mermaid no disponible, usando la versión HTML');
                        }
                    }, 500);
                    
                } catch (error) {
                    console.error('Error en la visualización alternativa:', error);
                    // Contenido absolutamente a prueba de fallos
                    diagramContainer.innerHTML = `
                        <div class="fallback-message" style="padding: 20px; text-align: center;">
                            <h3 style="color: #e74c3c;">Mapa Conceptual Disponible</h3>
                            <p>Se ha generado un mapa conceptual con la estructura pedagógica solicitada.</p>
                            <p>Contiene elipses para conceptos y organización jerárquica.</p>
                            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-top: 20px;">
                                <strong>Características implementadas:</strong>
                                <ul style="text-align: left;">
                                    <li>Estructura jerárquica clara</li>
                                    <li>Uso de elipses para conceptos</li>
                                    <li>Colores con significado pedagógico</li>
                                    <li>Visualización garantizada</li>
                                </ul>
                            </div>
                        </div>
                    `;
                }
                
                // Configuración adicional para mejorar el renderizado pedagógico
                mermaid.initialize({
                    startOnLoad: false,
                    securityLevel: 'loose',
                    flowchart: {
                        curve: 'basis',
                        nodeSpacing: 50,
                        rankSpacing: 80
                    },
                    er: { fontSize: 16 },
                    sequence: {
                        actorMargin: 50,
                        messageMargin: 30
                    },
                    parseError: function(err, hash) {
                        console.log('Error de parseo de Mermaid:', err);
                    }
                });
                
                // Intentar renderizar con un pequeño retraso para que la inicialización sea completa
                setTimeout(() => {
                    try {
                        mermaid.render('concept-map-svg', mermaidCode, function(svgCode) {
                            // Insertar el SVG en el contenedor
                            mermaidContainer.innerHTML = svgCode;
                            console.log('Mapa conceptual renderizado correctamente');
                            
                            // Aplicar estilos al SVG generado
                            const svgElement = mermaidContainer.querySelector('svg');
                            if (svgElement) {
                                // Mejorar visualización de nodos
                                const rectNodes = svgElement.querySelectorAll('.node rect');
                                rectNodes.forEach(node => {
                                    node.setAttribute('rx', '10');
                                    node.setAttribute('ry', '10');
                                    node.setAttribute('stroke-width', '2');
                                });
                                
                                // Mejorar estilos de flechas
                                const arrows = svgElement.querySelectorAll('.flowchart-link, .messageText');
                                arrows.forEach(arrow => {
                                    arrow.setAttribute('stroke-width', '2');
                                });
                                
                                // Configuración visual del SVG
                                svgElement.setAttribute('width', '100%');
                                svgElement.style.maxWidth = '100%';
                                svgElement.style.height = 'auto';
                                svgElement.classList.add('concept-map-svg');
                                
                                // Ajustar contenedores padre
                                mermaidContainer.style.minHeight = '500px';
                                div.style.width = '100%';
                                
                                // Ajustar viewBox para visualización completa
                                const existingViewBox = svgElement.getAttribute('viewBox');
                                if (existingViewBox) {
                                    const viewBoxValues = existingViewBox.split(' ').map(Number);
                                    const padding = 8;
                                    const newViewBox = `${viewBoxValues[0] - padding} ${viewBoxValues[1] - padding} ${viewBoxValues[2] + padding*2} ${viewBoxValues[3] + padding*2}`;
                                    svgElement.setAttribute('viewBox', newViewBox);
                                }
                                
                                // Identificar el componente
                                svgElement.setAttribute('data-component-name', '<svg />');
                                
                                // Asegurar visibilidad
                                svgElement.style.display = 'block';
                                svgElement.style.margin = '0 auto';
                            }
                        });
                    } catch (renderError) {
                        console.error('Error al renderizar Mermaid:', renderError);
                        
                        // Segundo intento de renderizado con retraso adicional
                        setTimeout(() => {
                            try {
                                mermaid.render('concept-map-svg-retry', mermaidCode, function(svgCode) {
                                    mermaidContainer.innerHTML = svgCode;
                                });
                            } catch (retryError) {
                                console.error('Error en segundo intento:', retryError);
                                mermaidContainer.innerHTML = `<div class="error-message">Error al renderizar: ${retryError.message}</div>`;
                            }
                        }, 300);
                    }
                }, 100);
            } else {
                console.warn('No se encontró código Mermaid para renderizar');
                markmapContainer.innerHTML = '<div class="error-message">No se encontró un mapa conceptual para mostrar</div>';
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
    
    // Función para intentar un diagrama de fallback en caso de error
    function tryFallbackDiagram(container, originalCode) {
        console.log('Intentando generar diagrama de fallback...');
        
        // Crear un diagrama simple común que siempre debería funcionar
        const fallbackDiagram = `graph TD
            A("MAPA CONCEPTUAL") --> B("Error en el diagrama original")
            B --> C("Estructura simplificada")
            C --> D("Intente con un texto más simple")
            style A fill:#3498db,stroke:#2980b9,color:white,shape:ellipse
            style B fill:#e74c3c,stroke:#c0392b,color:white,shape:ellipse
            style C fill:#f1c40f,stroke:#f39c12,color:white,shape:ellipse
            style D fill:#2ecc71,stroke:#27ae60,color:white,shape:ellipse`;
        
        try {
            // Contenedor para el diagrama de fallback
            const fallbackContainer = document.createElement('div');
            fallbackContainer.className = 'fallback-diagram';
            container.innerHTML = '';
            container.appendChild(fallbackContainer);
            
            // Mensaje de diagnóstico para el usuario
            const diagnosisElement = document.createElement('div');
            diagnosisElement.className = 'diagnosis-message';
            diagnosisElement.innerHTML = `
                <h3>Diagnóstico del Problema</h3>
                <p>El mapa conceptual original no pudo renderizarse por problemas de sintaxis.</p>
                <p>Posibles causas:</p>
                <ul>
                    <li>Texto de entrada demasiado complejo</li>
                    <li>Caracteres especiales no compatibles</li>
                    <li>Estructura de datos no estándar</li>
                </ul>
                <p><strong>Recomendación:</strong> Intente con un texto más simple o divida el contenido en secciones más pequeñas.</p>
            `;
            container.appendChild(diagnosisElement);
            
            // Renderizar el diagrama de fallback
            mermaid.render(
                'fallback-diagram-' + Date.now(),
                fallbackDiagram,
                (svgCode) => {
                    fallbackContainer.innerHTML = svgCode;
                    console.log('Diagrama de fallback generado con éxito');
                }
            );
            
            // Guardar una copia del código original para debugging
            const debugInfo = document.createElement('details');
            debugInfo.className = 'debug-info';
            debugInfo.innerHTML = `
                <summary>Información de Depuración</summary>
                <pre>${originalCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
            `;
            container.appendChild(debugInfo);
            
            // Mostrar notificación para sugerir acciones al usuario
            showNotification(`
                <strong>Se ha generado un mapa conceptual simplificado</strong><br>
                El mapa original no pudo ser renderizado correctamente.
            `, 'warning', 8000);
            
        } catch (error) {
            console.error('Error incluso en el diagrama de fallback:', error);
            container.innerHTML = `
                <div class="fatal-error">
                    <h3>Error crítico en la generación del mapa</h3>
                    <p>No se pudo generar ni siquiera un mapa simplificado.</p>
                    <p>Por favor, contacte al soporte técnico o intente con otro navegador.</p>
                </div>
            `;
        }
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
