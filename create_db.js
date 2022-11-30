import options from './options/mariaDB.js'
import knexLib from 'knex'

const myknex = knexLib(options)

myknex.schema.dropTableIfExists('products').finally(() => {
    myknex.schema.createTable('products', table => {
        table.increments('id').primary()
        table.string('title')
        table.float('price')
        table.string('thumbnail')
    }).then( () => {
        console.log("table created")
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
