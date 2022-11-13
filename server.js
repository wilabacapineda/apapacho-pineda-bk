import express, { json, urlencoded} from 'express'
import multer, { diskStorage } from 'multer'
import { create } from 'express-handlebars'
import loadProducts from './loadProducts.js'

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))
const { Router } = express
const { productos, file } = loadProducts()
const context = {                    
  siteTitle:'APAPACHO',          
  siteSubTitle:'Diseño Infantil',
  description:`"Vestuario hecho a mano para apapachar a quienes amas"`,
  logo:'/assets/img/logo.jpg',
  logoTitle:'Logo Apapacho',
  navbarLinks:[
      {
          url:'/',
          title:'Inicio'
      },
      {
          url:'/productos',
          title:'Productos'
      },
      {
          url:'/tienda',
          title:'Tienda'
      }
  ], 
}

const PORT = 8080
//const PORT = process.env.PORT
const hbs = create({
  partialsDir: "views/partials/",    
  defaultLayout: 'main',
  helpers: {
    active(url,path){ 
      return path === url ? "active" : "" 
    },
    loadPage(v1,v2,opts){      
      return v1==v2 ? opts.fn(this) : opts.inverse(this) 
    }
  }  
})

const app = express()
      app.use(json())
      app.use(urlencoded({ extended: true }))
      app.use(express.static('public'))
      app.engine('handlebars',hbs.engine)
      app.set('view engine','handlebars')
      app.set("views", "./views")

const storageProductImage = diskStorage({
  destination: (req, file, cb) => {
    cb(null,'public/assets/img/')
  },
  filename: (req, file, cb) => {
    cb(null,file.originalname)
  }
})
const uploadProductImage = multer({storage:storageProductImage})

