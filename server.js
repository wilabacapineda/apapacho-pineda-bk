import express, { json, urlencoded} from 'express'
import multer, { diskStorage } from 'multer'
import { create } from 'express-handlebars'
import loadProducts from './loadProducts.js'
import loadMensajes from './loadMensajes.js'

import { createServer } from "http"
import { Server } from "socket.io"

const { Router } = express
const { productos, lp } = loadProducts()
const { mensajes, lm } = loadMensajes()
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

const httpServer = createServer(app)
const io = new Server(httpServer, {
          // ...
      })
      io.on("connection", (socket) => {
        socket.on('producto', data => {  
          if(data===200){
            lp.getAll().orderBy('id', 'desc').then( o => console.log(o))
            productos.sort((a,b) => b.id - a.id)
            const htmlProductos = productos.map((p) => {
              return (`<tr id="prod_${p.id}" class="text-center">                                    
                        <td>
                          <a href="/tienda/producto/${p.id}">
                            ${p.title}
                          </a>
                        </td>
                        <td>$${p.price}</td>
                        <td>
                          <img src="${p.thumbnail}" class="card-img-top" alt="Poleron Amaranta">
                        </td>                                    
                      </tr>`)            
            }).join(" ")

            io.sockets.emit('productos', htmlProductos)
          }                 
        })

        socket.on('new-mensaje', data => {
          const nowDate = new Date()
          const year = nowDate.getFullYear().toString()
          const day = nowDate.getDate().toString().padStart(2, '0')
          const month = (nowDate.getMonth() + 1).toString().padStart(2, '0')
          const ddmmYY = [day, month, year].join('/')

          const hour = nowDate.getHours().toString().padStart(2, '0')
          const minutes = nowDate.getMinutes().toString().padStart(2, '0')
          const seconds = nowDate.getSeconds().toString().padStart(2, '0')
          const hhmmss = [hour, minutes, seconds].join(':')
          data.time = ddmmYY+' '+hhmmss         
          console.log(data)
          const newID = lm.save(data)                  
                newID.then( (id) => {
                  mensajes.unshift(data)
                  const htmlMensaje = (`<div>
                                            <span class="authorMessage">${data.author} </span>
                                            <span class="timeMessage">[${data.time}]: </span>
                                            <span class="textMessage">${data.text}</span>
                                        </div>`)
                  io.sockets.emit('mensajes', htmlMensaje)                             
                }) 
        })
        console.log("Nuevo cliente conectado")
        
        // ...
      })

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
        productos.sort((a,b) => b.id - a.id)
        const data = {
          ...context,
          productos:productos,
          mensajes:mensajes
        }
        res.render('home',data)
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
        if(productos.length>0){          
          const min = Math.ceil(1)
          const max = Math.floor(productos.length)
          const id = Math.floor(Math.random() * (max - min + 1) + min)
          if(isNaN(id) || id <= 0){
            const data = {
              ...context,
              productos:null
            }
            res.render("producto",data)
          }
          context.path=req.route.path
          const producto = productos.find( p => p.id===id)
          const data = {
            ...context,
            productos:producto
          }
          res.render("producto",data)
        } else {
          const data = {
            ...context,
            productos:null
          }
          res.render("producto",data)          
        }
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
                const newID = lp.save(obj)                  
                      newID.then( id => {
                        const newProd = lp.getById(id)
                              newProd.then( np => {
                                productos.push(np[0])                                                        
                                return res.json({
                                  success: true,
                                  message: "Cargado con Exito"                          
                                });
                              })                        
                      })      
        } catch (err) {
          const error = new Error(err)
          error.httpStatusCode = 400          
          return next(error)
        }
      })  

const server = httpServer.listen(PORT, () => {
          console.log(`🚀 Server started on PORT ${PORT} at ${new Date().toLocaleString()}`)
        }        
      );
      server.on("error", error => console.log(`Error al iniciar servidor, ${error}`))