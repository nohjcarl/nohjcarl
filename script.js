
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

menuToggle.addEventListener("click", () => {
  navMenu.classList.toggle("active");
  menuToggle.classList.toggle("active");
});


document.querySelectorAll("#navMenu a").forEach(link => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("active");
    menuToggle.classList.remove("active");
  });
});


document.addEventListener("click", (e) => {
  if (!e.target.closest("nav")) {
    navMenu.classList.remove("active");
    menuToggle.classList.remove("active");
  }
});


const faders = document.querySelectorAll(".fade");

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
});

faders.forEach(el => observer.observe(el));



const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");
const closeBtn = document.getElementById("close");

document.querySelectorAll(".gallery img").forEach(img => {
  img.onclick = () => {
    modal.style.display = "flex";
    modalImg.src = img.src;
  };
});

closeBtn.onclick = () => {
  modal.style.display = "none";
};


const contactForm = document.getElementById('contactForm');
const contactClear = document.getElementById('contactClear');


const EMAILJS_USER_ID = '51C_cA0zsEDwxIdB0';
const EMAILJS_SERVICE_ID = 'service_ekzhbgs';
const EMAILJS_TEMPLATE_ID = 'template_x86e87p';

if (window.emailjs) {
  try {
    emailjs.init(EMAILJS_USER_ID);
  } catch (err) {
    console.warn('EmailJS init error', err);
  }
}

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';

    const templateParams = {
      from_name: name,
      from_email: email,
      message: message
    };

    
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
      .then(() => {
        alert('Message sent — thank you!');
        contactForm.reset();
      }, (error) => {
        console.error('EmailJS error:', error);
        alert('Sorry — sending failed. Please try again or email directly.');
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      });
  });
}

if (contactClear) {
  contactClear.addEventListener('click', () => {
    if (contactForm) contactForm.reset();
  });
}


let currentSlideIndex = 1;
let slideAutoPlayInterval;

function showSlides(n) {
  const slides = document.querySelectorAll(".project-slide");
  const dots = document.querySelectorAll(".dot");

  if (n > slides.length) {
    currentSlideIndex = 1;
  }
  if (n < 1) {
    currentSlideIndex = slides.length;
  }

  slides.forEach(slide => slide.classList.remove("active"));
  dots.forEach(dot => dot.classList.remove("active"));

  if (slides[currentSlideIndex - 1]) {
    slides[currentSlideIndex - 1].classList.add("active");
  }
  if (dots[currentSlideIndex - 1]) {
    dots[currentSlideIndex - 1].classList.add("active");
  }
}

function changeSlide(n) {
  clearInterval(slideAutoPlayInterval);
  currentSlideIndex += n;
  showSlides(currentSlideIndex);
  autoPlaySlides();
}

function currentSlide(n) {
  clearInterval(slideAutoPlayInterval);
  currentSlideIndex = n;
  showSlides(currentSlideIndex);
  autoPlaySlides();
}

function autoPlaySlides() {
  slideAutoPlayInterval = setInterval(() => {
    currentSlideIndex++;
    showSlides(currentSlideIndex);
  }, 5000); 
}


if (document.querySelectorAll(".project-slide").length > 0) {
  showSlides(currentSlideIndex);
  autoPlaySlides();
}