const routerProductos = new Router()
      routerProductos.use(json())

      routerProductos.get('/', (req, res) => {                       
        context.path=req.route.path
        res.render('home',context)
      })
      app.use('/', routerProductos)

      routerProductos.get('/tienda', (req, res) => {  
        context.path=req.route.path
        const data = {
          ...context,
          productos:productos
        }
        res.render("tienda",data);
      })
      app.use('/tienda', routerProductos)

      routerProductos.get('/productos', (req, res) => {  
        context.path=req.route.path
        if(productos.length>0){
          const data = {
            ...context,
            productos:productos
          }
          res.render("productos",data);
        } else {
          const data = {
            ...context            
          }
          res.render("productos",data);
        }
        
      })
      app.use('/tienda', routerProductos)

      routerProductos.get('/productoRandom', (req, res) => {
        var requestOptions = {
          method: 'GET',
          redirect: 'follow'
        };
        
        fetch("http://localhost:8080/api/productoRandom", requestOptions)
        .then(response => response.text())
        .then(result => {
          const o = JSON.parse(result)
          if ( o === null) {
            res.send(`<h1>ERROR 404</h1><img src="https://http.cat/404" />`)
          } else {
            let salida = `
              <div>                        
                <img width="300" src="${o.thumbnail}"/>
                <h2>- ${o.title}: $${o.price.toLocaleString()}</h2>
              </div>
            `;
            res.send(`<h1>Producto ID-${o.id}</h1>${salida}<div><h4><a href="/">Volver al Inicio</a><h4></div>`)                          
          }          
        })
        .catch(error => console.log('error', error))
      })
      app.use('/productoRandom', routerProductos)
      
      routerProductos.get('/tienda/producto/:id', (req, res) => {
        const id = parseInt(req.params.id)
        if(isNaN(id) || id <= 0){
          return res.send(`<h1>ERROR 404</h1><img src="https://http.cat/404" />`)
        } 
        context.path=req.route.path
        const producto = productos.find( p => p.id===id)
        const data = {
          ...context,
          productos:producto
        }
        res.render("producto",data)
      })
      app.use('/tienda/producto/:id', routerProductos)

      routerProductos.post('/productos', uploadProductImage.single('thumbnail'), (req, res,next) => {        
        try {
          const obj = JSON.parse(JSON.stringify(req.body))          
                obj.thumbnail = `/assets/img/${req.file.filename}`  
                const newProd = file.save(obj)                  
                      newProd.then( np => {
                        productos.push(np)
                        return res.redirect('/')
                      })      

        } catch (err) {
          const error = new Error(err)
          error.httpStatusCode = 400          
          return next(error)
        }
      })

    //API
      app.get('/api/', (req,res) => {
        return res.send({ mensaje: "Esto es un get para listar"})
      })
      routerProductos.get('/api/productos', (req,res) => {
        if(productos.length>0){
          res.send(productos)
        } else {
          const data = file.getAll()        
          data.then( o => {
            res.send(o)
          })
        }          
      })
      routerProductos.get('/api/productoRandom', (req, res) => {
        if(productos.length>0){          
          const min = Math.ceil(1)
          const max = Math.floor(productos.length)
          const id = Math.floor(Math.random() * (max - min + 1) + min)
          productos.forEach( o => {
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
      routerProductos.get('/api/productos/:id', (req,res) => {
        const id = parseInt(req.params.id)
        if(isNaN(id) || id <= 0){
          return res.send({error: 'producto no encontrado'})
        } 

        if(productos.length>0){
          productos.forEach( o => {
            if(parseInt(o.id) === id){
              return res.send(o)
            }
          })
        } else {
          const data = file.getById(id)
                data.then( o => {
                    if ( o === null) {
                      return res.send({error: 'producto no encontrado'})
                    } else {
                      return res.send(o)                          
                    }                  
                })
        }         
      })

      app.post('/api', (req, res) => {
        res.send({mensaje: 'esto es un post para crear'})
      })
      routerProductos.post('/api/productos', (req, res) => {
        const newProd = file.save(req.body)
              newProd.then( np => {
                productos.push(np)
                return res.send(np)
              })      
      })
      routerProductos.post('/api/productos/form', uploadProductImage.single('thumbnail'), (req, res, next) => {        
        const thumbnail = req.file
        if(!thumbnail){
          if(req.body.thumbnail){
            req.body.thumbnail = `/assets/img/${req.body.thumbnail}`            
            const newProd = file.save(req.body)                  
                  newProd.then( np => {
                    productos.push(np)
                    return res.send(np)
                  })             
          } else {
            const error = new Error('Por favor sube un archivo')
            error.httpStatusCode = 400          
            return next(error)
          }
        } else {
          req.body.thumbnail = `/assets/img/${thumbnail.filename}`
          const newProd = file.save(req.body)
                newProd.then( np => {
                  productos.push(np)
                  return res.redirect(`/productos/${np.id}`)
                }) 
        }        
      })

      app.put('/api', (req, res) => {
        res.send({mensaje: 'esto es un put para actualizar'})
      })
      routerProductos.put('/api/productos/:id', (req, res) => {
        const id = parseInt(req.params.id)
        
        const newProd = file.update(id,req.body)
              newProd.then( np => {  
                if(np.length>0){
                  productos.forEach(p => {
                    if(p.id === id) {
                      const indexOfItemInArray = productos.findIndex(p => p.id === id)
                      productos.splice(indexOfItemInArray, 1, np[0])
                    }
                  })
                }   
                np.length === 0 ? res.send({error: 'producto no encontrado'}) : res.send(np[0])                
              })      
      })

      app.delete('/api', (req, res) => {
        res.send({mensaje: 'esto es un delete para borrar'})
      })
      routerProductos.delete('/api/productos/:id', (req, res) => {
        const id = parseInt(req.params.id)     
        const newProd = file.getById(id)
              newProd.then( np => {
                if(np===null) {
                  return res.send({error: 'producto no encontrado'})
                }
                const deleteID = file.deleteById(id)
                deleteID.then( np => {
                  const indexOfItemInArray = productos.findIndex(p => p.id === id)
                  productos.splice(indexOfItemInArray, 1)
                  return res.send(np)
                })
              }) 
              
      })

const server = app.listen(PORT, () => {
          console.log(`🚀 Server started on PORT ${PORT} at ${new Date().toLocaleString()}`)
        }        
      );
      server.on("error", error => console.log(`Error al iniciar servidor, ${error}`))