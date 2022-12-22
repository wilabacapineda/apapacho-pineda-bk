import express, { json, urlencoded} from 'express'
import routerProductos from './routers/routersProducts.js' 
import routerApi from './routers/api.js' 
import { create } from 'express-handlebars'
import { productos, lp, mensajes, lm } from './daos/load.js'
import { createServer } from "http"
import { Server } from "socket.io"
import { normalizar, denormalizar } from './utils/normalizar.js'
import { generarAvatar } from './utils/generadorUsuarios.js'
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
          const auxMensajes = denormalizar(mensajes)          
          const findAuthor = auxMensajes.mensajes.filter( d => d.author.email === data.author.email)
          if(findAuthor.length <= 0){
            data.author.avatar = generarAvatar()
          }           
          auxMensajes.mensajes.push(data)                    
          mensajes.entities = normalizar(auxMensajes).entities          
          const newID = lm.saveFull(mensajes)                  
                newID.then(() => {                                              
                  const htmlMensaje = (`<div>
                                            <span class="authorMessage">${data.author.email} </span>
                                            <span class="timeMessage">[${data.id}]: </span>
                                            <span class="textMessage">${data.mensaje}</span>
                                        </div>`)
                  io.sockets.emit('mensajes', htmlMensaje)                                                         
                }) 
        })
        console.log("Nuevo cliente conectado")
      })

const server = httpServer.listen(PORT, () => {
          console.log(`🚀 Server started on PORT ${PORT} at ${new Date().toLocaleString()}`)
        }        
      );
      server.on("error", error => console.log(`Error al iniciar servidor, ${error}`))