import mongoose from 'mongoose'
import { connectionStringUrl } from './connectionString.js'

const connectionParams={
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS:5000,
}

//ATLAS
mongoose.connect(connectionStringUrl,connectionParams)
.then(() => {
    console.log('Base de Datos Conectada')
}) .catch((err) => {
    console.warn('Error al conectarse a la BD', err)
})