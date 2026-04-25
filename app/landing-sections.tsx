
// @ts-nocheck
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
      const target = parseInt(el.dataset.count || el.textContent.replace(/\D/g, ''), 10) || 0;
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
      
<section className="features" id="features">
  <div className="container">
    <div className="features-head">
      <div className="reveal">
        <div className="section-eyebrow">La plataforma</div>
        <h2 className="section-title">Todo lo que necesitas para<br/>cuidar <em>mejor</em>, o ser <em>mejor cuidado</em>.</h2>
      </div>
      <p className="features-intro reveal">Un espacio pensado con detalle, donde cada herramienta responde a una realidad del cuidado: descubrir, reservar, conversar, acompañar.</p>
    </div>

    <div className="features-grid">
      <div className="feature-card f-large large reveal">
        <div className="feature-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
        <h3 className="feature-title">Descubre al profesional adecuado, sin la ansiedad de empezar.</h3>
        <p className="feature-desc">Búsqueda contextual por especialidad, enfoque terapéutico, idioma, modalidad y presupuesto. Los resultados aprenden de lo que valoras.</p>
        <div className="f-illus">
          <div className="search-mock">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
            <span>Psicóloga especializada en ansiedad, online</span>
            <div className="cursor"></div>
          </div>
          <div className="chip-row">
            <div className="chip active">Ansiedad</div>
            <div className="chip">Terapia cognitiva</div>
            <div className="chip">Online</div>
            <div className="chip">Español · Catalán</div>
            <div className="chip">$35.000–$60.000</div>
          </div>
        </div>
      </div>

      <div className="feature-card f-tall reveal">
        <div className="feature-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 12l2 2 4-4"/><path d="M12 2l8.5 4.5v5c0 5-3.5 9.5-8.5 10.5-5-1-8.5-5.5-8.5-10.5v-5L12 2z"/></svg>
        </div>
        <h3 className="feature-title">Verificación real.</h3>
        <p className="feature-desc">Cada profesional pasa por validación de colegiatura, antecedentes y referencias. Confianza, no marketing.</p>
        <div className="f-illus secure-lines">
          <div className="secure-line"><span className="secure-check"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></span>Colegiatura activa</div>
          <div className="secure-line"><span className="secure-check"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></span>Identidad verificada</div>
          <div className="secure-line"><span className="secure-check"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></span>Especialidades validadas</div>
          <div className="secure-line"><span className="secure-check"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></span>Ética profesional vigente</div>
        </div>
      </div>

      <div className="feature-card f-half reveal">
        <div className="feature-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <h3 className="feature-title">Conversaciones privadas y cifradas.</h3>
        <p className="feature-desc">Mensajes, notas y expedientes protegidos con cifrado extremo a extremo.</p>
        <div className="f-illus">
          <div className="chat-bubble">Hola Laura, ¿podríamos mover la cita del jueves?</div>
          <div className="chat-bubble you">Claro, tengo disponible a las 17:00. ¿Te funciona?</div>
        </div>
      </div>

      <div className="feature-card f-half reveal">
        <div className="feature-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
        </div>
        <h3 className="feature-title">Agenda que respira contigo.</h3>
        <p className="feature-desc">Sincronización con Google, iCloud y Outlook. Recordatorios amables, no invasivos.</p>
        <div className="f-illus">
          <div className="prof-mini">
            <div className="prof-mini-av" style={{"background":"linear-gradient(135deg,oklch(0.78 0.06 170),oklch(0.65 0.08 160))"}}></div>
            <div>
              <div className="prof-mini-name">Martes, 16:00</div>
              <div className="prof-mini-specialty">Dra. Mendoza · 50 min</div>
            </div>
            <div className="prof-mini-badge">Confirmada</div>
          </div>
          <div className="prof-mini">
            <div className="prof-mini-av" style={{"background":"linear-gradient(135deg,oklch(0.8 0.08 60),oklch(0.68 0.1 45))"}}></div>
            <div>
              <div className="prof-mini-name">Viernes, 11:30</div>
              <div className="prof-mini-specialty">Dr. Ruiz · 30 min</div>
            </div>
            <div className="prof-mini-badge">Próxima</div>
          </div>
        </div>
      </div>

      <div className="feature-card f-third reveal">
        <div className="feature-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>
        <h3 className="feature-title">Pagos transparentes.</h3>
        <p className="feature-desc">Una tarifa clara, facturación automática y devoluciones sin preguntas incómodas.</p>
      </div>

      <div className="feature-card f-third reveal">
        <div className="feature-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8M8 13h5"/></svg>
        </div>
        <h3 className="feature-title">Seguimiento compartido.</h3>
        <p className="feature-desc">Notas, tareas entre sesiones y un espejo amable del progreso, solo entre tú y tu profesional.</p>
      </div>

      <div className="feature-card f-third reveal">
        <div className="feature-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>
        </div>
        <h3 className="feature-title">Dentro o fuera del consultorio.</h3>
        <p className="feature-desc">Videoconsulta integrada con calidad clínica. O presencial, cuando eso acerque más.</p>
      </div>
    </div>
  </div>
