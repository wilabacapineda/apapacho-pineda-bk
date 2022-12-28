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

const loginForm = document.getElementById('loginForm')
if(loginForm){
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault()
        const output = document.querySelector("#enviando");
        const username = document.getElementById("username")
        const data = { username: username.value }                     
        const action = loginForm.getAttribute('action')  
        const submit = document.querySelector('#loginForm button[type=submit]')
        const loginFormVR = document.getElementById('loginFormVR')
        const sectionSessionLoginTitle = document.querySelector('#sectionSessionLogin h2')
        if(action==="/session/login"){
            fetch("/session/login", {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data),
            }).then( res => {            
                output.innerHTML = res.status === 200 ? "Inicio de sesión exitoso!" : "Error al iniciar sesión"
                output.style.display = "flex"
                output.classList.add(res.status === 200 ? "exito" : "fallo")
                return res.json()
            }).then( res => {                
                output.innerHTML += ` Bienvenida/o ${res.name}`
                loginForm.setAttribute('action','/session/logout')
                username.readOnly = true      
                username.className="form-control logout"
                loginFormVR.innerHTML=""                
                submit.innerHTML="Cerrar Sesión"
                sectionSessionLoginTitle.innerHTML="Cerrar Sesión"
            }).catch((error) => {
                output.innerHTML = "Error al iniciar sesión"
                output.style.display = "flex"
                output.classList.add("fallo")
                console.log('error: ', error)
            })
        } else if (action==="/session/logout"){
            fetch("/session/logout", {
                method: "POST",                
            }).then( res => {            
                output.innerHTML = res.status === 200 ? "Cierre de sesión exitoso!" : "Error al cerrar sesión"
                output.style.display = "flex"
                output.classList.add(res.status === 200 ? "exito" : "fallo")
                loginForm.setAttribute('action','/session/login') 
                username.readOnly = false
                username.className="form-control"
                loginFormVR.innerHTML="*Valor requerido"
                submit.innerHTML="Inicar Sesión"
                sectionSessionLoginTitle.innerHTML="Inicar Sesión"
            }).catch((error) => {
                output.innerHTML = "Error al cerrar sesión"
                output.style.display = "flex"
                output.classList.add("fallo")
                console.log('error: ', error)
            })
        }              
    })

}
