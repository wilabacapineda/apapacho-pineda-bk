import express, { json, urlencoded} from 'express'
import multer, { diskStorage } from 'multer'
import { ProductsDaoMemory, lp, mensajes, users } from './../daos/load.js'
import fetch from "node-fetch";
import dotenv from 'dotenv'
import { denormalizar } from '../utils/normalizar.js';
import context from './../utils/context.js';
import session from 'express-session'
import MongoStore from 'connect-mongo';
import { connectionStringUrlSessions } from './../options/connectionString.js';
dotenv.config()

const administrador = true 
const advanceOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

const { Router } = express

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
    routerProductos.use(session({
        store: new MongoStore({
          mongoUrl:connectionStringUrlSessions, 
          mongoOptions: advanceOptions,         
          ttl: 600,
          autoRemove: 'interval',
          autoRemoveInterval: 10 // In minutes. Default
        }),
        secret: process.env.SECRET,
        resave:true,
        rolling:true,
        saveUninitialized: false,
        cookie: {maxAge: 1000*60*10},
    }))
    routerProductos.get('/', (req, res) => {   
        context.path=req.route.path
        const mensajesDeN = denormalizar(mensajes)   
        const validador = req.session.passport ? ( req.session.passport.user ? req.session.passport.user : null ) : null 
        validador ? context.loginURL = { url:'/logout', title:'Logout'} : context.loginURL = { url:'/login', title:'Login' }

        if(validador){            
            const user = users.getBy_Id(req.session.passport.user)
                  user.then( r => {
                    delete r.password
                    const data = {
                        ...context,
                        productos:ProductsDaoMemory.object,
                        mensajes:mensajesDeN,
                        user: {
                            name: r.name,
                            lastname: r.lastname,
                            email: r.email,
                            age: r.age
                        }
                    }                    
                    res.render('home',data)
                  })
        } else {
            const data = {
                ...context,
                productos:ProductsDaoMemory.object,
                mensajes:mensajesDeN,
            }
            res.render('home',data)
        }
        
        
        
    })
    routerProductos.get('/tienda', (req, res) => {  
        context.path=req.route.path
        const validador = req.session.passport ? ( req.session.passport.user ? req.session.passport.user : null ) : null 
        validador ? context.loginURL = { url:'/logout', title:'Logout'} : context.loginURL = { url:'/login', title:'Login' }

        const data = {
        ...context,
        productos:ProductsDaoMemory.object
        }
        res.render("tienda",data);
    })
    routerProductos.get('/productos', (req, res) => {  
        context.path=req.route.path
        const validador = req.session.passport ? ( req.session.passport.user ? req.session.passport.user : null ) : null 
        validador ? context.loginURL = { url:'/logout', title:'Logout'} : context.loginURL = { url:'/login', title:'Login' }

        if(ProductsDaoMemory.object.length>0){
        const data = {
            ...context,
            productos:ProductsDaoMemory.object
        }
        res.render("productos",data);
        } else {
        const data = {
            ...context            
        }
        res.render("productos",data);
        }
        
    })
    routerProductos.get('/productos_fake', (req, res) => {          
        context.path=req.route.path
        const validador = req.session.passport ? ( req.session.passport.user ? req.session.passport.user : null ) : null 
        validador ? context.loginURL = { url:'/logout', title:'Logout'} : context.loginURL = { url:'/login', title:'Login' }

        fetch(`http://localhost:${process.env.PORT}/api/productos-test`).then( res => res.json()).then(productos => {
            if(productos.length>0){
                const data = {
                    ...context,
                    productos:productos
                }
                res.render("productos_fake",data);
            } else {
                const data = {
                    ...context            
                }
                res.render("productos_fake",data);
            }        
        
        })

    })
    routerProductos.get('/productoRandom', (req, res) => {
        if(ProductsDaoMemory.object.length>0){          
        const min = Math.ceil(1)
        const max = Math.floor(ProductsDaoMemory.object.length)
        const id = Math.floor(Math.random() * (max - min + 1) + min)
        if(isNaN(id) || id <= 0){
            const data = {
            ...context,
            productos:null
            }
            res.render("producto",data)
        }
        context.path=req.route.path
        const validador = req.session.passport ? ( req.session.passport.user ? req.session.passport.user : null ) : null 
        validador ? context.loginURL = { url:'/logout', title:'Logout'} : context.loginURL = { url:'/login', title:'Login' }

        const producto = ProductsDaoMemory.object.find( p => p.id===id)
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
    routerProductos.get('/tienda/producto/:id', (req, res) => {
        const id = parseInt(req.params.id)
        if(isNaN(id) || id <= 0){
        return res.send(`<h1>ERROR 404</h1><img src="https://http.cat/404" />`)
        } 
        context.path=req.route.path
        const validador = req.session.passport ? ( req.session.passport.user ? req.session.passport.user : null ) : null 
        validador ? context.loginURL = { url:'/logout', title:'Logout'} : context.loginURL = { url:'/login', title:'Login' }

        const producto = ProductsDaoMemory.getById(id)
              producto.then( r => {
                const data = {
                    ...context,
                    productos:r
                }
                res.render("producto",data)
              }).catch( r => {
                res.send({error: 'producto no encontrado'})
              })
        //const producto = ProductsDaoMemory.object.find( p => p.id===id)

    })
    routerProductos.post('/productos', uploadProductImage.single('thumbnail'), (req, res,next) => {        
        try {
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
                            return res.json({
                                success: true,
                                message: "Cargado con Exito"                          
                            });
                          })                         
                } else {
                  const error = new Error('Por favor sube un archivo')
                  error.httpStatusCode = 400          
                  return next(error)
                }
              } else {
                res.send({ error : -1, descripcion: "Ruta '/api/productos/form', metodo POST no autorizado"})
              } 
    
        } catch (err) {
            const error = new Error(err)
            error.httpStatusCode = 400          
            return next(error)
        }
    })  

export default routerProductos