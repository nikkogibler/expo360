# RAG Docs - Base de Conocimiento del Asistente Kusam

## Descripción

Esta carpeta contiene toda la documentación que alimenta el sistema RAG (Retrieval-Augmented Generation) del **Asistente Kusam**, el chatbot FAQ disponible en el Dashboard de administración de Kusam.

## Propósito

El Asistente Kusam es un chatbot especializado que ayuda a los administradores del Dashboard Kusam a:
- Entender cómo usar cada funcionalidad del dashboard
- Resolver problemas comunes rápidamente
- Aprender mejores prácticas
- Encontrar información específica sin buscar en documentación extensa
- Navegar el sistema eficientemente

## Estructura de la Documentación

### 🤖 SYSTEM_INSTRUCTIONS.md
**Instrucciones del sistema** para configurar el comportamiento del chatbot:
- Personalidad y tono conversacional
- Protocolo de comunicación
- Límite de 300 caracteres por respuesta
- Solo español (sin excepciones)
- Uso de memoria de conversación
- Formato de respuestas

**⚠️ CRÍTICO:** Este archivo debe cargarse como **system prompt** en tu plataforma RAG/LLM.

---

### 📚 Documentos de Funcionalidades (En Español)

#### 01_vista_general_dashboard.md
**Vista General del Dashboard Kusam**
- Qué es el Dashboard y cómo acceder
- Navegación principal
- Descripción de cada sección/tarjeta:
  - Analítica y Reportes
  - Agregar Clientes + Cotización
  - Catálogo de Productos
  - Pro-Shot-Now (Optimizador, Librería, Prompts)
  - Airtable
  - Configuraciones
  - Soporte Interzekt
- Mejores prácticas generales
- Solución de problemas comunes

#### 02_agregar_clientes.md
**Agregar Clientes + Cotización Automática**
- Registrar clientes desde sucursal/expo
- Crear carritos de compra para clientes
- Generar cotizaciones en PDF
- Descargar, imprimir y compartir cotizaciones
- Flujos de trabajo típicos
- Integración con otras secciones
- Mejores prácticas

#### 03_pro_shot_now.md
**Pro-Shot-Now™ - Sistema Completo de Gestión de Imágenes**

**Parte 1: Optimizador**
- Generar y mejorar fotos de productos con IA
- Configurar opciones (fondos, iluminación, contextos)
- Personalizar colores reales de telas y estructuras
- Sistema de créditos

**Parte 2: Librería de Imágenes**
- Repositorio central de fotos
- Buscar, organizar y etiquetar
- Descargar individual o en lote
- Gestión de espacio

**Parte 3: Prompts**
- Experimentar con prompts personalizados
- Buscar prompts usados anteriormente
- Generar y guardar prompts favoritos
- Mejores prácticas

#### 04_catalogo_productos.md
**Catálogo de Productos**
- Explorar catálogo completo
- Agregar nuevos productos (actualmente disponible)
- Agregar nuevas variables: telas y estructuras (actualmente disponible)
- Funcionalidad de edición (próximamente)
- Mejores prácticas de catalogación
- Integración con Pro-Shot-Now™

#### 05_airtable.md
**Airtable - Base de Datos Empresarial**
- Qué es Airtable y por qué usarlo
- Acceso desde Dashboard o directo
- Información disponible (clientes, productos, cotizaciones, ventas)
- Navegación, búsqueda y filtros
- Vistas predefinidas
- Sincronización con Dashboard
- Casos de uso comunes

#### 06_analitica_reportes.md
**Analítica y Reportes**
- Métricas y KPIs disponibles
- Visualización de gráficos y tablas
- Selección de períodos de tiempo
- Interpretación de datos y tendencias
- Tipos de reportes (ventas, productos, clientes, operativo)
- Casos de uso comunes
- Toma de decisiones basada en datos

#### 07_soporte_interzekt.md
**Soporte Técnico Interzekt**
- Cuándo y cuándo NO contactar a Interzekt
- Canales de soporte (WhatsApp, email)
- Cómo reportar problemas efectivamente
- Tipos de solicitudes (errores, configuración, funcionalidades, créditos)
- Tiempos de respuesta esperados
- Mejores prácticas de comunicación

