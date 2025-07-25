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

class ProgressNotifications {
  constructor() {
    this.createNotificationContainer()
  }

  createNotificationContainer() {
    if (!document.getElementById("notificationContainer")) {
      const container = document.createElement("div")
      container.id = "notificationContainer"
      container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                pointer-events: none;
            `
      document.body.appendChild(container)
    }
  }

  show(message, type = "success", duration = 3000) {
    const notification = document.createElement("div")
    notification.className = `notification notification-${type}`
    notification.style.cssText = `
            background: ${type === "success" ? "#10b981" : "#ef4444"};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
            margin-bottom: 0.5rem;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            pointer-events: auto;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            max-width: 300px;
        `

    const icon = type === "success" ? "✓" : "⚠"
    notification.innerHTML = `
            <span style="font-size: 1.2em;">${icon}</span>
            <span>${message}</span>
        `

    const container = document.getElementById("notificationContainer")
    container.appendChild(notification)

    // Mostrar notificación
    setTimeout(() => {
      notification.style.transform = "translateX(0)"
    }, 100)

    // Ocultar notificación
    setTimeout(() => {
      notification.style.transform = "translateX(100%)"
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 300)
    }, duration)
  }
}

// Instancia global
window.progressNotifications = new ProgressNotifications()

// Integrar con el sistema de progreso
document.addEventListener("DOMContentLoaded", () => {
  // Escuchar eventos de progreso
  document.addEventListener("lessonCompleted", (e) => {
    window.progressNotifications.show("¡Lección completada! 🎉")
  })

  document.addEventListener("courseCompleted", (e) => {
    window.progressNotifications.show("¡Felicidades! Has completado el curso 🏆", "success", 5000)
  })

  document.addEventListener("lessonUnlocked", (e) => {
    window.progressNotifications.show("Nueva lección desbloqueada 🔓")
  })
})

class CourseProgressManager {
  constructor() {
    this.currentUser = this.getCurrentUser()
    this.currentCourse = this.getCurrentCourse()
    this.storageKey = `course_progress_${this.currentUser}_${this.currentCourse}`
    this.init()
  }

  getCurrentUser() {
    // Obtener el usuario actual del DOM o contexto
    const userElement = document.querySelector("[data-user]")
    return userElement ? userElement.dataset.user : "anonymous"
  }

  getCurrentCourse() {
    // Obtener el ID del curso actual
    const courseElement = document.querySelector("[data-course-id]")
    return courseElement ? courseElement.dataset.courseId : null
  }

  init() {
    this.loadProgress()
    this.setupEventListeners()
    this.updateUI()
  }

  loadProgress() {
    const saved = localStorage.getItem(this.storageKey)
    this.progress = saved
      ? JSON.parse(saved)
      : {
          completedVideos: [],
          currentVideo: null,
          totalVideos: this.getTotalVideos(),
          completionPercentage: 0,
        }
  }

  saveProgress() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.progress))
  }

  getTotalVideos() {
    return document.querySelectorAll("[data-video-id]").length
  }

  markVideoAsCompleted(videoId) {
    if (!this.progress.completedVideos.includes(videoId)) {
      this.progress.completedVideos.push(videoId)
      this.calculateProgress()
      this.saveProgress()
      this.updateUI()
    }
  }

  setCurrentVideo(videoId) {
    this.progress.currentVideo = videoId
    this.saveProgress()
    this.updateUI()
  }

  calculateProgress() {
    const completed = this.progress.completedVideos.length
    const total = this.progress.totalVideos
    this.progress.completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0
  }

  isVideoUnlocked(videoId) {
    const videoElement = document.querySelector(`[data-video-id="${videoId}"]`)
    const videoIndex = Number.parseInt(videoElement?.dataset.videoIndex || 0)

    // El primer video siempre está desbloqueado
    if (videoIndex === 0) return true

    // Un video está desbloqueado si el anterior está completado
    const previousVideoId = this.getPreviousVideoId(videoId)
    return previousVideoId ? this.progress.completedVideos.includes(previousVideoId) : false
  }

  getPreviousVideoId(currentVideoId) {
    const videoElements = document.querySelectorAll("[data-video-id]")
    const videoArray = Array.from(videoElements)
    const currentIndex = videoArray.findIndex((el) => el.dataset.videoId === currentVideoId)

    if (currentIndex > 0) {
      return videoArray[currentIndex - 1].dataset.videoId
    }
    return null
  }

  getNextVideoId(currentVideoId) {
    const videoElements = document.querySelectorAll("[data-video-id]")
    const videoArray = Array.from(videoElements)
    const currentIndex = videoArray.findIndex((el) => el.dataset.videoId === currentVideoId)

    if (currentIndex < videoArray.length - 1) {
      return videoArray[currentIndex + 1].dataset.videoId
    }
    return null
  }

  updateUI() {
    this.updateProgressBar()
    this.updateVideoStates()
    this.updateNavigationButtons()
  }

  updateProgressBar() {
    const progressBar = document.querySelector(".progress-bar-fill")
    const progressText = document.querySelector(".progress-percentage")
    const progressDetails = document.querySelector(".progress-details")

    if (progressBar) {
      progressBar.style.width = `${this.progress.completionPercentage}%`
    }

    if (progressText) {
      progressText.textContent = `${this.progress.completionPercentage}%`
    }

    if (progressDetails) {
      progressDetails.textContent = `${this.progress.completedVideos.length} de ${this.progress.totalVideos} lecciones completadas`
    }
  }

  updateVideoStates() {
    const videoElements = document.querySelectorAll("[data-video-id]")

    videoElements.forEach((element) => {
      const videoId = element.dataset.videoId
      const isCompleted = this.progress.completedVideos.includes(videoId)
      const isUnlocked = this.isVideoUnlocked(videoId)
      const isCurrent = this.progress.currentVideo === videoId

      // Remover todas las clases de estado
      element.classList.remove("video-completed", "video-current", "video-locked")

      // Aplicar el estado correspondiente
      if (isCompleted) {
        element.classList.add("video-completed")
      } else if (isCurrent && isUnlocked) {
        element.classList.add("video-current")
      } else if (!isUnlocked) {
        element.classList.add("video-locked")
      }

      // Actualizar el ícono
      this.updateVideoIcon(element, isCompleted, isUnlocked, isCurrent)

      // Habilitar/deshabilitar el enlace
      const link = element.querySelector("a")
      if (link) {
        if (isUnlocked) {
          link.classList.remove("pointer-events-none", "opacity-50")
        } else {
          link.classList.add("pointer-events-none", "opacity-50")
        }
      }
    })
  }

  updateVideoIcon(element, isCompleted, isUnlocked, isCurrent) {
    const iconContainer = element.querySelector(".video-icon")
    if (!iconContainer) return

    let iconHTML = ""

    if (isCompleted) {
      iconHTML = `
                <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
            `
    } else if (isCurrent && isUnlocked) {
      iconHTML = `
                <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
            `
    } else if (isUnlocked) {
      iconHTML = `
                <div class="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                </div>
            `
    } else {
      iconHTML = `
                <div class="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                </div>
            `
    }

    iconContainer.innerHTML = iconHTML
  }

  updateNavigationButtons() {
    const nextButton = document.querySelector(".next-lesson-btn")
    const prevButton = document.querySelector(".prev-lesson-btn")

    if (nextButton) {
      const currentVideoId = this.progress.currentVideo
      const nextVideoId = this.getNextVideoId(currentVideoId)

      if (nextVideoId && this.isVideoUnlocked(nextVideoId)) {
        nextButton.classList.remove("opacity-50", "cursor-not-allowed")
        nextButton.disabled = false
      } else {
        nextButton.classList.add("opacity-50", "cursor-not-allowed")
        nextButton.disabled = true
      }
    }
  }

  setupEventListeners() {
    // Listener para cuando se selecciona un video
    document.addEventListener("click", (e) => {
      const videoLink = e.target.closest("[data-video-id] a")
      if (videoLink) {
        const videoElement = videoLink.closest("[data-video-id]")
        const videoId = videoElement.dataset.videoId

        if (this.isVideoUnlocked(videoId)) {
          this.setCurrentVideo(videoId)
        }
      }
    })

    // Listener para el botón "Marcar como completado"
    const completeButton = document.querySelector(".complete-lesson-btn")
    if (completeButton) {
      completeButton.addEventListener("click", () => {
        if (this.progress.currentVideo) {
          this.markVideoAsCompleted(this.progress.currentVideo)

          // Desbloquear el siguiente video
          const nextVideoId = this.getNextVideoId(this.progress.currentVideo)
          if (nextVideoId) {
            this.setCurrentVideo(nextVideoId)
          }
        }
      })
    }

    // Listener para botones de navegación
    const nextButton = document.querySelector(".next-lesson-btn")
    const prevButton = document.querySelector(".prev-lesson-btn")

    if (nextButton) {
      nextButton.addEventListener("click", (e) => {
        e.preventDefault()
        const nextVideoId = this.getNextVideoId(this.progress.currentVideo)
        if (nextVideoId && this.isVideoUnlocked(nextVideoId)) {
          this.setCurrentVideo(nextVideoId)
          // Aquí podrías redirigir a la URL del siguiente video
          window.location.href = nextButton.href
        }
      })
    }
  }

  // Método para obtener el progreso de un curso específico (para mis-cursos)
  static getCourseProgress(userId, courseId) {
    const storageKey = `course_progress_${userId}_${courseId}`
    const saved = localStorage.getItem(storageKey)
    return saved
      ? JSON.parse(saved)
      : {
          completedVideos: [],
          currentVideo: null,
          totalVideos: 0,
          completionPercentage: 0,
        }
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector("[data-course-id]")) {
    window.courseProgress = new CourseProgressManager()
  }
})

function enviarPreregistro(event) {
    event.preventDefault();

    const telefono = document.getElementById('telefono').value;
    const estado = document.getElementById('estado').value;
    const ciudad = document.getElementById('ciudad').value;

    const btn = document.getElementById('submitPreregisterBtn');

    // Estado de carga
    btn.innerHTML = `
        <div class="flex items-center gap-2">
            <svg class="h-5 w-5 text-white animate-spin-slow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span class="text-white font-medium">Enviando...</span>
        </div>
    `;
    btn.disabled = true;
    btn.classList.remove('hover:bg-green-700');
    btn.classList.add('opacity-80', 'cursor-not-allowed');

    // Simular envío
    setTimeout(() => {
        // Mostrar alerta emergente
        const alerta = document.getElementById('alertaEmergente');
        alerta.style.display = 'block';

        // Cerrar modal
        closePreregisterModal();

        // Ocultar alerta después de 3 segundos
        setTimeout(() => {
            alerta.style.display = 'none';
        }, 3000);

        // Restaurar botón
        btn.disabled = false;
        btn.classList.remove('opacity-80', 'cursor-not-allowed');
        btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Pre-registrarme
        `;
        btn.classList.add('bg-green-600', 'hover:bg-green-700');
    }, 2000);
}
