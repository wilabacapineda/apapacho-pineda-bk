export default class ContenedorMemory {
    constructor(object) {
        this.object = object        
    } 

    create(object) {
        try {            
            this.object = object.map(pdm => pdm.toJSON())
        } catch(err){
            console.warn(`Memory Persistence create error, ${err}`)
        }        
    }
    
    save(object){
        try {
            this.object.push(object.toJSON())
        } catch(err){
            console.warn(`Memory Persistence save error, ${err}`)
        }  
        
    }

    update(id,Object){                
        try {
            const indexOfItemInArray = this.object.findIndex(p => p.id === id)
            this.object.splice(indexOfItemInArray, 1, Object[0])
        } catch(err){
            console.warn(`Memory Persistence update error, ${err}`)
        } 
    }

    async getById(id){                
        try {
            const result = this.object.filter( o => parseInt(o.id) === id )  
            return await result[0]
        } catch(err){
            console.warn(`Memory Persistence getById error, ${err}`)
        } 
    }

    deleteById(id){        
        try {
            const indexOfItemInArray = this.object.findIndex(p => p.id === id)
            this.object.splice(indexOfItemInArray, 1)
        } catch(err){
            console.warn(`Memory Persistence deleteById error, ${err}`)
        } 
    }

    deleteAll() {        
        try {
            this.object=[]         
        } catch(err){
            console.warn(`Memory Persistence deleteAll error, ${err}`)
        } 
    }
}