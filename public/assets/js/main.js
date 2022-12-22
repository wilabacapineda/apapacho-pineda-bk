const socket = io()

const productsForm = document.getElementById('productsForm')
if(productsForm){
    productsForm.addEventListener('submit', (e) => {
        const output = document.querySelector("#enviando");
        const data = new FormData(productsForm)   
        fetch("/productos", {
            method: "POST",
            body: data
        }).then( res => {
            output.innerHTML = res.status === 200 ? "Producto cargado con exito!" : "Error al cargar el producto"
            output.style.display = "flex"
            output.classList.add(res.status === 200 ? "exito" : "fallo")
            socket.emit('producto',res.status) 
        }).catch((error) => {
            output.innerHTML = "Error al cargar el producto"
            output.style.display = "flex"
            output.classList.add("fallo")
            console.log('error: ', error)
        })
        e.preventDefault()               
    })
    socket.on('productos',data => {
        document.querySelector("#tableProductos").innerHTML=data
        productsForm.reset()
        document.getElementById('enviando').scrollIntoView({alignToTop: false});
    })
}

const mensaje = document.getElementById("mensaje")
const numChar = document.getElementById("numChar")
if(mensaje) {
    mensaje.addEventListener('keyup', () => {
        numChar.innerHTML = mensaje.value.length
    })
}

const mensajesForm = document.getElementById("mensajesForm")
if(mensajesForm){
    mensajesForm.addEventListener('submit', (e) => {
        const username = document.getElementById('username')
        const firstname = document.getElementById('firstname')
        const lastname = document.getElementById('lastname')
        const age = document.getElementById('age')
        const nickname = document.getElementById('nickname')       
        const mensajeEnviar = {
            author: {                
                email: username.value,
                firstname: firstname.value,
                lastname: lastname.value,
                age: parseInt(age.value),
                nickname: nickname.value
            },
            mensaje: mensaje.value.toString(),
            id: new Date().getTime(), 
        }                 
        socket.emit('new-mensaje',mensajeEnviar) 
        e.preventDefault()
    })
    socket.on('mensajes',data => {   
        const datos = JSON.parse(data)   
        const username = document.getElementById('username')
              username.style.display="none"
        const usernameText = document.getElementById("usernameText")
              usernameText.style.display="block"
              usernameText.innerHTML=username.value
        if(document.getElementById("noMessage")){
            document.getElementById("noMessage").style.display="none"
        }        
        let historial = document.querySelector("#mensajes")
            historial.innerHTML = datos.html + historial.innerHTML
        mensaje.value=""
        document.getElementById("compresion").innerHTML = `denormalizado: ${datos.denormalizado} \n normalizado: ${datos.normalizado} \n Tasa de Compresion: ${Math.round((datos.normalizado/datos.denormalizado)*100,2)}%`
    })
}

