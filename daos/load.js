import loadProducts from './loadProducts.js'
import loadMensajes from './loadMensajes.js'

const { productos, lp } = loadProducts()
const { mensajes, lm } = loadMensajes()

export { productos, lp, mensajes,lm }