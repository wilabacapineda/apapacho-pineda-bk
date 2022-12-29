import express, { json, urlencoded} from 'express'
import multer, { diskStorage } from 'multer'
import { ProductsDaoMemory, lp } from './../daos/load.js'
import { generadorProductos } from './../utils/generadorProductos.js'

const { Router } = express
const administrador = true 

const storageProductImage = diskStorage({
  destination: (req, file, cb) => {
      cb(null,'public/assets/img/')
  },
  filename: (req, file, cb) => {
      cb(null,file.originalname)
  }
})
const uploadProductImage = multer({storage:storageProductImage})

const routerApi = new Router()
      routerApi.use(json())
      routerApi.get('/api/', (req,res) => {
        return res.send({ mensaje: "Esto es un get para listar"})
      })
      routerApi.get('/api/productos', (req,res) => {
        res.send(ProductsDaoMemory.object)        
      })
      routerApi.get('/api/productos-test', (req,res) => {
        const productosFake = []
        for(let i = 1 ; i<=5; i++){
          productosFake.push({
            id: i,
            ...generadorProductos(),
          })
        }
        res.send(productosFake)
      })      
      routerApi.get('/api/productoRandom', (req, res) => {
        if(ProductsDaoMemory.object.length>0){          
          const min = Math.ceil(1)
          const max = Math.floor(ProductsDaoMemory.object.length)
          const id = Math.floor(Math.random() * (max - min + 1) + min)
          ProductsDaoMemory.object.forEach( o => {
            if(parseInt(o.id) === parseInt(id)){
              return res.send(o)
            }
          })
        } else {
          const numberOfProducts = file.getNumberOfElements()
          numberOfProducts.then( n => {
            if(n > 0) {
              const min = Math.ceil(1)
              const max = Math.floor(n)
              const id = Math.floor(Math.random() * (max - min + 1) + min)
              const data = file.getById(id)
                    data.then( o => res.send(o) )            
            } else {
              return res.send({error: 'producto no encontrado'})
            }
          })      
        }  
      })
      routerApi.get('/api/productos/:id', (req,res) => {
        const id = parseInt(req.params.id)
        if(isNaN(id) || id <= 0){
          return res.send({error: 'producto no encontrado'})
        } 

        const result = ProductsDaoMemory.getById(id)
              result.then( r => {
                res.send(r)
              }).catch( r => {
                res.send({error: 'producto no encontrado'})
              }) 
      })
      routerApi.post('/api', (req, res) => {
        res.send({mensaje: 'esto es un post para crear'})
      })
      routerApi.post('/api/productos', (req, res) => {
        if(administrador){
          req.body.sales = 0
          req.body.variations=[] 
          req.body.price=parseInt(req.body.price)
          req.body.stock=parseInt(req.body.stock)         
          const newProd = lp.save(req.body)
                newProd.then( np => {
                  ProductsDaoMemory.save(np)
                  return res.send(np)
                })      
        } else {
          res.send({ error : -1, descripcion: "Ruta '/api/productos', metodo POST no autorizado"})
        }       
      })
      routerApi.post('/api/productos/form', uploadProductImage.single('thumbnail'), (req, res, next) => {        
        if(administrador){
          const thumbnail = req.file
          if(thumbnail){
              req.body.thumbnail = `/assets/img/${thumbnail.filename}`            
              req.body.sales = 0
              req.body.price=parseInt(req.body.price)
              req.body.stock=parseInt(req.body.stock)
              req.body.variations=[]
              const newProd = lp.save(req.body)                  
                    newProd.then( np => {                      
                      ProductsDaoMemory.save(np)
                      return res.send(np)
                    })                         
          } else {
            const error = new Error('Por favor sube un archivo')
            error.httpStatusCode = 400          
            return next(error)
          }
        } else {
          res.send({ error : -1, descripcion: "Ruta '/api/productos/form', metodo POST no autorizado"})
        }              
      })
      routerApi.put('/api', (req, res) => {
        res.send({mensaje: 'esto es un put para actualizar'})
      })
      routerApi.put('/api/productos/:id', (req, res) => {
        if(administrador){
          const id = parseInt(req.params.id)   
          const newProd = lp.update(id,req.body)
                newProd.then( np => {                
                  if(np.length>0){                                
                    ProductsDaoMemory.update(id,np)                    
                  }   
                  np.length === 0 ? res.send({error: 'producto no encontrado'}) : res.send(np)                
                })      
        } else {
          res.send({ error : -1, descripcion: "Ruta '/api/productos/:id', metodo PUT no autorizado"})
        }        
      })
      routerApi.put('/api/productos/form/:id', uploadProductImage.single('thumbnail'), (req, res,next) => {
        if(administrador){
          const thumbnail = req.file
          if(thumbnail){
            req.body.thumbnail = `/assets/img/${thumbnail.filename}`  
            const id = parseInt(req.params.id)    
            const newProd = lp.update(id,req.body)
                  newProd.then( np => {  
                    if(np.length>0){
                      ProductsDaoMemory.update(id,np)                    
                    }   
                    np.length === 0 ? res.send({error: 'producto no encontrado'}) : res.send(np)                
                  })      
          } else {
            const error = new Error('Por favor sube un archivo')
            error.httpStatusCode = 400          
            return next(error)
          }
        } else {
          res.send({ error : -1, descripcion: "Ruta '/api/productos/:id', metodo PUT no autorizado"})
        }        
      })
      routerApi.delete('/api', (req, res) => {
        res.send({mensaje: 'esto es un delete para borrar'})
      })
      routerApi.delete('/api/productos/:id', (req, res) => {
        if(administrador){
          const id = parseInt(req.params.id)     
          const newProd = din.productsDao.getById(id)
                newProd.then( np => {
                  if(np===null) {
                    return res.send({error: 'producto no encontrado'})
                  }                
                  const deleteID = lp.deleteById(id)
                        deleteID.then( np => {                          
                          ProductsDaoMemory.deleteById(id)
                          return res.send(np)
                        })
                }) 
        } else {
          res.send({ error : -1, descripcion: "Ruta '/api/productos/:id', metodo DELETE no autorizado"})
        }    
      })
         
export default routerApi