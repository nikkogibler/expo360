# Airtable - Base de Datos Empresarial

## Descripción General

Airtable es la base de datos externa donde se almacena información detallada de clientes, productos, cotizaciones y gestión de ventas de Kusam. Es un complemento al Dashboard para consultar datos más profundos y realizar análisis operativos.

## Acceso a Airtable

### Desde el Dashboard Principal
1. Busca la tarjeta "📋 Airtable"
2. Haz clic para acceder
3. Se abrirá el enlace directo a tu workspace de Airtable
4. Inicia sesión con tus credenciales de Airtable (si no has iniciado sesión)

### Acceso Directo (Alternativo)
También puedes acceder directamente:
- Desde el navegador: URL proporcionada por Interzekt
- App móvil de Airtable (iOS/Android)

## ¿Qué es Airtable?

### Definición Simple
Airtable es una base de datos visual que funciona como una hoja de cálculo avanzada. Almacena información organizada en tablas relacionadas, permitiendo consultar, filtrar y analizar datos de forma flexible.

### ¿Por Qué Usar Airtable?
- **Almacenamiento detallado:** Información completa que complementa el Dashboard
- **Consultas avanzadas:** Búsquedas y filtros complejos
- **Historial completo:** Registro de todas las interacciones y cambios
- **Análisis profundo:** Datos para tomar decisiones informadas
- **Sincronización:** Conectado con el Dashboard automáticamente

## ¿Qué Información Contiene Airtable?

### Datos Principales

#### 1. Información de Clientes
**Qué encontrarás:**
- Datos completos de todos los clientes registrados
- Historial de interacciones
- Contactos y seguimiento
- Preferencias y notas
- Historial de cotizaciones

**Casos de uso:**
- Revisar información detallada de un cliente específico
- Consultar historial de contactos
- Ver todas las cotizaciones de un cliente
- Analizar comportamiento de compra

#### 2. Productos y Catálogo
**Qué encontrarás:**
- Catálogo completo de productos Kusam
- Especificaciones técnicas detalladas
- Información de variables (telas, estructuras)
- Precios y configuraciones
- Imágenes y documentación

**Casos de uso:**
- Consultar detalles técnicos específicos
- Verificar variables disponibles por producto
- Revisar información de precios
- Acceder a especificaciones para cotizaciones

#### 3. Cotizaciones Generadas
**Qué encontrarás:**
- Todas las cotizaciones creadas desde el Dashboard
- Productos incluidos en cada cotización
- Fecha de generación
- Cliente asociado
- Estado (enviada, pendiente, cerrada)
- Total y desglose

**Casos de uso:**
- Revisar cotizaciones pasadas
- Analizar qué productos se cotizan más
- Seguimiento de conversión de cotizaciones a ventas
- Consultar detalles de cotizaciones específicas

#### 4. Gestión de Ventas (Operativo)
**Qué encontrarás:**
- Información de ventas cerradas
- Seguimiento de órdenes
- Estados de entrega
- Datos operativos y logísticos

**Casos de uso:**
- Consultar ventas realizadas
- Verificar estado de órdenes
- Análisis de desempeño de ventas
- Seguimiento operativo

## Cómo Usar Airtable

### Navegación Básica

#### Estructura de Airtable
Airtable está organizado en:
- **Workspace:** Espacio de trabajo de Kusam
- **Bases:** Diferentes bases de datos (Clientes, Productos, Ventas, etc.)
- **Tablas:** Cada base contiene múltiples tablas
- **Vistas:** Diferentes formas de visualizar la misma información

#### Interfaz Principal
- **Barra lateral izquierda:** Lista de bases y tablas
- **Vista central:** Tabla de datos (filas y columnas)
- **Barra superior:** Filtros, ordenamiento, búsqueda
- **Panel derecho:** Detalles del registro seleccionado

### Consultar Información

#### Buscar un Cliente
1. Accede a la base "Clientes"
2. Usa la barra de búsqueda superior
3. Escribe nombre, email o teléfono
4. Haz clic en el registro para ver detalles completos

#### Ver Cotizaciones de un Cliente
1. Abre el registro del cliente
2. Busca la sección "Cotizaciones" (campo relacionado)
3. Verás lista de todas las cotizaciones de ese cliente
4. Haz clic en cualquiera para ver detalles