</section>


<section className="how" id="how">
  <div className="container">
    <div className="how-head reveal">
      <div className="section-eyebrow">Cómo funciona</div>
      <h2 className="section-title">Tres pasos, y el tiempo que<br/>necesites para <em>decidir</em>.</h2>
    </div>
    <div className="how-steps">
      <div className="how-step reveal">
        <div className="how-step-num">01</div>
        <h3>Cuéntanos qué buscas</h3>
        <p>Responde unas preguntas cuidadas. Sin cuestionarios invasivos, sin venderte nada.</p>
      </div>
      <div className="how-step reveal">
        <div className="how-step-num">02</div>
        <h3>Descubre profesionales afines</h3>
        <p>Recibe una selección hecha a medida. Lee sus enfoques, escucha su voz, mira su disponibilidad.</p>
      </div>
      <div className="how-step reveal">
        <div className="how-step-num">03</div>
        <h3>Empieza cuando estés listo</h3>
        <p>Reserva en segundos. Paga solo al confirmar. Cancela o mueve la cita sin culpa.</p>
      </div>
    </div>
  </div>
</section>


<section className="specs">
  <div className="container">
    <div className="specs-head">
      <div className="reveal">
        <div className="section-eyebrow">Especialidades</div>
        <h2 className="section-title">Una red amplia,<br/>un cuidado <em>cercano</em>.</h2>
      </div>
      <a href="#" className="btn btn-outline reveal">Explorar todas
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
      </a>
    </div>
    <div className="specs-grid">
      <div className="spec-card reveal"><div className="spec-num">01</div><div className="spec-name">Psicología clínica</div><div className="spec-meta"><span className="spec-meta-dot"></span>3,240 profesionales</div></div>
      <div className="spec-card reveal"><div className="spec-num">02</div><div className="spec-name">Nutrición y dietética</div><div className="spec-meta"><span className="spec-meta-dot"></span>1,820 profesionales</div></div>
      <div className="spec-card reveal"><div className="spec-num">03</div><div className="spec-name">Fisioterapia</div><div className="spec-meta"><span className="spec-meta-dot"></span>2,105 profesionales</div></div>
      <div className="spec-card reveal"><div className="spec-num">04</div><div className="spec-name">Medicina general</div><div className="spec-meta"><span className="spec-meta-dot"></span>1,290 profesionales</div></div>
      <div className="spec-card reveal"><div className="spec-num">05</div><div className="spec-name">Terapia de pareja</div><div className="spec-meta"><span className="spec-meta-dot"></span>680 profesionales</div></div>
      <div className="spec-card reveal"><div className="spec-num">06</div><div className="spec-name">Logopedia</div><div className="spec-meta"><span className="spec-meta-dot"></span>540 profesionales</div></div>
      <div className="spec-card reveal"><div className="spec-num">07</div><div className="spec-name">Coaching de salud</div><div className="spec-meta"><span className="spec-meta-dot"></span>920 profesionales</div></div>
      <div className="spec-card reveal"><div className="spec-num">08</div><div className="spec-name">Medicina integrativa</div><div className="spec-meta"><span className="spec-meta-dot"></span>410 profesionales</div></div>
    </div>
  </div>
</section>


