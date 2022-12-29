import fs from 'fs'

export default class ContenedorFile {
    constructor(file){
        this.file=file
    }

    async getAll() {
        try {
            const content = await fs.promises.readFile(this.file, 'utf-8')
            return JSON.parse(content)       
        }
        catch (error) {
            console.warn(`File getAll error: ${error}`)
        }
    }

    async save(Object) {
        try {
            const content = this.getAll()            
            const newID = await content.then( resp => {
                let lastElement = resp[resp.length - 1];
                if( lastElement !== undefined){
                    Object.id = parseInt(lastElement.id)+1
                } else {
                    Object.id = resp.length+1
                }            
                Object.timestamp=Date.now()
                Object.dateUpdate=Object.timestamp
                resp.push(Object)                   
                fs.promises.writeFile(this.file,JSON.stringify(resp,null,2))                
                return Object
            })
            return newID
        }
        catch (error) {
            console.warn(`File save error, ${error}`)
        }
    }

    async update(id,object) {
      try {
        const content = this.getAll()            
        const updateObject = await content.then( resp => {
            const returnObject = []
            const updateID = resp.map( r => {                
              if(parseInt(r.id)===parseInt(id)){   
                const propNames = Object.getOwnPropertyNames(object)             
                      propNames.forEach( pn => {
                        r[pn]=object[pn]
                      })
                r.dateUpdate=Date.now()
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
          console.warn(`File update error, ${error}`)
      }
    }

    async updateProducts(id,id_prod,object,cartCount){
        try {
            const content = this.getAll()            
            const updateObject = content.then( resp => {
                const returnObject = []
                const updateID = resp.map( c => {                
                    if(parseInt(c.id)===parseInt(id)){  
                        if(c.products.length>0){
                            const result = c.products.filter( cp => {
                                if(parseInt(cp.id) === parseInt(id_prod)) {
                                    cp.cartCount = cartCount
                                    return cp
                                }            
                            })  
                            if(result.length===0){      
                                c.products.push({
                                    ...object,
                                    cartCount : cartCount                
                                })
                            }
                        } else {
                            c.products.push({
                                ...object,
                                cartCount : cartCount                
                            })                          
                        }                        
                        returnObject.push(c)
                        return c
                    } else {
                        return c
                    }
                })                
                fs.promises.writeFile(this.file,JSON.stringify(updateID,null,2))                          
                return returnObject
            })
            return await updateObject
        }
        catch (error) {
            console.warn(`File updateProducts error, ${error}`)
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
            console.warn(`File getById error, ${error}`)
        }        
    }

    async deleteProducts(id,id_prod){
        try {                         
            const content = this.getAll()      
            const updateObject = content.then( resp => {                
                const returnObject = []
                resp.forEach( c => {                
                    if(parseInt(c.id)===parseInt(id)){  
                        if(c.products.length>0){
                            const result = c.products.filter( cp => {
                                if(parseInt(cp.id) !== parseInt(id_prod)) {                                    
                                    return cp
                                }            
                            })  
                            c.products = result
                            returnObject.push(c) 
                        } else {
                            returnObject.push(c)                           
                        }         
                    } else {
                        returnObject.push(c)
                    }
                })                
                fs.promises.writeFile(this.file,JSON.stringify(returnObject,null,2))                          
                return returnObject
            })
            return await updateObject
        }
        catch (error) {
            console.warn(`File deleteProducts error, ${error}`)
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
            console.warn(`File deleteById error, ${error}`)
        } 
    }

    async deleteAll() {
        try {
            await fs.promises.writeFile(this.file,JSON.stringify([],null,2))             
        }
        catch (error) {
            console.warn(`File deleteAll error, ${error}`)
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