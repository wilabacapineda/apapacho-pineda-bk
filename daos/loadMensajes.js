import options from './../options/SQLite3.js'
import ContenedorDB from './../contenedor/contenedorDB.js' 

const loadMensajes = () => {
    const lm = new ContenedorDB(options,'mensajes')
    const mensajes = []
    const data = lm.getAllOrder()  
    data.then( o => {        
        o.forEach( m => mensajes.push(m))
    })  
    return { mensajes, lm }
}

export default loadMensajes