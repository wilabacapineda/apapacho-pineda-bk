import express, { json, urlencoded} from 'express'
import multer, { diskStorage } from 'multer'
import { productos, lp, mensajes, lm } from './../daos/load.js'
import fetch from "node-fetch";
import dotenv from 'dotenv'
import { denormalizar } from '../utils/normalizar.js';
import context from './../utils/context.js';
import session from 'express-session'
import cookieParser from 'cookie-parser';
import sessionFileStore from 'session-file-store'
dotenv.config()



let FileStore = sessionFileStore(session);


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
const getSessionName = req => req.session.nombre || null

const routerProductos = new Router()
    routerProductos.use(json())
    routerProductos.use(session({
        store: new FileStore({path:'./sessions', ttl:300, retries:0}),
        secret: process.env.SECRET,
        resave:false,
        saveUninitialized: false
    }))
    routerProductos.get('/', (req, res) => {                               
        context.path=req.route.path
        productos.sort((a,b) => b.id - a.id)        
        const mensajesDeN = denormalizar(mensajes)   
        const data = {
            ...context,
            productos:productos,
            mensajes:mensajesDeN,
            name:req.session.nombre ? req.session.nombre.toLocaleUpperCase() : ''
        }
        res.render('home',data)
    })
    routerProductos.get('/tienda', (req, res) => {  
        context.path=req.route.path
        const data = {
        ...context,
        productos:productos
        }
        res.render("tienda",data);
    })
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
    routerProductos.get('/productos_fake', (req, res) => {          
        context.path=req.route.path
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

export default routerProductos