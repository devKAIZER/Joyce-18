// For Countdown
const eventDate = new Date("2025-06-21T17:00:00");

function updateCountdown() {
  const now = new Date();
  const timeLeft = eventDate - now;
  const countdownEl = document.getElementById("countdown");

  if (timeLeft <= 0) {
    countdownEl.innerHTML = `<div class="countdown-box">Event<br>Started!</div>`;
    return;
  }

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  countdownEl.innerHTML = `
    ${createCountdownBox(days, 'Days')}
    ${createCountdownBox(hours, 'Hours')}
    ${createCountdownBox(minutes, 'Minutes')}
    ${createCountdownBox(seconds, 'Seconds')}
  `;
}

function createCountdownBox(value, label) {
  return `
    <div class="countdown-box">
      <div class="number">${value}</div>
      <div class="label">${label}</div>
    </div>
  `;
}

const images = [
  "images/Invitation/Front.webp",
  "images/Invitation/P1.webp",
  "images/Invitation/P2.webp",
  "images/Invitation/P3.webp",
  "images/Invitation/P4.webp",
  "images/Invitation/P5.webp"
];

const track = document.getElementById("carouselTrack");
images.forEach(src => {
  const img = document.createElement("img");
  img.src = src;
  track.appendChild(img);
});

let index = 0;

function updateCarousel() {
  track.style.transition = 'transform 0.5s ease-in-out';
  track.style.transform = `translateX(-${index * 100}%)`;
}

document.getElementById("nextBtn").addEventListener("click", () => {
  index = (index + 1) % images.length;
  updateCarousel();
});

document.getElementById("prevBtn").addEventListener("click", () => {
  index = (index - 1 + images.length) % images.length;
  updateCarousel();
});


// RSVP Forms Script
const form = document.getElementById('rsvpForm');
let submitting = false;

async function getIP() {
  try {
    const res = await fetch('https://api64.ipify.org?format=json', { cache: "no-store" });
    const data = await res.json();
    return data.ip;
  } catch {
    return null;
  }
}

async function hashString(message) {
  const sha = new jsSHA("SHA-256", "TEXT");
  sha.update(message);
  return sha.getHash("HEX");
}


async function checkDuplicate(ipHash) {
  const queryUrl = `https://sheetdb.io/api/v1/3ond5s0suc2ir/search?sheet=RSVPfromSite&Hash=${ipHash}`;
  try {
    const res = await fetch(queryUrl, { cache: "no-store" });
    if (!res.ok) {
      const text = await res.text();
      console.error('Error response:', text);
      throw new Error('Failed to query SheetsDB');
    }
    const data = await res.json();
    return data.length > 0;
  } catch (err) {
    console.error('Fetch failed:', err);
    throw err;
  }
}


async function submitForm(data, sheetsUrl) {
  const payload = {
    data: [data]
  };

  const res = await fetch(sheetsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errorText}`);
  }

  return res.json();
}

const submitBtn = document.getElementById('submitBtn');
const spinner = submitBtn.querySelector('.spinner-border');
const btnText = submitBtn.querySelector('.btn-text');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (submitting) return;
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }
  submitting = true;

  submitBtn.disabled = true;
  spinner.classList.remove('d-none');
  btnText.textContent = 'Submitting...';

  const sheetsUrl = 'https://sheetdb.io/api/v1/3ond5s0suc2ir?sheet=RSVPfromSite';
  try {
    const ip = await getIP();
    if (!ip) throw new Error('Could not determine IP address.');
    const ipHash = await hashString(ip);
    const isDuplicate = await checkDuplicate(ipHash);
    if (isDuplicate) {
      showDuplicateModal();
      return;
    }
    const formData = {
      Name: form.fullname.value.trim(),
      EmailAddress: form.email.value.trim(),
      Response: form.attendance.value,
      Comments: form.comments.value.trim(),
      ContactNumber: form.contactNumber.value.trim(),
      Hash: ipHash
    };

    await submitForm(formData, sheetsUrl);
    showSuccessModal();
    form.reset();
    form.classList.remove('was-validated');
  } catch (err) {
    alert('Submission failed: ' + err.message);
  } finally {
    submitting = false;
    submitBtn.disabled = false;
    spinner.classList.add('d-none');
    btnText.textContent = 'Submit';
  }
});


// Duplicate Modal Functions
function showDuplicateModal() {
  document.getElementById('duplicateModal').style.display = 'flex';
}

function closeDuplicateModal() {
  document.getElementById('duplicateModal').style.display = 'none';
}

// Success Modal
function showSuccessModal() {
  document.getElementById('successModal').style.display = 'flex';
}

function closeSuccessModal() {
  document.getElementById('successModal').style.display = 'none';
}

// Error Modal Functions
function showErrorModal() {
  document.getElementById('errorModal').style.display = 'flex';
}

function closeErrorModal() {
  document.getElementById('errorModal').style.display = 'none';
}

// Open Calendar

function openCalendar() {
  const isIphone = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const title = "Joyce @ 18th";
  const location = 'CJ Private resort, E. Manuel St. Sabah San Jose Montalban, 1860 Rodriguez, Rizal, Philippines 0919 358 8505, 543 Ayuson St, Rodriguez (Montalban), Lalawigan ng Rizal, Philippines';
  const description = '';
  const start = '20250621T083000Z';
  const end = '20250621T130000Z';

  if (isIphone) {
    const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${title}
LOCATION:${location}
DESCRIPTION:${description}
DTSTART:${start}
DTEND:${end}
END:VEVENT
END:VCALENDAR`.trim();

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'event.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } else {
    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&location=${encodeURIComponent(location)}`;
    window.open(googleCalendarUrl, '_blank');
  }
}


// Scroll Fade Animation
document.addEventListener('DOMContentLoaded', function () {
  const fadeElements = document.querySelectorAll('.fade-in');

  // Track scroll direction
  let lastScrollY = window.scrollY;
  let scrollDirection = 'down';

  window.addEventListener('scroll', function () {
    const currentScrollY = window.scrollY;
    scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
    lastScrollY = currentScrollY;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Add direction class based on scroll direction
        if (scrollDirection === 'up') {
          entry.target.classList.add('from-bottom');
        }
        entry.target.classList.add('visible');

        // Optional: Unobserve after animation to improve performance
        // observer.unobserve(entry.target);
      } else {
        // Reset animation when element leaves viewport
        entry.target.classList.remove('visible', 'from-bottom');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  });

  fadeElements.forEach(element => {
    observer.observe(element);
  });
});

updateCountdown();
setInterval(updateCountdown, 1000);

// Hide Navbar on Map Section
const navbar = document.getElementById('navbar');
const mapSection = document.getElementById('map-section');
const navHeight = navbar.offsetHeight;

window.addEventListener('scroll', () => {
  const mapRect = mapSection.getBoundingClientRect();

  if (mapRect.top <= navHeight && mapRect.bottom > navHeight) {
    navbar.classList.add('hidden');
  } else {
    navbar.classList.remove('hidden');
  }
});

// Smooth Scroll to Map Section
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const targetId = link.getAttribute('href').slice(1);
    const target = document.getElementById(targetId);
    if (target) {
      e.preventDefault();
      if (targetId === 'map-section') {
        window.scrollTo({
          top: target.offsetTop,
          behavior: 'smooth'
        });
      } else {
        const yOffset = -70;
        const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  });
});

