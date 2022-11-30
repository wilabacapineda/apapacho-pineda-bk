import options from './options/mariaDB.js'
import ContenedorDB from './contenedorDB.js' 

const loadProducts = () => {
    const lp = new ContenedorDB(options,'products')
    const productos = []
    const data = lp.getAll()  
    data.then( o => {        
        o.forEach( p => productos.push(p))
    })  
    return { productos, lp }
}

export default loadProducts