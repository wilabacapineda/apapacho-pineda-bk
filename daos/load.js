import loadProducts from './loadProducts.js'
import loadMensajes from './loadMensajes.js'

const { ProductsDaoMemory, lp } = loadProducts()
const { mensajes, lm } = loadMensajes()

export { ProductsDaoMemory, lp, mensajes,lm }