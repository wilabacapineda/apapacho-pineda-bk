import loadProducts from './loadProducts.js'
import loadMensajes from './loadMensajes.js'
import loadUsers from './loadUsers.js'

const { ProductsDaoMemory, lp } = loadProducts()
const { mensajes, lm } = loadMensajes()
const users = loadUsers()

export { ProductsDaoMemory, lp, mensajes,lm, users }