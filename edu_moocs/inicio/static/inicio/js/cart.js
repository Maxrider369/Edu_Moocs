// Cart functionality - Unified and corrected version
document.addEventListener("DOMContentLoaded", () => {
  // Initialize cart functionality
  displayCartItems()
  updateCartSummary()
  loadModalCartSummary()
  initializeEventListeners()
  populateYearOptions()
  setupCardNumberFormatting()
})

function initializeEventListeners() {
  // Cart buttons
  const checkoutBtn = document.getElementById("checkout-btn")
  const preregisterBtn = document.getElementById("preregister-btn")

  // Modal elements
  const paymentModal = document.getElementById("payment-modal")
  const closeModalBtn = document.getElementById("close-modal")
  const cancelPaymentBtn = document.getElementById("cancel-payment")
  const billingToggle = document.getElementById("billing-toggle")
  const billingSection = document.getElementById("billing-section")
  const paymentForm = document.getElementById("payment-form")

  // Checkout button - Open modal
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function (e) {
      e.preventDefault()
      if (this.disabled) return

      console.log("Opening payment modal...") // Debug log
      loadModalCartSummary()
      paymentModal.classList.remove("hidden")
      document.body.style.overflow = "hidden" // Prevent background scrolling
    })
  }

  // Pre-register button
  if (preregisterBtn) {
    preregisterBtn.addEventListener("click", function (e) {
      e.preventDefault()
      if (this.disabled) return

      alert("Pre-inscripción exitosa! Te notificaremos cuando el curso esté disponible.")
      localStorage.setItem("cart", JSON.stringify([]))
      displayCartItems()
      updateCartSummary()
    })
  }

  // Close modal buttons
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeModal)
  }

  if (cancelPaymentBtn) {
    cancelPaymentBtn.addEventListener("click", closeModal)
  }

  // Close modal when clicking outside
  if (paymentModal) {
    paymentModal.addEventListener("click", (e) => {
      if (e.target === paymentModal) {
        closeModal()
      }
    })
  }

  // Billing toggle
  if (billingToggle && billingSection) {
    billingToggle.addEventListener("change", function () {
      if (this.checked) {
        billingSection.classList.remove("hidden")
      } else {
        billingSection.classList.add("hidden")
      }
    })
  }

  // Payment form submission
  if (paymentForm) {
    paymentForm.addEventListener("submit", (e) => {
      e.preventDefault()
      processPayment()
    })
  }
}

function closeModal() {
  const paymentModal = document.getElementById("payment-modal")
  if (paymentModal) {
    paymentModal.classList.add("hidden")
    document.body.style.overflow = "" // Restore scrolling
  }
}

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
  loadModalCartSummary()
}

function updateCartSummary() {
  const cart = JSON.parse(localStorage.getItem("cart")) || []
  const subtotal = cart.reduce((total, item) => total + item.price, 0)
  const discount = 0
  const total = subtotal - discount

  const subtotalElement = document.getElementById("subtotal")
  const discountElement = document.getElementById("discount")
  const totalElement = document.getElementById("total")
  const checkoutBtn = document.getElementById("checkout-btn")
  const preregisterBtn = document.getElementById("preregister-btn")

  if (subtotalElement) subtotalElement.textContent = `$${subtotal}`
  if (discountElement) discountElement.textContent = `-$${discount}`
  if (totalElement) totalElement.textContent = `$${total}`

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

function loadModalCartSummary() {
  const cart = JSON.parse(localStorage.getItem("cart")) || []
  const summaryContainer = document.getElementById("modal-cart-summary")
  const totalElement = document.getElementById("modal-total")
  const payBtnText = document.getElementById("payment-btn-text")

  if (!summaryContainer || !totalElement || !payBtnText) return

  if (cart.length === 0) {
    summaryContainer.innerHTML = '<p class="text-gray-500">Tu carrito está vacío.</p>'
    totalElement.textContent = "$0"
    payBtnText.textContent = "Pagar $0"
    return
  }

  let html = ""
  let total = 0
  cart.forEach((item) => {
    html += `
      <div class="flex justify-between text-sm">
        <span>${item.name}</span>
        <span>$${item.price}</span>
      </div>
    `
    total += item.price
  })

  summaryContainer.innerHTML = html
  totalElement.textContent = `$${total}`
  payBtnText.textContent = `Pagar $${total}`
}

function populateYearOptions() {
  const yearSelect = document.getElementById("expiry-year")
  if (!yearSelect) return

  const currentYear = new Date().getFullYear()
  for (let i = 0; i < 20; i++) {
    const year = currentYear + i
    const option = document.createElement("option")
    option.value = year
    option.textContent = year
    yearSelect.appendChild(option)
  }
}

function setupCardNumberFormatting() {
  const cardNumberInput = document.getElementById("card-number")
  if (!cardNumberInput) return

  cardNumberInput.addEventListener("input", (e) => {
    const value = e.target.value.replace(/\s/g, "").replace(/[^0-9]/gi, "")
    let formattedValue = value.match(/.{1,4}/g)?.join(" ") || value
    if (formattedValue.length > 19) formattedValue = formattedValue.substr(0, 19)
    e.target.value = formattedValue
  })
}

function processPayment() {
  // Simulate payment processing
  const processBtn = document.getElementById("process-payment")
  const originalText = processBtn.innerHTML

  processBtn.disabled = true
  processBtn.innerHTML =
    '<span class="flex items-center justify-center"><svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Procesando...</span>'

  setTimeout(() => {
    // Reset button
    processBtn.disabled = false
    processBtn.innerHTML = originalText

    // Close modal
    closeModal()

    // Show success notification
    showSuccessNotification()

    // Clear cart
    localStorage.setItem("cart", JSON.stringify([]))
    displayCartItems()
    updateCartSummary()
  }, 2000)
}

function showSuccessNotification() {
  const notification = document.getElementById("success-notification")
  const closeNotificationBtn = document.getElementById("close-notification")

  if (notification) {
    notification.classList.remove("translate-x-full")
    notification.classList.add("translate-x-0")

    // Auto hide after 5 seconds
    setTimeout(() => {
      hideSuccessNotification()
    }, 5000)
  }

  if (closeNotificationBtn) {
    closeNotificationBtn.addEventListener("click", hideSuccessNotification)
  }
}

function hideSuccessNotification() {
  const notification = document.getElementById("success-notification")
  if (notification) {
    notification.classList.remove("translate-x-0")
    notification.classList.add("translate-x-full")
  }
}

// Global functions for onclick handlers
window.removeCartItem = removeCartItem
