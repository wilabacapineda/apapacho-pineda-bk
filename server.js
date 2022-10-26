const express = require('express')

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
                return Object.id
            })
            return newID
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
const app = express()
      app.use(express.json());
      app.use(express.urlencoded({ extended: true }));
      
      app.get('/', (req, res) => {
        const data = file.getAll()
        data.then( o => {
          let salida = (`
            <h1>
              Bienvenidos, elija la opción que desea ver
            </h1>
            <h2><a href="/productos">1- Ir a la Tienda</a><h2>
            <h2><a href="/productoRandom">2- Ver Producto al Azar</a><h2>
          `)
          res.send(salida)          
        })        
      })

      app.get('/productos', (req, res) => {
        const data = file.getAll()
        data.then( o => {
          let salida = ""
          o.forEach(p => {
            salida += `
              <div>
                <h2>- ${p.title}: $${p.price.toLocaleString()}</h2>
              </div>              
            `
          })  
          res.send(`<h1>Productos</h1>${salida}<div><h4><a href="/">Volver al Inicio</a><h4></div>`)          
        })        
      })

      app.get('/productoRandom', (req, res) => {
        const numberOfProducts = file.getNumberOfElements()
        numberOfProducts.then( n => {
          if(n > 0) {
            const min = Math.ceil(1)
            const max = Math.floor(n)
            const id = Math.floor(Math.random() * (max - min + 1) + min)
            const data = file.getById(id)
                  data.then( o => {
                    let salida = `
                      <div>                        
                        <h2>- ${o.title}: $${o.price.toLocaleString()}</h2>
                        <h3>- Imagen URL: ${o.thumbnail}</h3>                        
                      </div>
                    `;
                    res.send(`<h1>Producto ID-${o.id}</h1>${salida}<div><h4><a href="/">Volver al Inicio</a><h4></div>`)          
                  })             
          } else {
            res.send(`<h1>No hay Productos</h1>`)          
          }
        })        
      })

const server = app.listen(PORT, () => {
          console.log(`🚀 Server started on PORT ${PORT} at ${new Date().toLocaleString()}`)
        }        
      );
      server.on("error", error => console.log(`Error al iniciar servidor, ${error}`))