---

### 📑 Archivos de Referencia

#### INDEX.md
**Índice Rápido de la Documentación**
- Mapa completo de documentos
- Resumen de cada archivo
- Palabras clave por documento
- Guía de qué documento consultar según la pregunta
- Jerarquía de información

**Nota:** Opcional incluir en RAG. Principalmente para referencia humana.

#### README.md (este archivo)
**Guía de Uso de la Documentación**
- Explicación de la estructura
- Instrucciones de configuración del RAG
- Mejores prácticas de mantenimiento
- Información de versionamiento

**Nota:** NO incluir en RAG. Solo para referencia del equipo técnico.

---

## Cómo Usar Esta Documentación

### Para Configurar el Sistema RAG

#### Paso 1: Cargar System Prompt
```
Archivo: SYSTEM_INSTRUCTIONS.md
Destino: System prompt / System message del LLM
Función: Define comportamiento base del asistente
```

#### Paso 2: Generar Embeddings
```
Archivos: 01-07 (todos los .md numerados)
Proceso:
1. Leer cada archivo markdown
2. Dividir en chunks (segmentos) apropiados
3. Generar embeddings con modelo de embedding
4. Almacenar en vector database (ej: Pinecone)
```

#### Paso 3: Configurar Retrieval
```
Cuando llega pregunta del usuario:
1. Generar embedding de la pregunta
2. Buscar documentos similares en vector DB
3. Recuperar top 3-5 documentos más relevantes
4. Pasar al LLM junto con system prompt
5. LLM genera respuesta limitada a 300 caracteres
6. Devolver respuesta al usuario
```

### Arquitectura Recomendada del Sistema

```
Usuario → FloatingChatbot (Frontend)
            ↓
    Webhook (n8n/Zapier/Make)
            ↓
    Vector Database (Pinecone)
        - Busca documentos relevantes
            ↓
    LLM (OpenAI GPT-4 / Similar)
        - SYSTEM_INSTRUCTIONS.md como base
        - Documentos recuperados como contexto
        - Genera respuesta ≤ 300 caracteres
            ↓
    Respuesta → FloatingChatbot → Usuario
```

### Configuración Específica

**Chunking Strategy (División de Documentos):**
- Tamaño de chunk: 500-1000 tokens
- Overlap: 50-100 tokens
- Mantener contexto semántico (no cortar en medio de secciones)

**Embedding Model Recomendado:**
- OpenAI: `text-embedding-3-small` o `text-embedding-3-large`
- Alternativa: `text-embedding-ada-002`

**LLM Recomendado:**
- OpenAI GPT-4 (mejor calidad)
- GPT-4-turbo (balance calidad/velocidad)
- GPT-3.5-turbo (más económico)

**Vector Database:**
- Pinecone (recomendado, fácil setup)
- Alternativas: Weaviate, Qdrant, Chroma

---

## Características del Sistema

### Idioma
- **Español únicamente**
- Sin excepciones, todo en español
- Respuestas naturales y conversacionales

### Límite de Respuestas
- **Máximo 300 caracteres** por respuesta
- Respuestas concisas y directas
- Si necesita más información, sugiere consultar documentación específica

### Personalidad
- Amigable y profesional
- Conversacional, no robótico
- Usa "tú" en lugar de "usted"
- Evita jerga técnica innecesaria
- Prioriza claridad sobre exhaustividad

### Gestión de Memoria
- Usa memoria de conversación (dataTable)
- Verifica si ya conoce información antes de preguntar
- Mantiene contexto de sesión

---

## Mantenimiento de la Documentación

### Actualizar Documentación

**Cuándo actualizar:**
- Nueva funcionalidad agregada al dashboard
- Cambio en funcionalidad existente
- Corrección de información incorrecta
- Mejora de explicaciones poco claras

