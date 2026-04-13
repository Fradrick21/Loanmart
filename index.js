/* ============================================================
   LOAN MART - script.js
   ============================================================ */

/* CUSTOM CURSOR - DISABLED FOR PERFORMANCE */
/* Custom cursor tracking disabled to improve performance */

/* STICKY NAV */
const nav = document.getElementById('nav');

function updateNav() {
  if (nav) {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }
}

window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

/* SCROLL REVEAL */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* COUNT-UP ANIMATION */
const counters = document.querySelectorAll('.count-up');
let counted = false;

const countObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && !counted) {
    counted = true;

    counters.forEach(counter => {
      const target = Number(counter.getAttribute('data-target'));
      const duration = 1400;
      const step = target / (duration / 16);
      let current = 0;

      const timer = setInterval(() => {
        current += step;

        if (current >= target) {
          current = target;
          clearInterval(timer);
        }

        counter.textContent = Math.floor(current);
      }, 16);
    });
  }
}, { threshold: 0.4 });

const heroStats = document.querySelector('.hero-metrics-grid');
if (heroStats) countObserver.observe(heroStats);

/* ============================================================
   EMI CALCULATOR LOGIC
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const formatRupee = (num) => Math.round(num).toLocaleString('en-IN');
  const parseRupee = (str) => Number(str.replace(/,/g, '')) || 0;

  // Amount
  const amtInput = document.getElementById('emi-amount-input');
  const amtSlider = document.getElementById('emi-amount-slider');
  // Rate
  const rateInput = document.getElementById('emi-rate-input');
  const rateSlider = document.getElementById('emi-rate-slider');
  // Tenure
  const tenureInput = document.getElementById('emi-tenure-input');
  const tenureSlider = document.getElementById('emi-tenure-slider');

  // Outputs
  const resultEMI = document.getElementById('emi-result-value');
  const resultInterest = document.getElementById('emi-interest-value');
  const resultTotal = document.getElementById('emi-total-value');
  const pieChart = document.getElementById('emi-pie-chart');
  const piLabel = document.getElementById('emi-pi-label');
  const tiLabel = document.getElementById('emi-ti-label');

  if (!amtInput) return; // Not on page

  function calculateEMI() {
    let P = parseRupee(amtInput.value);
    let R = Number(rateInput.value) / 12 / 100;
    let N = Number(tenureInput.value);

    let emi = 0;
    let totalAmt = 0;
    let totalInt = 0;

    if (P > 0 && R > 0 && N > 0) {
      emi = P * R * (Math.pow(1 + R, N) / (Math.pow(1 + R, N) - 1));
      totalAmt = emi * N;
      totalInt = totalAmt - P;
    } else if (P > 0 && N > 0) {
      // 0% interest
      emi = P / N;
      totalAmt = P;
      totalInt = 0;
    }

    resultEMI.textContent = `₹ ${formatRupee(emi)}`;
    resultInterest.textContent = `₹ ${formatRupee(totalInt)}`;
    resultTotal.textContent = `₹ ${formatRupee(totalAmt)}`;

    updateChart(P, totalInt, totalAmt);
  }

  function updateChart(principal, interest, total) {
    if (total <= 0) {
      pieChart.style.background = `conic-gradient(var(--gold) 0deg 0deg, #ee4444 0deg 360deg)`;
      piLabel.textContent = '100%';
      tiLabel.textContent = '0%';
      return;
    }

    let pPercent = (principal / total) * 100;
    let iPercent = (interest / total) * 100;

    let pDeg = (pPercent / 100) * 360;
    let iDeg = (iPercent / 100) * 360;
    
    pieChart.style.background = `conic-gradient(var(--gold) 0deg ${iDeg}deg, #ee4444 ${iDeg}deg 360deg)`;
    
    piLabel.textContent = `${pPercent.toFixed(1)}%`;
    tiLabel.textContent = `${iPercent.toFixed(1)}%`;
  }

  function updateSliderFill(slider) {
    let min = Number(slider.min) || 0;
    let max = Number(slider.max) || 100;
    let val = Number(slider.value);
    let percent = ((val - min) / (max - min)) * 100;
    slider.style.setProperty('--fill-percent', `${percent}%`);
  }

  function syncAmount(e) {
    let val = e.target.value;
    if (e.target === amtInput) {
      val = parseRupee(val);
      if (val > 10000000) val = 10000000;
      amtSlider.value = val;
      amtInput.value = formatRupee(val);
    } else {
      amtInput.value = formatRupee(val);
    }
    updateSliderFill(amtSlider);
    calculateEMI();
  }

  function syncRate(e) {
    let val = e.target.value;
    if (e.target === rateInput) {
      if (val > 36) val = 36;
      rateSlider.value = val;
    } else {
      rateInput.value = val;
    }
    updateSliderFill(rateSlider);
    calculateEMI();
  }

  function syncTenure(e) {
    let val = e.target.value;
    if (e.target === tenureInput) {
      if (val > 84) val = 84;
      tenureSlider.value = val;
    } else {
      tenureInput.value = val;
    }
    updateSliderFill(tenureSlider);
    calculateEMI();
  }

  amtInput.addEventListener('change', syncAmount);
  amtSlider.addEventListener('input', syncAmount);

  rateInput.addEventListener('change', syncRate);
  rateSlider.addEventListener('input', syncRate);

  tenureInput.addEventListener('change', syncTenure);
  tenureSlider.addEventListener('input', syncTenure);

  // Focus out formatting
  const focusOutFmt = (inputObj, maxObj) => {
    inputObj.addEventListener('blur', () => {
      if(!inputObj.value || isNaN(parseRupee(inputObj.value))) {
        inputObj.value = 0;
      }
    });
  };
  focusOutFmt(amtInput);
  focusOutFmt(rateInput);
  focusOutFmt(tenureInput);

  // Initial Calculate
  updateSliderFill(amtSlider);
  updateSliderFill(rateSlider);
  updateSliderFill(tenureSlider);
  calculateEMI();
});

/* MOBILE NAV TOGGLE */
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const navDropdown = document.querySelector('.nav-dropdown');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

  if (navDropdown) {
    const dropdownLink = navDropdown.querySelector('a');
    if (dropdownLink) {
      dropdownLink.addEventListener('click', (e) => {
        if (window.innerWidth <= 900) {
          e.preventDefault();
          navDropdown.classList.toggle('active');
        }
      });
    }
  }
});
