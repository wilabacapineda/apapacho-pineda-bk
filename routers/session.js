import express, { json, urlencoded} from 'express'
import session from 'express-session'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser';
import context from './../utils/context.js';
import MongoStore from 'connect-mongo';
import bcrypt from 'bcrypt'
import passport from 'passport';
import { Strategy } from 'passport-local';
import { users } from './../daos/load.js';
import { connectionStringUrlSessions } from './../options/connectionString.js';
dotenv.config()

const verifyPassword = (user,password) => {
  return bcrypt.compareSync(password, user.password)
}
const checkAuth = (req,res,next) => {
  req.isAuthenticated() ?  next() : res.redirect('/login')
}
const localStrategy = new Strategy( (username, password, done) => {
    users.db.findOne({ email: username }, (err, user) => {
      if (err) { 
        return done(err); 
      }
      if (!user) { 
        return done(null, false); 
      }
      if (!verifyPassword(user,password)) { 
        return done(null, false); 
      }
      return done(null, user);
    })
})

passport.use('login', localStrategy)
passport.serializeUser((user, done) => {
  done(null, user._id);
})
passport.deserializeUser((id, done) => {
  users.db.findById(id, done);
})

let counter = 0
const advanceOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true
}
const saltRounds = 10;
const getSessionName = req => req.isAuthenticated() ? req.user.name : 'Invitado'

const { Router } = express
const routerSession = new Router()
      routerSession.use(json())
      routerSession.use(cookieParser())
      routerSession.use(session({
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
      routerSession.use(passport.initialize())
      routerSession.use(passport.session())
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
      routerSession.post('/session/login', passport.authenticate('login'), (req, res, next) => {  
        try {                   
          if(req.session.counter){
            req.session.counter++            
          } else {            
            req.session.counter = 1                
          } 
          res.sendStatus(200)
        } catch (err) {
          const error = new Error(err)
          error.httpStatusCode = 400          
          return next(error)
        }        
      })
      routerSession.post('/session/register', (req, res, next) => {     
        try {
          if(req.session.counter){
            req.session.counter++            
          } else {            
              req.session.counter = 1                
          }  

          const findEmail = users.getByEmail(req.body.email)
                findEmail.then( r => {
                  if(r === null) {
                    req.body.age = parseInt(req.body.age)
                    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
                      req.body.password = hash
                      const newUser = users.save(req.body)  
                          newUser.then( () => {                      
                            return res.json({
                                success: true,
                                message: "Registro exitoso!"                          
                            });
                          })
                    });
                  } else {
                    res.sendStatus(302)
                  }
                }).catch( r => {
                  res.send({error: 'error al registrar usuario'})
                })
          
        } catch (err) {
          const error = new Error(err)
          error.httpStatusCode = 400          
          return next(error)
        }
      })     
      routerSession.post('/session/logout', (req,res) => {
        const aux = req.isAuthenticated() ? req.user.name : false
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
        const validador = req.session.passport ? ( req.session.passport.user ? req.session.passport.user : null ) : null 
        validador ? context.loginURL = { url:'/logout', title:'Logout'} : context.loginURL = { url:'/login', title:'Login' }
        
        const data = {
            ...context,
            name: req.isAuthenticated() ? req.user.name : false
        }
        res.render("login",data);
      })
      routerSession.get('/logout', checkAuth, (req, res) => {                  
        context.path=req.route.path                
        const validador = req.session.passport ? ( req.session.passport.user ? req.session.passport.user : null ) : null 
        validador ? context.loginURL = { url:'/logout', title:'Logout'} : context.loginURL = { url:'/login', title:'Login' }

        const data = {
          ...context,
          name: req.isAuthenticated() ? req.user.name : false
        }
        res.render("logout",data);
        
        
      })
      routerSession.get('/register', (req, res) => {          
        context.path=req.route.path
        const data = {
            ...context,
            name: req.isAuthenticated() ? req.user.name : false
        }
        res.render("register",data);
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