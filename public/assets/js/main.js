const socket = io()

const form = document.getElementById('productsForm')
if(form){
    form.addEventListener('submit', (e) => {
        const output = document.querySelector("#enviando");
        const data = new FormData(form)   
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
    socket.on('mensajes',data => {
        document.querySelector("#tableProductos").innerHTML=data
        form.reset()
        document.getElementById('enviando').scrollIntoView({alignToTop: false});
    })
}

