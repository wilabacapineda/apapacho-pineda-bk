import express, { json, urlencoded} from 'express'
import session from 'express-session'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser';
import context from './../utils/context.js';
import sessionFileStore from 'session-file-store'

let FileStore = sessionFileStore(session);

dotenv.config()

let counter = 0

const { Router } = express
const routerSession = new Router()
      routerSession.use(json())
      routerSession.use(cookieParser())
      routerSession.use(session({
        store: new FileStore({path:'./sessions', ttl:300, retries:0}),
        secret: process.env.SECRET,
        resave:false,
        saveUninitialized: false
      }))

const getSessionName = req => req.session.nombre || 'Invitado'

      routerSession.get('/session/login', (req, res) => {    
        if(req.session.counter){
            req.session.counter++
            res.status(200).json({name: getSessionName(req), counter: req.session.counter})            
        } else {            
            req.session.counter = 1;
            res.status(200).json({name: getSessionName(req), counter: req.session.counter})            
        }
      })   
      routerSession.get('/session/invitado', (req,res) => {
        res.send({counter: ++counter})
      })
      routerSession.post('/session/login', (req, res) => {     
        req.session.nombre = req.body.username ? req.body.username : "Invitado"          
        if(req.session.counter){
            req.session.counter++
            res.status(200).json({name: getSessionName(req), counter: req.session.counter})            
        } else {            
            req.session.counter = 1;
            res.status(200).json({name: getSessionName(req), counter: req.session.counter})            
        }
        
      })     
      routerSession.post('/session/logout', (req,res) => {
        const aux = req.session.nombre
        req.session.destroy(err => {
            if(err){
                res.json({error: 'olvidar', body:err})
            } else {                
                res.json({name:aux})
            }
        })
      })
      routerSession.get('/login', (req, res) => {          
        context.path=req.route.path
        console.log(req.session.nombre)
        const data = {
            ...context,
            name: req.session.nombre
        }
        res.render("login",data);
      })
      routerSession.get('/session/info', (req,res)=>{
        console.log('=====')
        console.log('=====')
        console.log('req.session:',req.session)
        console.log('=====')
        console.log('req.sessionID:',req.sessionID)
        console.log('=====')
        console.log('req.cookies',req.cookies)
        console.log('=====')
        console.log('req.sessionStore:',req.sessionStore)
        console.log('=====')
        console.log('=====')
        res.send(`Todo OK!`)
      })
export default routerSession