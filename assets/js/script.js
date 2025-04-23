// Toast notification system
const showToast = (() => {
  let toastContainer = null;
  const toastQueue = [];
  const maxToasts = 3;
  const toastDuration = 5000;

  const createContainer = () => {
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.id = "toast-container";
      toastContainer.className = "position-fixed bottom-0 start-0 p-3 z-3";
      document.body.appendChild(toastContainer);
    }
    return toastContainer;
  };

  const removeToast = (toast) => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast?.remove();
      if (toastQueue.length > 0) {
        showNextToast();
      }
    }, 150);
  };

  const showNextToast = () => {
    if (toastQueue.length === 0) return;

    const container = createContainer();
    const { message, type } = toastQueue.shift();

    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-bg-${type} border-0 fade mb-2`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>`;

    container.appendChild(toast);
    toast.offsetHeight; // Force reflow
    toast.classList.add('show');

    setTimeout(() => removeToast(toast), toastDuration);
  };

  return (message, type = "success") => {
    toastQueue.push({ message, type });
    if (document.querySelectorAll('#toast-container .toast').length < maxToasts) {
      showNextToast();
    }
  };
})();

// Initialize navbar functionality
const initNavbar = () => {
  const navbarCollapse = document.querySelector('.navbar-collapse');
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  const navbar = document.querySelector('.navbar');

  if (!navbarCollapse || !navbar) return;

  document.addEventListener('click', (e) => {
    if (!navbarCollapse.contains(e.target) && 
        !e.target.closest('.navbar-toggler') &&
        navbarCollapse.classList.contains('show')) {
      navbarCollapse.classList.remove('show');
    }
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navbarCollapse.classList.remove('show');
    });
  });

  let lastScrollTop = 0;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        navbar.classList.toggle('scrolled', scrollTop > 50);

        if (scrollTop > lastScrollTop) {
          navbar.style.transform = `translateY(-${Math.min(scrollTop - lastScrollTop, navbar.offsetHeight)}px)`;
        } else {
          navbar.style.transform = 'translateY(0)';
        }

        lastScrollTop = scrollTop;
        ticking = false;
      });
      ticking = true;
    }
  });
};

// Initialize form handling
const initForms = () => {
  const contactForm = document.querySelector("form[action*='formspree']");
  if (!contactForm) return;

  contactForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const formData = new FormData(contactForm);

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        showToast("<i class='bi bi-check-circle me-2'></i>Thank you for your message! We'll get back to you soon.", "success");
        contactForm.reset();
      } else {
        throw new Error('Server responded with an error');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      showToast("<i class='bi bi-exclamation-triangle me-2'></i>Something went wrong. Please try again later.", "danger");
    }
  });
};

// Update theme icon
const updateThemeIcon = (element, isDark) => {
  element.innerHTML = isDark ? '<i class="bi bi-sun-fill"></i>' : '<i class="bi bi-moon-fill"></i>';
  element.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
};

// Pricing toggle functionality
const initPricingToggle = () => {
  const pricingToggle = document.getElementById("pricingToggle");
  const pricingPlans = document.getElementById("pricingPlans");

  if (!pricingToggle || !pricingPlans) return;

  const plans = [
    { name: 'Basic Plan', monthly: 1000, yearly: 12000 },
    { name: 'Pro Plan', monthly: 2000, yearly: 24000 },
    { name: 'Enterprise Plan', monthly: 5000, yearly: 60000 }
  ];

  const formatPrice = (price, isYearly) => {
    return `KES ${price.toLocaleString()}/${isYearly ? 'year' : 'month'}`;
  };

  const renderPlans = (isYearly) => {
    try {
      pricingPlans.innerHTML = plans.map(plan => `
        <div class="col-md-4" data-aos="fade-up">
          <div class="pricing-card">
            <h3>${plan.name}</h3>
            <p class="price">${formatPrice(isYearly ? plan.yearly : plan.monthly, isYearly)}</p>
            ${isYearly ? `<p class="savings">Save ${Math.round((1 - (plan.yearly / (plan.monthly * 12))) * 100)}%</p>` : ''}
          </div>
        </div>
      `).join('');
    } catch (error) {
      console.error('Error rendering pricing plans:', error);
      showToast('Error updating pricing. Please refresh the page.', 'danger');
    }
  };

  renderPlans(false);

  pricingToggle.addEventListener("click", () => {
    const isYearly = pricingToggle.classList.toggle("active");
    renderPlans(isYearly);

    pricingToggle.setAttribute('aria-pressed', isYearly.toString());
    pricingToggle.setAttribute('aria-label', `Switch to ${isYearly ? 'monthly' : 'yearly'} pricing`);
  });
};

// Initialize collapsible content toggles
const initCollapsible = () => {
  const collapsibleButtons = document.querySelectorAll("[data-bs-toggle='collapse']");
  if (!collapsibleButtons.length) return;

  collapsibleButtons.forEach((button) => {
    try {
      const targetId = button.getAttribute("data-bs-target");
      if (!targetId) return;

      const target = document.querySelector(targetId);
      if (!target) return;

      target.addEventListener("shown.bs.collapse", () => {
        button.textContent = "Read Less";
        button.setAttribute('aria-expanded', 'true');
        button.setAttribute('aria-label', 'Show less content');
      });

      target.addEventListener("hidden.bs.collapse", () => {
        button.textContent = "Read More";
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-label', 'Show more content');
      });

      const isExpanded = target.classList.contains('show');
      button.setAttribute('aria-expanded', isExpanded.toString());
      button.setAttribute('aria-label', isExpanded ? 'Show less content' : 'Show more content');
    } catch (error) {
      console.error('Error initializing collapsible button:', error);
    }
  });
};

// Initialize everything
document.addEventListener("DOMContentLoaded", () => {
  try {
    initNavbar();
    initForms();
    initPricingToggle();
    initCollapsible();
    AOS.init();

    const backToTopButton = document.querySelector(".back-to-top");
    if (backToTopButton) {
      window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
          backToTopButton.classList.remove("d-none");
        } else {
          backToTopButton.classList.add("d-none");
        }
      });
    }
  } catch (error) {
    console.error('Error during initialization:', error);
  }
});

// Back to top button functionality
document.addEventListener("DOMContentLoaded", () => {
  const backToTopButton = document.querySelector(".back-to-top");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      backToTopButton.classList.add("show");
    } else {
      backToTopButton.classList.remove("show");
    }
  });

  backToTopButton.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});
