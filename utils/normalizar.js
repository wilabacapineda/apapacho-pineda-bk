import { denormalize, normalize, schema } from 'normalizr';

const schemaAutor = new schema.Entity('author',{},{idAttribute:'email'})
const schemaMensaje = new schema.Entity('post',{
    author: schemaAutor
},{idAttribute: 'id'})
const schemaMensajes = new schema.Entity('posts', { 
    mensajes: [schemaMensaje]
})

export const normalizar = (data) => {
    return normalize(data, schemaMensajes)
} 

export const denormalizar = (data) => {
    return denormalize(data.result,schemaMensajes,data.entities)
}
