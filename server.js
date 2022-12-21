import express, { json, urlencoded} from 'express'
import routerProductos from './routers/routersProducts.js' 
import routerApi from './routers/api.js' 
import { create } from 'express-handlebars'
import { productos, lp, mensajes, lm } from './daos/load.js'
import { createServer } from "http"
import { Server } from "socket.io"
import { normalizar, denormalizar } from './utils/normalizar.js'
import { generadorUsuarios } from './utils/generadorUsuarios.js'
import dotenv from 'dotenv'
dotenv.config()

const PORT = process.env.PORT

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
      app.use(routerProductos)
      app.use(routerApi)

const httpServer = createServer(app)
const io = new Server(httpServer, {})
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
          mensajes.mensajes.push(data)          
          
          console.log(mensajes.mensajes)          
          /*
          const newData = normalizar(mensajes)
          console.log(newData.entities.author)
          console.log(newData.entities.posts)  
          console.log(newData.entities.grupo)          
          
          const newID = lm.save(newData)                  
                newID.then(() => {                                              
                  const htmlMensaje = (`<div>
                                            <span class="authorMessage">${data.author} </span>
                                            <span class="timeMessage">[${data.time}]: </span>
                                            <span class="textMessage">${data.text}</span>
                                        </div>`)
                  io.sockets.emit('mensajes', htmlMensaje)                                                         
                }) 
          
          
          const auxData = lm.getById(data.author.id) 
                auxData.then( r => {
                  if ( r === null ){
                    data.author = {
                      ...data.author,
                      ...generadorUsuarios()
                    }                    
                    const newData = normalizar(data)                  
                    const newID = lm.save(newData)                  
                          newID.then( (id) => {                            
                            mensajes.unshift(data)
                            const htmlMensaje = (`<div>
                                                      <span class="authorMessage">${data.author} </span>
                                                      <span class="timeMessage">[${data.time}]: </span>
                                                      <span class="textMessage">${data.text}</span>
                                                  </div>`)
                            io.sockets.emit('mensajes', htmlMensaje)                                                         
                          }) 
                  } else {

                  }
                })          
          */
        })
        console.log("Nuevo cliente conectado")
      })

const server = httpServer.listen(PORT, () => {
          console.log(`🚀 Server started on PORT ${PORT} at ${new Date().toLocaleString()}`)
        }        
      );
      server.on("error", error => console.log(`Error al iniciar servidor, ${error}`))