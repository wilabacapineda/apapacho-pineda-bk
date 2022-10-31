const express = require('express')
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))

const { Router } = express
const fs = require('fs')

class Contenedor {
    constructor(file){
        this.file=file
    }

    async getAll() {
        try {
            const content = await fs.promises.readFile(this.file, 'utf-8')
            return JSON.parse(content)       
        }
        catch (error) {
            console.warn(`getAll error: ${error}`)
        }
    }

    async save(Object) {
        try {
            const content = this.getAll()            
            const newID = await content.then( resp => {
                Object.id = resp.length+1
                resp.push(Object)                   
                fs.promises.writeFile(this.file,JSON.stringify(resp,null,2))                
                return Object
            })
            return newID
        }
        catch (error) {
            console.warn(`readFile error, ${error}`)
        }
    }

    async update(id,Object) {
      try {
        const content = this.getAll()            
        const updateObject = await content.then( resp => {
            const returnObject = []
            const updateID = resp.map( r => {
              if(parseInt(r.id)===parseInt(id)){
                r = Object
                r.id=id
                returnObject.push(r)
                return r
              } else {
                return r
              }
            })
            fs.promises.writeFile(this.file,JSON.stringify(updateID,null,2))                          
            return returnObject
        })
        return updateObject
      }
      catch (error) {
          console.warn(`readFile error, ${error}`)
      }
    }

    async getById(id) {
        try {
            const content = this.getAll() 
            const data = await content.then( resp => {
                return resp.find( r => r.id===id && r)
            })    
            if(data) {
                return data
            } else {
                return null
            }
            
        }
        catch (error) {
            console.warn(`getById error, ${error}`)
        }        
    }

    async deleteById(id) {
        try {
            const content = this.getAll() 
            const data = await content.then( resp => {
                const newData = resp.filter( r => r.id!==id && r)
                fs.promises.writeFile(this.file,JSON.stringify(newData,null,2)) 
                return newData               
            })            
            return(data)
        }
        catch (error) {
            console.warn(`deleteById error, ${error}`)
        } 
    }

    async deleteAll() {
        try {
            await fs.promises.writeFile(this.file,JSON.stringify([],null,2))             
        }
        catch (error) {
            console.warn(`deleteAll error, ${error}`)
        } 
    }

    async getNumberOfElements() {
      const content = this.getAll()            
      const data = await content.then( resp => {
          return resp.length
      })    
      if(data) {
          return data
      } else {
          return 0
      } 
    }
}
const file = new Contenedor('./productos.txt')

const PORT = 8080
//const PORT = process.env.PORT

const app = express()
      app.use(express.json())
      app.use(express.urlencoded({ extended: true }))
      app.use(express.static('public'))

const routerProductos = new Router()
      routerProductos.use(express.json())

      routerProductos.get('/', (req, res) => {
        res.sendfile("/index.html");      
      })
      app.use('/', routerProductos)

      routerProductos.get('/productos', (req, res) => {  
        var requestOptions = {
          method: 'GET',
          redirect: 'follow'
        };        

        fetch("http://localhost:8080/api/productos/", requestOptions)
        .then(response => response.text())
        .then(result => {
          let salida = ""
          JSON.parse(result).forEach(p => {
            salida += `
              <a href="/productos/${p.id}">
                <div style="display: flex;align-content: center;align-items: center;gap:1rem;justify-content: center">                  
                    <img width="300" src="${p.thumbnail}"/>
                    <h2>- ${p.title}: $${p.price.toLocaleString()}</h2>                  
                </div>              
              </a>
            `
          })  
          res.send(`<h1>Productos</h1>${salida}<div><h4><a href="/">Volver al Inicio</a><h4></div>`)          
        })
        .catch(error => console.log('error', error))

      })
      app.use('/productos', routerProductos)

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
      
      routerProductos.get('/productos/:id', (req, res) => {
        const id = parseInt(req.params.id)
        if(isNaN(id) || id <= 0){
          return res.send(`<h1>ERROR 404</h1><img src="https://http.cat/404" />`)
        } 

        var requestOptions = {
          method: 'GET',
          redirect: 'follow'
        };
        
        fetch("http://localhost:8080/api/productos/"+id, requestOptions)
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
      app.use('/productos/:id', routerProductos)

    //API
      app.get('/api/', (req,res) => {
        return res.send({ mensaje: "Esto es un get para listar"})
      })
      routerProductos.get('/api/productos', (req,res) => {
        const data = file.getAll()        
        data.then( o => res.send(o))  
      })
      routerProductos.get('/api/productoRandom', (req, res) => {
        const numberOfProducts = file.getNumberOfElements()
        numberOfProducts.then( n => {
          if(n > 0) {
            const min = Math.ceil(1)
            const max = Math.floor(n)
            const id = Math.floor(Math.random() * (max - min + 1) + min)
            const data = file.getById(id)
                  data.then( o => res.send(o) )            
          } else {
            res.send({error: 'producto no encontrado'})
          }
        })        
      })
      routerProductos.get('/api/productos/:id', (req,res) => {
        const id = parseInt(req.params.id)
        if(isNaN(id) || id <= 0){
          return res.send({error: 'producto no encontrado'})
        } 

        const data = file.getById(id)
              data.then( o => {
                  if ( o === null) {
                    res.send({error: 'producto no encontrado'})
                  } else {
                    res.send(o)                          
                  }                  
              })         
      })

      app.post('/api', (req, res) => {
        res.send({mensaje: 'esto es un post para crear'})
      })
      routerProductos.post('/api/productos', (req, res) => {
        const newProd = file.save(req.body)
              newProd.then( np => {
                return res.send(np)
              })      
      })

      app.put('/api', (req, res) => {
        res.send({mensaje: 'esto es un put para actualizar'})
      })
      routerProductos.put('/api/productos/:id', (req, res) => {
        const id = parseInt(req.params.id)
        
        const newProd = file.update(id,req.body)
              newProd.then( np => {
                np.length === 0 ? res.send({error: 'producto no encontrado'}) : res.send(np)                
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
                  return res.send(np)
                })
              }) 
              
      })

const server = app.listen(PORT, () => {
          console.log(`🚀 Server started on PORT ${PORT} at ${new Date().toLocaleString()}`)
        }        
      );
      server.on("error", error => console.log(`Error al iniciar servidor, ${error}`))