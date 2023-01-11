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
        const password = document.getElementById("password") || ''
        const data = { username: username.value, password: password.value }                     
        const action = loginForm.getAttribute('action')          
        if(action==="/session/login"){
            fetch("/session/login", {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data),
            }).then( res => {  
                output.style.display = "flex"
                output.classList.add(res.status === 200 ? "exito" : "fallo")
                if(res.status === 200) {
                    output.innerHTML = `Inicio de sesión exitoso!` 
                    setTimeout(() => {
                        window.location = '/'
                    },2000)  
                } else if(res.status === 401) {
                    output.innerHTML =  "Nombre de Usuario o Contraseña incorrecta"
                } else {
                    output.innerHTML =  "Error al iniciar sesión"
                }                                                
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
                return res.json()
            }).then(res => {
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: `Hasta Luego! ${res.name}`,
                    text: 'Cerrando Sesión',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                }).then( r => {
                    location.reload()
                })
            }).catch((error) => {
                output.innerHTML = "Error al cerrar sesión"
                output.style.display = "flex"
                output.classList.add("fallo")
                console.log('error: ', error)
            })
        }              
    })

}

const registerForm = document.getElementById('registerForm')
if(registerForm){
    const verifyPassword = () => {  
        const pw = document.getElementById("password").value
        const pw2 = document.getElementById("password2").value
        const output = document.querySelector("#enviando")
        output.style.display = "none"
        output.classList.remove("fallo")
        
        if(pw != pw2) {   
          output.innerHTML = "**Las contraseñas no coinciden**"
          output.style.display = "flex"
          output.classList.add("fallo")
          return false
        } else {  
            //check empty password field  
            if(pw == "") {  
                output.innerHTML = "**Contraseña vacia**"
                output.style.display = "flex"
                output.classList.add("fallo")
                return false
            }  
            
            //minimum password length validation  
            if(pw.length < 8) {  
                output.innerHTML = "**Minimo de caracteres 8**"
                output.style.display = "flex"
                output.classList.add("fallo")
                return false
            }  
            
            //maximum length of password validation  
            if(pw.length > 16) {  
                output.innerHTML = "**Máximo de caracteres 16**"
                output.style.display = "flex"
                output.classList.add("fallo")
                return false
            } 
            return true      
        }      
    }

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault()
        if(verifyPassword()){
            const output = document.querySelector("#enviando")
            const formData = new FormData(registerForm)
            const data = {
                name: formData.get('name'),
                lastname: formData.get('lastname'),
                age: formData.get('age'),
                email: formData.get('email'),
                password: formData.get('password'),
            }
            const action = registerForm.getAttribute('action')
            if(action==="/session/register"){
                fetch("/session/register", {
                    method: "POST",                                
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(data),
                }).then( res => {         
                    if(res.status === 200) {
                        output.innerHTML = "Registro exitoso!"
                    } else if(res.status === 302) {
                        output.innerHTML = "Usuario ya Existe!"
                    } else {
                        output.innerHTML = "Error al registrar, intente nuevamente"
                    }
                    output.style.display = "flex"
                    output.classList.add(res.status === 200 ? "exito" : "fallo")
                    if(res.status === 200) {
                        setTimeout(() => {
                            location.href = '/login'
                        },2000)
                    }                    
                }).catch((error) => {
                    output.innerHTML = "Error al registrar, intente nuevamente"
                    output.style.display = "flex"
                    output.classList.add("fallo")
                    console.log('error: ', error)
                })
            } 
        }    
    })

} 