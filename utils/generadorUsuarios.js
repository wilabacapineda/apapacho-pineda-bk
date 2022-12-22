import { faker } from '@faker-js/faker';
faker.locale = 'es'

export const generadorUsuarios = () => {
    return {        
        firstName: faker.name.firstName(),
        lastname: faker.name.lastName(),
        age: faker.datatype.number({ min: 18, max: 85, precision: 1 }), // 36.94
        username: faker.internet.userName(),
        avatar: faker.image.avatar()
    }
}

export const generarAvatar = () => {
    return faker.image.avatar()
}