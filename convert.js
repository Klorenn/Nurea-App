const fs = require('fs');

let html = fs.readFileSync('remaining.html', 'utf8');

// Quick HTML to JSX conversions
html = html.replace(/class="/g, 'className="');
html = html.replace(/for="/g, 'htmlFor="');
html = html.replace(/stroke-width/g, 'strokeWidth');
html = html.replace(/stroke-linecap/g, 'strokeLinecap');
html = html.replace(/stroke-linejoin/g, 'strokeLinejoin');
html = html.replace(/fill-rule/g, 'fillRule');
html = html.replace(/clip-rule/g, 'clipRule');

// Self close void tags
html = html.replace(/<img([^>]+)>/g, (m, p1) => {
  if (p1.endsWith('/')) return m;
  return `<img${p1}/>`;
});
html = html.replace(/<br>/g, '<br/>');
html = html.replace(/<hr>/g, '<hr/>');
html = html.replace(/<input([^>]+)>/g, (m, p1) => {
  if (p1.endsWith('/')) return m;
  return `<input${p1}/>`;
});

// Convert inline styles. We only have a few in remaining.html:
// style="max-width:680px; margin-bottom:20px;" -> style={{maxWidth: "680px", marginBottom: "20px"}}
// style="background:linear-gradient(135deg,oklch(0.78 0.06 170),oklch(0.65 0.08 160))" -> style={{background: "linear-gradient(135deg,oklch(0.78 0.06 170),oklch(0.65 0.08 160))"}}
html = html.replace(/style="([^"]+)"/g, (m, p1) => {
  const parts = p1.split(';').filter(Boolean);
  const obj = {};
  for (let p of parts) {
    let [k, ...v] = p.split(':');
    if (!k || !v.length) continue;
    k = k.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    obj[k] = v.join(':').trim();
  }
  return `style={${JSON.stringify(obj)}}`;
});

// We have a script tag at the end of remaining.html that has JS logic for UI (scroll reveal, pricing toggle, etc).
// The user already has `useReveal()` hook in app/page.tsx, but the interactive parts like pricing toggle need to work.
// I will just put the HTML inside a component and the JS inside a useEffect.

const output = `
"use client"
import React, { useEffect } from 'react';

export default function RemainingSections() {
  useEffect(() => {
    // Scroll reveal
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('in'), i * 40);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    // Animated counters
    function animateCount(el) {
      const target = parseInt(el.dataset.count || el.textContent.replace(/\\D/g, ''), 10) || 0;
      if (!target) return;
      const unit = el.querySelector('.unit')?.outerHTML || '';
      const duration = 1600;
      const start = performance.now();
      function fmt(n) {
        if (target >= 1000) return Math.floor(n).toLocaleString('es-ES');
        return Math.floor(n).toString();
      }
      function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.innerHTML = fmt(target * eased) + unit;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
    const countIo = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCount(e.target);
          countIo.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('.stat-num').forEach(el => countIo.observe(el));

    // FAQ accordion
    document.querySelectorAll('.faq-item').forEach(item => {
      item.addEventListener('click', () => {
        const wasOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
        if (!wasOpen) item.classList.add('open');
      });
    });
    document.querySelector('.faq-item')?.classList.add('open');

    // Pricing toggle
    const toggle = document.getElementById('pricing-toggle');
    const pill = document.getElementById('toggle-pill');
    function positionPill() {
      if(!toggle || !pill) return;
      const active = toggle.querySelector('button.active');
      if (!active) return;
      pill.style.left = active.offsetLeft + 'px';
      pill.style.width = active.offsetWidth + 'px';
    }
    setTimeout(positionPill, 50);
    window.addEventListener('resize', positionPill);

    if(toggle) {
      toggle.querySelectorAll('button').forEach(b => {
        b.addEventListener('click', () => {
          toggle.querySelectorAll('button').forEach(x => x.classList.remove('active'));
          b.classList.add('active');
          positionPill();
          const isYearly = b.dataset.period === 'anual';
          document.querySelectorAll('.plan-price[data-monthly]').forEach(p => {
            const num = p.querySelector('span:last-child');
            if(num) num.textContent = isYearly ? p.dataset.yearly : p.dataset.monthly;
          });
        });
      });
    }

  }, []);

  return (
    <>
      ${html.replace(/<script>[\s\S]*?<\/script>/gi, '').replace(/<!--[\s\S]*?-->/g, '')}
    </>
  );
}
`;

fs.writeFileSync('app/landing-sections.tsx', output);
console.log('done');
