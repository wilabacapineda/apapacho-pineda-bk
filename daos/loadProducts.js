import options from './../options/mariaDB.js'
import ContenedorDB from './../contenedor/contenedorDB.js' 
//import Contenedor from '../contenedor/contenedor.js'

const loadProducts = () => {
    const lp = new ContenedorDB(options,'products')
    //const lp = new Contenedor('./productos.json')
    const productos = []
    const data = lp.getAll()  
    data.then( o => {        
        o.forEach( p => productos.push(p))
    })  
    return { productos, lp }
}

export default loadProducts