import options from './options/mariaDB.js'
import knex from 'knex'

export default class ContenedorDB {
    constructor(options,tableName){
        this.options=options
        this.tableName=tableName
    }

    async getAll() {
        try {
            const myknex = knex(this.options)
            return await myknex(this.tableName).catch((err) => {
                console.log(err)
                throw err
            }).finally(() => {
                myknex.destroy()
            })
        }
        catch (error) {
            console.warn(`getAll error: ${error}`)
        }
    }

    async save(Object) {
        try {
            const myknex = knex(this.options)
            return await myknex(this.tableName).insert(Object).catch((err) => {
                console.log(err)
                throw err
            }).finally(() => {
                myknex.destroy()
            })
        }
        catch (error) {
            console.warn(`readFile error, ${error}`)
        }
    }

    async update(id,Object) {
      try {
        const myknex = knex(this.options)
        return await myknex(this.tableName).where({id:id}).update(Object).catch((err) => {
            console.log(err)
            throw err
        }).finally(() => {
            myknex.destroy()
        })        
      }
      catch (error) {
          console.warn(`readFile error, ${error}`)
      }
    }

    async getById(id) {
        try {
            const myknex = knex(this.options)
            return await myknex(this.tableName).where({id:id}).catch ((err) => {
                console.log(err)
                throw err
            }).finally(() => {
                myknex.destroy()
            })            
        }
        catch (error) {
            console.warn(`getById error, ${error}`)
        }        
    }

    async deleteById(id) {
        try {
            const myknex = knex(this.options)
            return await myknex(this.tableName).where({id:id}).del().catch((err) => {
                console.log(err)
                throw err
            }).finally(() => {
                myknex.destroy()
            })
        }
        catch (error) {
            console.warn(`deleteById error, ${error}`)
        } 
    }

    async deleteAll() {
        try {
            const myknex = knex(this.options)
            return await myknex(this.tableName).del().catch((err) => {
                console.log(err)
                throw err
            }).finally(() => {
                myknex.destroy()
            })
        }
        catch (error) {
            console.warn(`deleteAll error, ${error}`)
        } 
    }

    async getNumberOfElements() {
        const myknex = knex(this.options)
        return await myknex(this.tableName).count("id as cnt").catch((err) => {
            console.log(err)
            throw err
        }).finally(() => {
            myknex.destroy()
        })
    }
    
}

//const prueba = new ContenedorDB(options,'products')
//prueba.getAll().then( o => console.log(o))