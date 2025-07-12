// Main JavaScript functionality
document.addEventListener("DOMContentLoaded", () => {
  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById("mobile-menu-btn")
  const mobileMenu = document.getElementById("mobile-menu")

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden")
    })
  }

  // Cart functionality
  initializeCart()

  // Add to cart buttons
  const addToCartButtons = document.querySelectorAll(".add-to-cart")
  addToCartButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const courseName = this.getAttribute("data-course")
      const coursePrice = Number.parseFloat(this.getAttribute("data-price"))

      addToCart(courseName, coursePrice)
      updateCartUI()

      // Show feedback
      this.textContent = "Agregado!"
      this.classList.add("bg-green-600")
      setTimeout(() => {
        this.textContent = "Agregar al Carrito"
        this.classList.remove("bg-green-600")
      }, 2000)
    })
  })

  // Update cart count on page load
  updateCartUI()
})

// Cart management
function initializeCart() {
  if (!localStorage.getItem("cart")) {
    localStorage.setItem("cart", JSON.stringify([]))
  }
}

function addToCart(courseName, coursePrice) {
  const cart = JSON.parse(localStorage.getItem("cart"))

  // Check if course already exists
  const existingCourse = cart.find((item) => item.name === courseName)
  if (existingCourse) {
    return // Don't add duplicates
  }

  cart.push({
    name: courseName,
    price: coursePrice,
    id: Date.now(),
  })

  localStorage.setItem("cart", JSON.stringify(cart))
}

function removeFromCart(courseId) {
  let cart = JSON.parse(localStorage.getItem("cart"))
  cart = cart.filter((item) => item.id !== courseId)
  localStorage.setItem("cart", JSON.stringify(cart))
}

function updateCartUI() {
  const cart = JSON.parse(localStorage.getItem("cart"))
  const cartCount = document.getElementById("cart-count")

  if (cartCount) {
    if (cart.length > 0) {
      cartCount.textContent = cart.length
      cartCount.classList.remove("hidden")
    } else {
      cartCount.classList.add("hidden")
    }
  }
}

function getCartTotal() {
  const cart = JSON.parse(localStorage.getItem("cart"))
  return cart.reduce((total, item) => total + item.price, 0)
}

// Form validation
function validateForm(formId) {
  const form = document.getElementById(formId)
  if (!form) return false

  const inputs = form.querySelectorAll("input[required]")
  let isValid = true

  inputs.forEach((input) => {
    if (!input.value.trim()) {
      input.classList.add("border-red-500")
      isValid = false
    } else {
      input.classList.remove("border-red-500")
    }
  })

  return isValid
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute("href"))
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
      })
    }
  })
})
