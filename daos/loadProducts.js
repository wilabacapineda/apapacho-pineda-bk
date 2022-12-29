import ProductsDaoMemory from './ProductsDaoMemory.js'
//import ProductsDaoFiles from './products/ProductsDaoFiles.js'
import ProductsDaoMongoDb from './ProductsDaoMongoDb.js'

const loadProducts = () => {
    const lp = new ProductsDaoMongoDb
          lp.loadFirstinsertions()    
    const data = lp.getAll()
          data.then( d => ProductsDaoMemory.create(d)) 
    
    return {ProductsDaoMemory, lp}
}

export default loadProducts