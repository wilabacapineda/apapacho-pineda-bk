import options from './options/mariaDB.js'
import options3 from './options/SQLite3.js'
import knexLib from 'knex'
import { text } from 'express'

const myknex = knexLib(options)

myknex.schema.dropTableIfExists('products').finally(() => {
    myknex.schema.createTable('products', table => {
        table.increments('id').primary()
        table.string('title')
        table.float('price')
        table.string('thumbnail')
    }).then( () => {
        console.log("table products created")
    }).catch( (err) => { 
        console.log(err)
        throw err
    }).finally( () => {
        myknex.schema.dropTableIfExists('variations').finally( () => {
            myknex.schema.createTable('variations', table => {
                table.integer('id_prod')
                table.string('color')
                table.string('talla')
            }).then( () => {
                console.log("table created")
            }).catch( (err) => { 
                console.log(err)
                throw err
            }).finally( () => {
                myknex('products')
                .insert([
                    {
                        title: "Poleron modelo No me olvides",
                        price: 20000,
                        thumbnail: "/assets/img/ModeloNomeolvides.jpg"
                    },
                    {
                        title: "Poleron modelo Amapola",
                        price: 20000,
                        thumbnail: "/assets/img/ModeloAmapola.jpg"
                    },
                    {
                        title: "Poleron modelo Jacinto",
                        price: 15000,
                        thumbnail: "/assets/img/ModeloJacinto.jpg"
                    },
                    {            
                        title: "Poleron modelo Violeta",
                        price: 22500,
                        thumbnail: "/assets/img/ModeloVioleta.jpg"
                    }
                ]).then( () => {
                    console.log("Data inserted")
                }).catch((err) => {
                    console.log(err)
                    throw err
                }).finally(() => {
                    myknex.destroy()
                })
            })
        })        
    })
})

const knex3 = knexLib(options3)
knex3.schema.hasTable('mensajes').then( (exists) => {
    if(!exists) {
        return knex3.schema.createTable('mensajes', table => {
            table.increments('id').primary()
            table.string('author')
            table.datetime('time')
            table.string('text')    
        }).then( () => {
            console.log("table mensajes created or loaded")
        }).catch( (err) => { 
            console.log(err)
            throw err
        }).finally(() => {
            const nowDate = new Date()
            const year = nowDate.getFullYear().toString()
            const day = nowDate.getDate().toString().padStart(2, '0')
            const month = (nowDate.getMonth() + 1).toString().padStart(2, '0')
            const ddmmYY = [day, month, year].join('/')

            const hour = nowDate.getHours().toString().padStart(2, '0')
            const minutes = nowDate.getMinutes().toString().padStart(2, '0')
            const seconds = nowDate.getSeconds().toString().padStart(2, '0')
            const hhmmss = [hour, minutes, seconds].join(':')
            const eltiempo = ddmmYY+' '+hhmmss

            knex3('mensajes')
            .insert([
                {
                    author: "Apapacho",
                    time: eltiempo,
                    text: "Bienvenidos al chat de Apapacho"
                }
            ]).then( () => {
                console.log("Data inserted")
            }).catch((err) => {
                console.log(err)
                throw err
            }).finally(() => {
                knex3.destroy()
            })            
        })
    }
})
