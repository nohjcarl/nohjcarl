
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

console.log('=== EmailJS Configuration ===');
console.log('User ID (Public Key):', EMAILJS_USER_ID);
console.log('Service ID:', EMAILJS_SERVICE_ID);
console.log('Template ID:', EMAILJS_TEMPLATE_ID);
console.log('EmailJS loaded?', typeof emailjs !== 'undefined');

if (window.emailjs) {
  try {
    emailjs.init(EMAILJS_USER_ID);
    console.log('✓ EmailJS initialized successfully');
  } catch (err) {
    console.error('❌ EmailJS init error:', err);
  }
} else {
  console.error('❌ CRITICAL: EmailJS SDK not loaded! Check script tag in HTML.');
}

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !message) {
      alert('Please fill in all fields.');
      return;
    }

    // DEBUG: Check if emailjs is available
    if (typeof emailjs === 'undefined') {
      alert('❌ ERROR: EmailJS SDK not loaded!\n\nMake sure the EmailJS script tag is in index.html before script.js');
      console.error('emailjs is undefined!');
      return;
    }

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';

    const templateParams = {
      from_name: name,
      from_email: email,
      message: message
    };

    console.log('📧 Attempting to send...');
    console.log('Service ID:', EMAILJS_SERVICE_ID);
    console.log('Template ID:', EMAILJS_TEMPLATE_ID);
    console.log('Params:', templateParams);

    // 15-second timeout
    const timeoutId = setTimeout(() => {
      console.error('❌ No response from EmailJS after 15 seconds');
      const diagnose = `
❌ EMAIL SEND TIMEOUT

Possible causes:
1. Public Key (User ID) is WRONG: ${EMAILJS_USER_ID}
2. Service ID is WRONG: ${EMAILJS_SERVICE_ID}
3. Template ID is WRONG or UNPUBLISHED: ${EMAILJS_TEMPLATE_ID}
4. Template "To Email" not configured to: jc15ayuda@gmail.com

ACTION: Log into EmailJS Dashboard and verify all IDs match.
Then copy-paste the console logs here for diagnosis.
      `;
      alert(diagnose);
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }, 15000);

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
      .then((response) => {
        clearTimeout(timeoutId);
        console.log('✓ SUCCESS! Email sent!', response);
        alert('✓ Message sent to jc15ayuda@gmail.com — thank you!');
        contactForm.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        console.error('❌ EmailJS returned an error:', error);
        const errorMsg = error.text || error.message || JSON.stringify(error);
        const fullMsg = `
❌ EMAILJS ERROR

Message: ${errorMsg}

Config being used:
- Service ID: ${EMAILJS_SERVICE_ID}
- Template ID: ${EMAILJS_TEMPLATE_ID}
- Public Key: ${EMAILJS_USER_ID}

Copy this entire message and share it for diagnosis.
        `;
        alert(fullMsg);
        console.error('Full error object:', error);
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