<section className="demo">
  <div className="demo-glow"></div>
  <div className="container">
    <div className="demo-head reveal">
      <div className="section-eyebrow">Ver en acción</div>
      <h2 className="section-title">Una demostración de <em>dos minutos</em>.</h2>
      <p className="demo-sub">Mira cómo una paciente encuentra a su nutricionista ideal, reserva su primera cita y recibe acompañamiento entre sesiones — todo dentro de Nurea.</p>
    </div>
    <div className="demo-player reveal">
      <div className="demo-placeholder-label">[ Placeholder · Video demo 1920×1080 ]</div>
      <div className="play-btn">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      </div>
      <div className="demo-caption">
        <span>Recorrido por la plataforma</span>
        <span className="demo-duration">02:14</span>
      </div>
    </div>
  </div>
</section>


<section className="testis">
  <div className="container">
    <div className="reveal" style={{"maxWidth":"680px","marginBottom":"20px"}}>
      <div className="section-eyebrow">Voces de la red</div>
      <h2 className="section-title">Profesionales que <em>eligen</em> a Nurea.</h2>
    </div>
    <div className="testis-grid">
      <div className="testi reveal">
        <p className="testi-quote">“Nurea me devolvió horas cada semana. Lo que antes era gestión ahora es tiempo con mis pacientes.”</p>
        <div className="testi-author">
          <div className="testi-av" style={{"background":"linear-gradient(135deg,oklch(0.78 0.06 170),oklch(0.65 0.08 160))"}}></div>
          <div>
            <div className="testi-name">Laura Mendoza</div>
            <div className="testi-role">Psicóloga clínica · Santiago</div>
          </div>
        </div>
      </div>
      <div className="testi reveal">
        <p className="testi-quote">“La verificación me da tranquilidad. Sé que cada profesional de la red comparte los mismos estándares.”</p>
        <div className="testi-author">
          <div className="testi-av" style={{"background":"linear-gradient(135deg,oklch(0.8 0.08 60),oklch(0.68 0.1 45))"}}></div>
          <div>
            <div className="testi-name">Carlos Ruiz</div>
            <div className="testi-role">Nutricionista · Barcelona</div>
          </div>
        </div>
      </div>
      <div className="testi reveal">
        <p className="testi-quote">“Por primera vez siento que una plataforma entiende que el cuidado es un proceso, no una transacción.”</p>
        <div className="testi-author">
          <div className="testi-av" style={{"background":"linear-gradient(135deg,oklch(0.82 0.05 340),oklch(0.7 0.07 330))"}}></div>
          <div>
            <div className="testi-name">María Alonso</div>
            <div className="testi-role">Fisioterapeuta · Valencia</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>


<section className="pricing" id="pricing">
  <div className="container">
    <div className="pricing-head reveal">
      <div className="section-eyebrow">Precios</div>
      <h2 className="section-title">Transparente para pacientes,<br/><em>justo</em> para profesionales.</h2>
      <div className="pricing-toggle" id="pricing-toggle">
        <span className="pricing-toggle-pill" id="toggle-pill"></span>
        <button className="active" data-period="mensual">Mensual</button>
        <button data-period="anual">Anual <span className="toggle-save">−20%</span></button>
      </div>
    </div>
    <div className="plans">
      <div className="plan reveal">
        <div className="plan-name serif">Exploración</div>
        <div className="plan-desc">Para pacientes que inician su camino.</div>
        <div className="plan-price"><span className="curr">$</span><span>0</span></div>
        <div className="plan-period">Siempre gratis</div>
        <a href="register.html" className="btn btn-outline plan-cta">Crear cuenta</a>
        <ul className="plan-features">
          <li><span className="check-mini"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></span>Acceso completo a la red</li>
          <li><span className="check-mini"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></span>Reserva de citas sin comisión</li>
          <li><span className="check-mini"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></span>Historial privado de sesiones</li>
          <li><span className="check-mini"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></span>Soporte por correo</li>
        </ul>
      </div>

      <div className="plan featured reveal">
        <div className="plan-badge">Más elegido</div>
        <div className="plan-name serif">Profesional</div>
        <div className="plan-desc">Para consultas independientes que crecen.</div>
        <div className="plan-price" data-monthly="29" data-yearly="23"><span className="curr">$</span><span>29.990</span></div>
        <div className="plan-period">por profesional / mes</div>
        <a href="register.html?role=pro" className="btn btn-terracotta plan-cta">Empezar 14 días gratis</a>
        <ul className="plan-features">
          <li><span className="check-mini"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></span>Perfil verificado y destacado</li>
          <li><span className="check-mini"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></span>Agenda con sincronización total</li>
          <li><span className="check-mini"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></span>Videoconsulta ilimitada</li>
          <li><span className="check-mini"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></span>Cobros y facturación automática</li>
          <li><span className="check-mini"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></span>Soporte prioritario 7 días</li>
        </ul>
      </div>

      <div className="plan reveal">
        <div className="plan-name serif">Clínica</div>
        <div className="plan-desc">Equipos y centros de salud multidisciplinares.</div>
        <div className="plan-price"><span>A medida</span></div>
        <div className="plan-period">Desde 5 profesionales</div>
        <a href="#" className="btn btn-outline plan-cta">Agendar una llamada</a>
        <ul className="plan-features">
          <li><span className="check-mini"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></span>Todo lo del plan Profesional</li>
          <li><span className="check-mini"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></span>Panel multi-profesional</li>
          <li><span className="check-mini"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></span>Informes clínicos agregados</li>
          <li><span className="check-mini"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></span>Integraciones con HCE</li>
          <li><span className="check-mini"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></span>Gestor de cuenta dedicado</li>
        </ul>
      </div>
    </div>
  </div>