#### Buscar un Producto
1. Accede a la base "Productos" o "Catálogo"
2. Usa búsqueda o filtros
3. Consulta especificaciones, variables y precios
4. Ve productos relacionados o similares

### Filtrar y Ordenar Datos

#### Aplicar Filtros
1. Haz clic en "Filter" en la barra superior
2. Selecciona el campo por el que quieres filtrar
3. Define la condición (ej: "Cliente contiene 'García'")
4. Se mostrarán solo los registros que cumplan la condición

#### Ordenar Información
1. Haz clic en "Sort" en la barra superior
2. Selecciona campo por el que ordenar
3. Elige orden ascendente o descendente
4. Datos se reorganizan automáticamente

### Vistas Predefinidas

**¿Qué son las vistas?**
Son formas preconfiguradas de ver la información, con filtros y ordenamiento específicos.

**Vistas comunes:**
- **Todos los registros:** Vista completa sin filtros
- **Activos:** Solo registros activos
- **Pendientes:** Elementos que requieren acción
- **Por fecha:** Ordenados cronológicamente
- **Por sucursal:** Filtrados por ubicación específica

**Cómo cambiar de vista:**
Haz clic en el menú desplegable de vistas (parte superior izquierda de la tabla)

## Integración con el Dashboard

### Sincronización Automática

**¿Qué se sincroniza?**
- **Clientes:** Agregados desde el Dashboard → aparecen en Airtable
- **Cotizaciones:** Generadas desde el Dashboard → se registran en Airtable
- **Productos:** Agregados al Catálogo → se actualizan en Airtable

**Tiempo de sincronización:**
- Generalmente inmediato (segundos)
- Algunas sincronizaciones pueden tomar hasta 1-2 minutos

### Flujo de Información

```
DASHBOARD → AIRTABLE
- Agregar Cliente → Se crea registro en Airtable
- Generar Cotización → Se guarda en Airtable
- Agregar Producto → Se actualiza catálogo en Airtable

AIRTABLE → DASHBOARD  
- Datos operativos y análisis permanecen en Airtable
- Dashboard consulta información cuando es necesario
```

## Casos de Uso Comunes

### Caso 1: Revisar Historial de Cliente

**Situación:**
Un cliente te contacta y quieres ver todo su historial de cotizaciones y compras.

**Pasos:**
1. Accede a Airtable desde el Dashboard
2. Ve a la base "Clientes"
3. Busca al cliente por nombre o email
4. Abre su registro completo
5. Revisa secciones de "Cotizaciones" e "Interacciones"
6. Consulta notas y seguimiento previo

### Caso 2: Analizar Productos Más Cotizados

**Situación:**
Quieres saber qué productos se están cotizando más este mes para ajustar inventario.

**Pasos:**
1. Accede a base "Cotizaciones"
2. Aplica filtro por fecha (mes actual)
3. Ordena por producto
4. Revisa qué productos aparecen más veces
5. Analiza patrones (colores, configuraciones más solicitadas)

### Caso 3: Verificar Detalles Técnicos de Producto

**Situación:**
Un cliente pregunta especificaciones técnicas exactas de un producto.

**Pasos:**
1. Accede a base "Productos"
2. Busca el producto específico
3. Consulta sección de "Especificaciones Técnicas"
4. Ve dimensiones, materiales, peso, etc.
5. Descarga ficha técnica si está disponible

### Caso 4: Consultar Cotizaciones Pendientes

**Situación:**
Quieres hacer seguimiento a cotizaciones enviadas que aún no se cierran.

**Pasos:**
1. Accede a base "Cotizaciones"
2. Selecciona vista "Pendientes" o aplica filtro por estado
3. Revisa lista de cotizaciones sin cerrar
4. Prioriza seguimiento según fecha y monto
5. Contacta clientes para dar seguimiento

## Mejores Prácticas

### ✅ Uso Efectivo de Airtable

**Consulta, no modifiques (a menos que estés autorizado):**
- Airtable es principalmente para consultar información
- Modificaciones importantes hazlas desde el Dashboard
- Si necesitas editar algo en Airtable, confirma que tienes permisos

**Usa vistas y filtros:**
- No te abrumes con toda la información
- Usa vistas predefinidas para encontrar lo que necesitas
- Crea filtros temporales para búsquedas específicas