**Cómo actualizar:**
1. Edita el archivo markdown correspondiente
2. Mantén formato y estructura consistente
3. Actualiza INDEX.md si cambias nombres o estructura
4. Regenera embeddings del documento actualizado
5. Reemplaza en vector database

### Agregar Nueva Funcionalidad

**Proceso:**
1. Crea nuevo documento `0X_nombre_funcionalidad.md`
2. Sigue estructura de documentos existentes:
   - Descripción general
   - ¿Para qué usarlo?
   - Cómo usar (paso a paso)
   - Mejores prácticas
   - Solución de problemas
   - Preguntas frecuentes
3. Actualiza `01_vista_general_dashboard.md` con nueva sección
4. Actualiza `INDEX.md` con nuevo documento
5. Genera embeddings y agrega a vector DB
6. Prueba el chatbot con preguntas sobre nueva función

### Versionamiento

**Historial de Versiones:**
- v1.0 (Fecha inicial): Documentación completa inicial en inglés
- v2.0 (Fecha actual): Adaptación completa a español, reflejando funcionalidades reales únicamente

**Control de versiones:**
- Usa Git para control de versiones
- Commits descriptivos al actualizar documentación
- Tags para versiones mayores

---

## Reglas Importantes

### ✅ SÍ Hacer

- Mantener información actualizada y precisa
- Usar español natural y conversacional
- Incluir ejemplos prácticos en explicaciones
- Estructurar información de forma lógica
- Ser específico sobre funcionalidades REALES
- Indicar claramente funciones "próximamente"
- Actualizar embeddings después de cambios

### ❌ NO Hacer

- Incluir funcionalidades que no existen (aspiracionales)
- Usar jerga técnica innecesaria
- Crear documentación ambigua o vaga
- Dejar documentación desactualizada
- Mezclar español e inglés
- Agregar opiniones personales o recomendaciones no fundamentadas

---

## Testing del Sistema RAG

### Preguntas de Prueba Recomendadas

**Generales:**
- "¿Qué es el Dashboard Kusam?"
- "¿Cómo navego por el dashboard?"

**Por Funcionalidad:**
- "¿Cómo agrego un cliente?"
- "¿Cómo genero una cotización?"
- "¿Cómo uso el optimizador de fotos?"
- "¿Qué es Airtable?"
- "¿Cómo veo los reportes?"
- "¿Cómo contacto a soporte?"

**Casos Límite:**
- "¿Cómo edito un producto?" (debe indicar que está próximamente)
- Preguntas en inglés (debe responder que solo habla español)
- Preguntas fuera de scope (debe indicar limitación amablemente)

### Criterios de Éxito

**Respuesta correcta:**
- ✅ Información precisa según documentación
- ✅ Máximo 300 caracteres
- ✅ En español
- ✅ Tono conversacional y amigable
- ✅ Usa memoria si ya conoce datos del usuario

**Respuesta incorrecta:**
- ❌ Información inventada o incorrecta
- ❌ Más de 300 caracteres
- ❌ En inglés o mezclado
- ❌ Tono robótico o poco natural
- ❌ Pregunta información ya conocida

---

## Soporte y Contacto

**Para dudas sobre esta documentación:**
- Equipo técnico de Interzekt
- Email: soporte@interzekt.com

**Para reportar errores en documentación:**
- Describe el error claramente
- Indica en qué archivo está
- Sugiere corrección si es posible

**Para solicitar nueva documentación:**
- Describe la funcionalidad nueva
- Proporciona información necesaria
- Indica prioridad

---

## Notas Finales

Esta documentación es el corazón del Asistente Kusam. Mantenerla actualizada, precisa y bien estructurada garantiza que los administradores del Dashboard reciban ayuda efectiva y rápida.

**Principio fundamental:** La documentación debe reflejar EXACTAMENTE lo que el sistema puede hacer actualmente, sin exagerar o prometer funcionalidades futuras de forma ambigua.

**Última actualización:** Octubre 2025  
**Versión:** 2.0 - Español, funcionalidades reales  
**Responsable:** Equipo Interzekt
