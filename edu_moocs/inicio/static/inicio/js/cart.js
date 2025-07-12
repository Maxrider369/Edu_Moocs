// Cart page specific functionality
document.addEventListener("DOMContentLoaded", () => {
  displayCartItems()
  updateCartSummary()

  const checkoutBtn = document.getElementById("checkout-btn")
  const preregisterBtn = document.getElementById("preregister-btn")

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function () {
      if (this.disabled) return

      // Simulate checkout process
      alert("Redirigiendo al proceso de pago...")
      // Here you would integrate with a payment processor
    })
  }

  if (preregisterBtn) {
    preregisterBtn.addEventListener("click", function () {
      if (this.disabled) return

      // Simulate pre-registration
      alert("Pre-inscripción exitosa! Te notificaremos cuando el curso esté disponible.")
      // Clear cart after pre-registration
      localStorage.setItem("cart", JSON.stringify([]))
      displayCartItems()
      updateCartSummary()
    })
  }
})

function displayCartItems() {
  const cart = JSON.parse(localStorage.getItem("cart")) || []
  const cartItemsContainer = document.getElementById("cart-items")
  const emptyCartMessage = document.getElementById("empty-cart")

  if (!cartItemsContainer) return

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = ""
    if (emptyCartMessage) {
      emptyCartMessage.classList.remove("hidden")
    }
    return
  }

  if (emptyCartMessage) {
    emptyCartMessage.classList.add("hidden")
  }

  cartItemsContainer.innerHTML = cart
    .map(
      (item) => `
        <div class="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
            <div class="flex items-center space-x-4">
                <div class="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg"></div>
                <div>
                    <h3 class="text-lg font-semibold">${item.name}</h3>
                    <p class="text-gray-600">Curso completo con certificación</p>
                </div>
            </div>
            <div class="flex items-center space-x-4">
                <span class="text-2xl font-bold text-primary">$${item.price}</span>
                <button onclick="removeCartItem(${item.id})" class="text-red-500 hover:text-red-700 transition duration-300">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </div>
        </div>
    `,
    )
    .join("")
}

function removeCartItem(itemId) {
  removeFromCart(itemId)
  displayCartItems()
  updateCartSummary()
  updateCartUI()
}

function updateCartSummary() {
  const cart = JSON.parse(localStorage.getItem("cart")) || []
  const subtotal = cart.reduce((total, item) => total + item.price, 0)
  const discount = 0 // You can implement discount logic here
  const total = subtotal - discount

  const subtotalElement = document.getElementById("subtotal")
  const discountElement = document.getElementById("discount")
  const totalElement = document.getElementById("total")
  const checkoutBtn = document.getElementById("checkout-btn")
  const preregisterBtn = document.getElementById("preregister-btn")

  if (subtotalElement) subtotalElement.textContent = `$${subtotal}`
  if (discountElement) discountElement.textContent = `-$${discount}`
  if (totalElement) totalElement.textContent = `$${total}`

  // Enable/disable buttons based on cart content
  const hasItems = cart.length > 0
  if (checkoutBtn) {
    checkoutBtn.disabled = !hasItems
  }
  if (preregisterBtn) {
    preregisterBtn.disabled = !hasItems
  }
}

function removeFromCart(itemId) {
  let cart = JSON.parse(localStorage.getItem("cart")) || []
  cart = cart.filter((item) => item.id !== itemId)
  localStorage.setItem("cart", JSON.stringify(cart))
}

function updateCartUI() {
  // Additional UI updates can be handled here
}
