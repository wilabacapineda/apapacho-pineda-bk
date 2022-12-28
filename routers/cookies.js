import express, { json, urlencoded} from 'express'
import cookieParser from 'cookie-parser'

const { Router } = express
const routerCookies = new Router()
      routerCookies.use(json())
      routerCookies.use(cookieParser('apapachitos'))
      routerCookies.get('/cookies', (req, res) => {
        res.json({normales: req.cookies, firmadas:req.signedCookies})
      })
      routerCookies.post('/cookies', (req,res) => {
        const {nombre,value,time} = req.body
        if(!nombre || !value) {
            req.status(400).json({error: 'Faltan datos'})
        }
        if(time){
            res.cookie(nombre,value,{ signed: true, maxAge: time})
        } else {
            res.cookie(nombre,value, {signed: true})
        }
        res.json({process: 'OK! process'})
      })
      routerCookies.delete('/cookies/:nombre', (req,res) => {
        const { nombre } = req.params
        if(nombre){
            res.clearCookie(nombre)
            res.json({process: 'OK! process'})
        } else {
            req.status(400).json({error: 'Faltan datos'})
        }
      })
export default routerCookies