</section>


<section className="blog" id="blog">
  <div className="container">
    <div className="blog-head">
      <div className="reveal">
        <div className="section-eyebrow">Diario de Nurea</div>
        <h2 className="section-title">Lecturas que <em>acompañan</em><br/>la práctica del cuidado.</h2>
      </div>
      <a href="#" className="btn btn-outline reveal">Ver todos los artículos
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
      </a>
    </div>
    <div className="blog-grid">
      <article className="blog-card featured reveal">
        <div className="blog-img blog-img-1"></div>
        <div className="blog-meta">Guía clínica · 8 min</div>
        <h3 className="blog-title">Cómo construir una primera sesión que invite a volver (sin que se sienta un interrogatorio).</h3>
        <p className="blog-excerpt">Tres marcos prácticos para abrir el espacio terapéutico con calma, basados en evidencia y en las voces de 200 profesionales de la red.</p>
      </article>
      <article className="blog-card reveal">
        <div className="blog-img blog-img-2"></div>
        <div className="blog-meta">Tendencias · 5 min</div>
        <h3 className="blog-title">El nuevo lenguaje del bienestar: qué buscan los pacientes en 2026.</h3>
      </article>
      <article className="blog-card reveal">
        <div className="blog-img blog-img-3"></div>
        <div className="blog-meta">Práctica profesional · 6 min</div>
        <h3 className="blog-title">Fijar tarifas sin ansiedad: una conversación honesta sobre el valor del cuidado.</h3>
      </article>
    </div>
  </div>
</section>


<section className="faq" id="faq">
  <div className="container">
    <div className="faq-grid">
      <div className="faq-side reveal">
        <div className="section-eyebrow">Preguntas frecuentes</div>
        <h2 className="section-title">Todo lo que quizá<br/>te estás <em>preguntando</em>.</h2>
        <p>¿Algo más que resolver? Hablamos contigo, sin apuros.</p>
        <a href="#" className="btn btn-outline">Contactar con el equipo
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
        </a>
      </div>
      <div className="faq-items reveal" id="faq-items">
        <div className="faq-item">
          <div className="faq-q">¿Cómo verifican a los profesionales?
            <div className="faq-toggle"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg></div>
          </div>
          <div className="faq-a">Cada profesional presenta su colegiatura activa, documentos de identidad y referencias profesionales. Nuestro equipo clínico revisa manualmente cada caso antes de la incorporación a la red, y realiza revisiones periódicas cada seis meses.</div>
        </div>
        <div className="faq-item">
          <div className="faq-q">¿Los pacientes pagan alguna comisión?
            <div className="faq-toggle"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg></div>
          </div>
          <div className="faq-a">No. Los pacientes solo pagan la tarifa que el profesional ha definido, sin costos adicionales de plataforma ni suscripciones ocultas.</div>
        </div>
        <div className="faq-item">
          <div className="faq-q">¿Qué pasa si necesito cancelar una cita?
            <div className="faq-toggle"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg></div>
          </div>
          <div className="faq-a">Puedes cancelar hasta 24 horas antes sin coste alguno. Con menos de 24 horas, la política la define cada profesional y siempre es visible antes de reservar.</div>
        </div>
        <div className="faq-item">
          <div className="faq-q">¿La información clínica está protegida?
            <div className="faq-toggle"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg></div>
          </div>
          <div className="faq-a">Sí. Todas las conversaciones, notas y archivos están cifrados extremo a extremo. Cumplimos con RGPD y los estándares ISO 27001 y SOC 2 Tipo II.</div>
        </div>
        <div className="faq-item">
          <div className="faq-q">¿Puedo ofrecer atención presencial además de online?
            <div className="faq-toggle"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg></div>
          </div>
          <div className="faq-a">Por supuesto. Cada profesional define su modalidad — presencial, online o mixta — y los pacientes filtran sus búsquedas en función de esa preferencia.</div>
        </div>
        <div className="faq-item">
          <div className="faq-q">¿Hay permanencia si contrato un plan de pago?
            <div className="faq-toggle"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg></div>
          </div>
          <div className="faq-a">Ninguna. Puedes cambiar o cancelar tu plan cuando quieras, y tus datos se conservan durante 60 días por si decides volver.</div>
        </div>
      </div>
    </div>
  </div>
