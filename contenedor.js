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
}
const file = new Contenedor('./productos.txt')

const verFuncionamiento = () => {
    //Creamos una copia del archivo donde trabajaremos para no perder nuestros productos
    fs.copyFileSync('./productos.json','./productos.txt')    
    //Function save()
    setTimeout(() => {
        console.log("\n1- Metodo Save:")
        const newId = file.save({
            title:"Poleron modelo Amaranta",
            price:25000,
            thumbnail:"./ModeloAmaranta.jpg"
        })
        newId.then( id => console.log(`Nuevo id: ${id}`))
    },2000)

    //Function getById
    setTimeout(() => {
        console.log("\n2- Metodo getById:")
        const objeto = file.getById(3)
        objeto.then( o => console.log(o))
    },4000)

    //Function getAll
    setTimeout(() => {
        console.log("\n3- Metodo getAll:")
        const data = file.getAll()
        data.then( o => console.log(o))
    },6000)

    //Function deleteById
    setTimeout(() => {
        console.log("\n4- Metodo deleteById:")
        const newObjeto = file.deleteById(5)
        newObjeto.then( o => console.log(o))
    },8000)

    //Function getById
    setTimeout(() => {
        console.log("\n5- Metodo deleteAll: []")
        file.deleteAll()
    },10000)
}
//verFuncionamiento()