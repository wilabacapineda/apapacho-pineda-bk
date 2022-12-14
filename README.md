# apapacho-pineda-bk

## **Entrega 21-12-2022**

### **1. Información General de Entrega y actualizaciones**

- Se Utiliza API de la entrega anterior para construir web server (no Rest)
- Se añade hoja de estilos en '/public/assets/css/style.css'
- Se implementa socket.io y handlebars.
- Se cambia el uso de filesystem para los productos por manejo a través de Base de Datos Mysql o MariaDB y se modifica clase Contenedor creada en Entrega 3 por nueva clase ContenedorDB.        
    - Las imagenes para los productos se obtienen desde carpeta '/public/assets/img'
- Se crea array 'productos'(con soporte de persistencia en memoria) y la función 'loadProductos()' que obtiene desde la Base de Datos 'products' en Mysql, se añade al array 'productos' cuando se inicializa el servidor.
- Se crea array 'mensajes' (con soporte de persistencia de memoria) para guardar los mensajes enviados al servidor y se utiliza base datos en SQLite3 para guardar mensajes enviados. La función 'loadMensajes()' obtiene desde la Base de Datos 'mensajes' en SQLite3.
- Navegación:
    - Navegación, enlaces para acceder a los endpoints **'/productos'**, **'/tienda'**, **'/' (página de inicio)**
    - Página Principal con Formulario para añadir el producto.
        - la ruta "/productos" recibe los datos del formulario mediante POST y redirige al mismo formulario.
    - Página de Listado de Productos con ruta GET '/productos/
    - Página de Vista de Tienda de Productos con ruta GET '/tienda/
    - Página de Producto    
- Para inicializar las base de datos se implementa script 'create_db' para la creación de las tablas en SQLite3 y en Base de Datos 'apapacho' de Mysql

### **2. Handlebars**
- Se utiliza Handlebars en frontend para crear un Template para las páginas del sitio. Ademas se añaden 4 vistas diferentes
    - home: vista de página principal
    - producto: vista de página de productos
    - productos: vista de listado de productos
    - tienda: vista de Tienda con productos
- Usando Handlebars se crean 3 partials al crear el Template de la página.
    - footer: Contenido de Pie de Página del Sitio
    - logo y nav: Contenido del Header de la página

### **3. Uso de Socket.io**
- Para el manejo del socket en el frontend se utiliza el archivo '/public/assets/js/main.css'
- Ingreso de Productos
    - Se añade formulario para ingreso de productos, visible en vivo en página en Vista de Productos de página principal, usando socket.io.
- Vista de Productos
    - Vista de Listado de Productos vinculado a formulario "Ingreso de Productos" usando socket.io 
- Centro de Mensajes
    - Se agrega Centro de Mensajes en página principal utilizando socket.io
    - Usuario debe ingresar su correo electronico para poder enviar un mensaje. Cuando se envia mensaje el usuario ya no podrá cambiar su correo.
    - Los mensajes tienen la forma "nombrecorreo@dominio.com [dd/mm/YY HH:mm:ss]: mensaje", con los colores recomendados para la entrega.
    
### **4. Endpoints**
    4.1. **'/'**, Página de Inicio
    4.2. **'/productos'**, prodcutos con vista Listado Productos. 
        - Se obtienen los productos a través de la llamada al array productos
        - Se recorre el Array obtenido para mostrar los productos en la página, añadiendo un enlace a la página del producto correspondiente.
    4.3. **'/tienda'**, Productos con vista Página de Tienda. 
        - Se obtienen los productos a través de la llamada al array productos
        - Se recorre el Array obtenido para mostrar los productos en la página, añadiendo un enlace a la página del producto correspondiente.
    4.4. **/productos/:id**, Página de Producto
        - Se obtienen los productos a través de la llamada al array productos
        - Se muestra el producto correspondiente.

### **5. API**
[Para ver documentación de la API visitar](https://documenter.getpostman.com/view/24153895/2s8YRgqZj1)