**Aprovecha campos relacionados:**
- Haz clic en campos que enlazan a otros registros
- Explora relaciones entre clientes, productos y cotizaciones
- Navega entre tablas relacionadas para información completa

**Exporta datos cuando sea necesario:**
- Puedes exportar tablas a CSV o Excel
- Útil para análisis externos o respaldos
- Respeta confidencialidad de datos

### ❌ Evitar

**No hagas modificaciones sin autorización:**
- Cambios incorrectos pueden afectar datos operativos
- Consulta con tu administrador antes de editar

**No elimines registros:**
- Eliminaciones son permanentes
- Pueden romper relaciones entre datos
- Solo elimina si estás completamente seguro y autorizado

**No compartas acceso sin permiso:**
- Airtable contiene información sensible
- Solo usuarios autorizados deben tener acceso
- No compartas enlaces o credenciales

## Permisos y Seguridad

### Niveles de Acceso

**Solo lectura (Viewer):**
- Puede ver información
- No puede editar ni eliminar
- Ideal para consulta

**Editor:**
- Puede ver y editar registros
- Puede agregar nuevos registros
- No puede modificar estructura

**Administrador:**
- Control total
- Puede modificar estructura de bases
- Gestiona permisos de otros usuarios

**Tu nivel de acceso:**
Consulta con Soporte Interzekt para saber qué permisos tienes asignados.

### Seguridad de Datos

- Toda la información en Airtable está protegida
- Usa contraseñas seguras para tu cuenta
- Cierra sesión cuando uses computadoras compartidas
- Reporta cualquier acceso sospechoso a Soporte Interzekt

## Solución de Problemas

### "No puedo acceder a Airtable desde el Dashboard"
- Verifica que hayas iniciado sesión en Airtable en tu navegador
- Limpia caché y cookies
- Intenta acceder directamente con la URL
- Contacta a Soporte Interzekt si persiste

### "No veo información reciente que agregué en el Dashboard"
- Espera 1-2 minutos para sincronización
- Refresca la página de Airtable (F5 o Cmd+R)
- Verifica que estés en la vista correcta (sin filtros activos)
- Si no aparece después de 5 minutos, reporta a Soporte

### "No encuentro un registro específico"
- Verifica que no haya filtros activos ocultándolo
- Usa la búsqueda por diferentes campos (nombre, email, SKU)
- Cambia a vista "Todos los registros"
- Revisa que no esté en otra tabla relacionada

### "Necesito editar algo en Airtable"
- Primero verifica si puedes editarlo desde el Dashboard
- Confirma que tienes permisos de edición
- Si no estás seguro, contacta a Soporte Interzekt
- Documenta cambios importantes que realices

## Preguntas Frecuentes

**¿Toda la información del Dashboard está en Airtable?**
Sí, la mayoría de los datos se sincronizan automáticamente. Airtable contiene información más detallada y histórica.

**¿Puedo usar Airtable desde mi celular?**
Sí, descarga la app de Airtable (iOS/Android) e inicia sesión con tus credenciales.

**¿Los cambios que hago en Airtable se reflejan en el Dashboard?**
Depende del campo. Algunos datos se sincronizan bidireccionalmente, otros no. Mejor hacer cambios desde el Dashboard cuando sea posible.

**¿Puedo crear mis propias vistas en Airtable?**
Depende de tus permisos. Si eres editor o administrador, sí puedes crear vistas personalizadas.

**¿Se pierde información antigua en Airtable?**
No, Airtable mantiene historial completo. A menos que se elimine manualmente, toda la información se conserva.

**¿Necesito pagar por Airtable?**
No, el acceso a Airtable de Kusam ya está configurado. Solo necesitas tus credenciales de acceso.

## Soporte Adicional

Para dudas, problemas o solicitudes sobre Airtable:

1. **Asistente Kusam (Chatbot):** Pregunta directamente en el dashboard
2. **Documentación de Airtable:** Airtable tiene su propia documentación de ayuda
3. **Soporte Interzekt:** Para problemas de acceso, permisos o configuración

---

**Recuerda:** Airtable es una herramienta complementaria muy poderosa. Úsala para consultar información detallada, analizar datos históricos y obtener insights que te ayuden a tomar mejores decisiones de negocio.
