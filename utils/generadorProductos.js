import { faker } from '@faker-js/faker';
faker.locale = 'es'

const generadorProductos = () => {
    return {        
        title: faker.commerce.productName(),
        price: faker.commerce.price().toLocaleString(),
        thumbnail: faker.image.fashion(800,814,true)
    }
}

export { generadorProductos }