</section>


<section className="cta">
  <div className="container">
    <div className="cta-inner reveal">
      <div className="cta-blob one"></div>
      <div className="cta-blob two"></div>
      <h2 className="serif">El cuidado empieza con una<br/>conversación <em>tranquila</em>.</h2>
      <p>Únete a Nurea hoy. Gratis para pacientes, catorce días sin coste para profesionales.</p>
      <div className="cta-actions">
        <a href="register.html" className="btn btn-terracotta btn-large">Crear mi cuenta
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
        </a>
        <a href="#" className="btn btn-outline btn-large">Hablar con el equipo</a>
      </div>
    </div>
  </div>
</section>


<footer>
  <div className="container">
    <div className="footer-grid">
      <div className="footer-brand">
        <a href="#" className="logo">
          <span className="logo-mark"></span>
          <span>Nurea</span>
        </a>
        <p>El mercado de salud que conecta pacientes y profesionales con el cuidado que la salud merece.</p>
        <form className="newsletter" onsubmit="event.preventDefault(); this.querySelector('button').textContent='Gracias ✓'; this.querySelector('input').value='';">
          <input type="email" placeholder="Tu correo" required/>
          <button type="submit">Suscribirme</button>
        </form>
      </div>
      <div className="footer-col">
        <h4>Plataforma</h4>
        <ul>
          <li><a href="#">Para pacientes</a></li>
          <li><a href="#">Para profesionales</a></li>
          <li><a href="#">Para clínicas</a></li>
          <li><a href="#">Integraciones</a></li>
        </ul>
      </div>
      <div className="footer-col">
        <h4>Recursos</h4>
        <ul>
          <li><a href="#">Diario</a></li>
          <li><a href="#">Guías clínicas</a></li>
          <li><a href="#">Centro de ayuda</a></li>
          <li><a href="#">Estado del servicio</a></li>
        </ul>
      </div>
      <div className="footer-col">
        <h4>Empresa</h4>
        <ul>
          <li><a href="#">Sobre Nurea</a></li>
          <li><a href="#">Manifiesto</a></li>
          <li><a href="#">Carreras</a></li>
          <li><a href="#">Prensa</a></li>
        </ul>
      </div>
      <div className="footer-col">
        <h4>Legal</h4>
        <ul>
          <li><a href="#">Privacidad</a></li>
          <li><a href="#">Condiciones</a></li>
          <li><a href="#">Cookies</a></li>
          <li><a href="#">Código ético</a></li>
        </ul>
      </div>
    </div>
    <div className="footer-bottom">
      <div>© 2026 Nurea SpA — Hecho con cuidado en Santiago, Chile.</div>
      <div className="footer-legal">
        <a href="#">RGPD</a>
        <a href="#">ISO 27001</a>
        <a href="#">SOC 2</a>
      </div>
    </div>
  </div>
</footer>





    </>
  );
}
