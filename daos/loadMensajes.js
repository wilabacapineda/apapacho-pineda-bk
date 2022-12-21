import options from './../options/SQLite3.js'
import { denormalizar } from './../utils/normalizar.js'
//import ContenedorDB from './../contenedor/contenedorDB.js' 
import Contenedor from '../contenedor/contenedor.js'

const loadMensajes = () => {
    //const lm = new ContenedorDB(options,'mensajes')
    const lm = new Contenedor('./mensajes.json')    
    const mensajes = {}
    const data = lm.getAll()      
    data.then( o => {                  
        Object.assign(mensajes,o)
    })      
    return { mensajes, lm }
}



export default loadMensajes