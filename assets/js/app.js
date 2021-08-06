const cards = document.getElementById('cards')
const items = document.getElementById('items')
const footer = document.getElementById('footer')
const templateCard = document.getElementById('template-card').content
const templateFooter = document.getElementById('template-footer').content
const templateSelection= document.getElementById('template-selection').content
const fragment = document.createDocumentFragment()
let order = {}

document.addEventListener('DOMContentLoaded', e => { getData() });
cards.addEventListener('click', e => { addOrder(e) });
items.addEventListener('click', e => { btnAumentarDisminuir(e) })

// Leer json de platillos, revisar pasar el json de forma local
const getData = async () => {
    const doc = await fetch('https://pediatria.gob.mx/data.json');
    const data = await doc.json()
    console.log(data)
    fillCards(data)
}

// Presentar productos
const fillCards = data => {
    data.forEach(item => {
        templateCard.querySelector('h5').textContent = item.name
        templateCard.querySelector('p').textContent = item.price
        templateCard.querySelector('button').dataset.id = item.id
        const clone = templateCard.cloneNode(true)
        fragment.appendChild(clone)
    })
    cards.appendChild(fragment)
}

// Agregar a la orden
const addOrder = e => {
    if (e.target.classList.contains('btn-outline-success')) {
        setOrder(e.target.parentElement)
    }
    e.stopPropagation()
}


// crea un objeto para la orden e identifica si ya se agrego a la orden y le suma el mismo platillo
const setOrder = item => {
    const producto = {
        name: item.querySelector('h5').textContent,
        price: item.querySelector('p').textContent,
        id: item.querySelector('button').dataset.id,
        amount: 1
    }
    if (order.hasOwnProperty(producto.id)) {
        producto.amount = order[producto.id].amount + 1
    }
    // devuelve producto desagregado
    order[producto.id] = { ...producto }
    orderselected()
}

// orden seleccionada
const orderselected = () => {
    items.innerHTML = ''
    Object.values(order).forEach(producto => {
        templateSelection.querySelectorAll('td')[0].textContent = producto.name
        templateSelection.querySelectorAll('td')[1].textContent = producto.amount
        templateSelection.querySelector('span').textContent = producto.price * producto.amount
        templateSelection.querySelectorAll('button')[0].dataset.id = producto.id
        templateSelection.querySelectorAll('button')[1].dataset.id = producto.id
        const clone = templateSelection.cloneNode(true)
        fragment.appendChild(clone)
    })
    items.appendChild(fragment)
    putFooter()
}

const putFooter = () => {
    footer.innerHTML = ''
    if (Object.keys(order).length === 0) {
        footer.innerHTML = '<th scope="row" colspan="4"> Nada seleccionado </th>'
        return
    }
    const nAmount = Object.values(order).reduce((acc, { amount }) => acc + amount, 0)
    const nPrice = Object.values(order).reduce((acc, {amount, price}) => acc + amount * price ,0)
    templateFooter.querySelectorAll('td')[0].textContent = nAmount
    templateFooter.querySelector('span').textContent = nPrice
    const clone = templateFooter.cloneNode(true)
    fragment.appendChild(clone)
    footer.appendChild(fragment)
    // limpia la orden
    const boton = document.querySelector('#empty-order')
    boton.addEventListener('click', () => {
        order = {}
        orderselected()
    })
}

//  incrementa o disminuye la selección
const btnAumentarDisminuir = e => {
    if (e.path[0].id === "inc") {
        const producto = order[e.target.dataset.id]
        producto.amount++
        order[e.target.dataset.id] = { ...producto }
        orderselected()
    }
    if (e.path[0].id === "dec") {
        const producto = order[e.target.dataset.id]
        producto.amount--
        if (producto.amount === 0) {
            delete order[e.target.dataset.id]
        } else {
            order[e.target.dataset.id] = {...producto}
        }
        orderselected()
    }
    e.stopPropagation()
}