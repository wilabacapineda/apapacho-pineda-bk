# apapacho-pineda-bk
# [Ver en Proyecto en Glitch](https://glitch.com/edit/#!/petal-electric-park)

## **Entrega 4**
- Se realiza proyecto servidor en node.js utilizando express en el puerto 8080. 
- Se incluye el archivo 'productos.txt' y se utiliza la clase Contenedor creada en la Entrega anterior.    

### **1. Endpoints**
    1.1. **'/'**, Página de Inicio
        - Se crean dos enlaces para acceder a los endpoints **'/productos'** y **'/productoRandom'**
    1.2. **'/productos'**, Página de Productos. 
        -   Utilizando el metodo getAll de la clase Contenedor se obtiene una Promesa con un array con todos los elementos en el archivo 'productos.txt'.
        - Se recorre el Array obtenido para mostrar los productos en la página, añadiendo un enlace a la página del producto correspondiente.
    1.3. **'/productoRandom'**, Página de producto al azar
        - utilizando el metodo getNumberOfElements se obtiene **"n"**, que es el número total de elementos en el archivo 'productos.txt'. Luego se obtiene un numero al azar entre 1 y **"n" (incluido)**.
        - A través del metodo getById de la clase Contenedor se obtiene una Promesa con el objeto del elemento correspondiente a la posición del número al azar obtenido en el punto anterior.
        - A través de la Promesa se muestra el producto correspondiente.
    1.4. **/productos/:id**, Página de Producto
        - A través del metodo getById de la clase Contenedor y el "id" obtenido de req.params se obtiene una Promesa con el objeto del elemento con id correspondiente.
        - A través de la Promesa se muestra el producto correspondiente.
### **2. API**
[Para ver documentación de la API visitar](https://documenter.getpostman.com/view/24153895/2s8YRgqZj1)
