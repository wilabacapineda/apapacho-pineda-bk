import ContenedorMongoDb from "./../contenedor/ContenedorMongoDB.js"

const userSchema = {    
    email: {type: String, require: true,unique:true},
    name: {type:String, require:true, max: 250},
    lastname: {type: String, max: 250, require:true},
    password: {type: String, require:true},
    type: {type:Number, default: 4},
    age: {type: String, min: 0, max:200, default: 0},
    timestamp:  { type: Date, default: Date.now , require:true },
    dateUpdate: { type: Date, default: Date.now , require:true },
}

class UsersDaoMongoDb extends ContenedorMongoDb  {
    constructor() {                
        super('users', userSchema)
    }   
    
    async getByEmail(email){   
        try {
            const aux = this.db.findOne({ email : email })
            return await aux
        } catch (err) {
            console.warn(`MongoDb/UsersDaoMongoDb getByEmail error, ${err}`)
        }
    }
    
}

export default UsersDaoMongoDb