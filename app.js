/**
 * Roviro Portfolio - Interatividade & Geração de Orçamentos
 */

document.addEventListener('DOMContentLoaded', () => {
  // Destinatário do E-mail e WhatsApp de Roviro
  const ROVIRO_EMAIL = 'roviro221@gmail.com';
  // Número oficial de Roviro para recebimento de orçamentos e mensagens diretas
  let ROVIRO_PHONE = '5511986531134'; 

  // --- Helper de Rastreamento (Google Analytics 4) ---
  function trackGAEvent(eventName, eventParams = {}) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, eventParams);
    }
  }

  // --- Menu Mobile ---
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileNav = document.getElementById('mobileNav');

  if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener('click', () => {
      const isHidden = mobileNav.classList.toggle('hidden');
      mobileNav.classList.toggle('open', !isHidden);
      mobileMenuBtn.setAttribute('aria-expanded', !isHidden);
    });

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.add('hidden');
        mobileNav.classList.remove('open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // --- Seleção de Tipo de Projeto (Único) ---
  const projectTypeCards = document.querySelectorAll('#projectTypeGrid .option-card');
  let selectedProjectType = 'Sistema de Gestão Interna (ERP / Operacional)';

  projectTypeCards.forEach(card => {
    card.addEventListener('click', () => {
      projectTypeCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedProjectType = card.getAttribute('data-type');
    });
  });

  // --- Seleção de Recursos Desejados (Múltiplos) ---
  const featureChips = document.querySelectorAll('#featuresChips .chip');
  
  featureChips.forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
      const text = chip.textContent.trim();
      if (chip.classList.contains('active')) {
        if (text.startsWith('+')) {
          chip.textContent = '✓' + text.substring(1);
        }
      } else {
        if (text.startsWith('✓')) {
          chip.textContent = '+' + text.substring(1);
        }
      }
    });
  });

  // --- Máscara de Telefone / WhatsApp ---
  const phoneInput = document.getElementById('clientPhone');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 11) value = value.slice(0, 11);

      if (value.length > 6) {
        value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
      } else if (value.length > 2) {
        value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
      } else if (value.length > 0) {
        value = `(${value}`;
      }
      e.target.value = value;
    });
  }

  // --- Montagem do Briefing Estruturado ---
  function getBriefingData() {
    const name = document.getElementById('clientName').value.trim();
    const email = document.getElementById('clientEmail').value.trim();
    const phone = document.getElementById('clientPhone').value.trim();
    const deadline = document.getElementById('projectDeadline').value;
    const details = document.getElementById('projectDetails').value.trim() || 'Nenhum detalhe adicional informado inicialmente.';

    const selectedFeatures = [];
    document.querySelectorAll('#featuresChips .chip.active').forEach(chip => {
      selectedFeatures.push(chip.getAttribute('data-feature'));
    });

    return {
      name,
      email,
      phone,
      projectType: selectedProjectType,
      features: selectedFeatures,
      deadline,
      details
    };
  }

  function validateBasicFields(data) {
    if (!data.name) {
      showToast('Por favor, informe seu nome.');
      document.getElementById('clientName').focus();
      return false;
    }
    if (!data.email && !data.phone) {
      showToast('Por favor, informe seu e-mail ou WhatsApp para contato.');
      document.getElementById('clientPhone').focus();
      return false;
    }
    return true;
  }

  function buildTextMessage(data) {
    let msg = `*🚀 Solicitação de Orçamento | Roviro*\n`;
    msg += `-------------------------------------------\n`;
    msg += `*Cliente:* ${data.name}\n`;
    if (data.email) msg += `*E-mail:* ${data.email}\n`;
    if (data.phone) msg += `*WhatsApp:* ${data.phone}\n\n`;

    msg += `*📌 Tipo de Projeto:*\n${data.projectType}\n\n`;

    msg += `*⚡ Funcionalidades Desejadas:*\n`;
    if (data.features.length > 0) {
      data.features.forEach(feat => {
        msg += `• ${feat}\n`;
      });
    } else {
      msg += `• Escopo a definir em reunião técnica\n`;
    }
    msg += `\n*⏱️ Prazo Estimado:* ${data.deadline}\n\n`;

    msg += `*📝 Detalhes da Ideia / Objetivo:*\n`;
    msg += `${data.details}\n`;
    msg += `-------------------------------------------\n`;
    msg += `_Enviado via roviro.com.br_`;

    return msg;
  }

  // --- Envio via WhatsApp ---
  const btnSendWhatsapp = document.getElementById('btnSendWhatsapp');
  if (btnSendWhatsapp) {
    btnSendWhatsapp.addEventListener('click', () => {
      const data = getBriefingData();
      if (!validateBasicFields(data)) return;

      // Evento no Google Analytics 4
      trackGAEvent('gerar_orcamento_whatsapp', {
        event_category: 'Conversao',
        event_label: data.projectType,
        project_type: data.projectType
      });

      const message = buildTextMessage(data);
      const encodedMsg = encodeURIComponent(message);

      let url = '';
      if (ROVIRO_PHONE && ROVIRO_PHONE.trim() !== '') {
        url = `https://api.whatsapp.com/send?phone=${ROVIRO_PHONE}&text=${encodedMsg}`;
      } else {
        // Se ainda não houver número específico configurado, abre a interface para selecionar ou enviar
        url = `https://api.whatsapp.com/send?text=${encodedMsg}`;
      }

      window.open(url, '_blank');
      showToast('Abrindo WhatsApp com seu briefing...');
    });
  }

  // --- Envio via E-mail ---
  const btnSendEmail = document.getElementById('btnSendEmail');
  if (btnSendEmail) {
    btnSendEmail.addEventListener('click', () => {
      const data = getBriefingData();
      if (!validateBasicFields(data)) return;

      // Evento no Google Analytics 4
      trackGAEvent('gerar_orcamento_email', {
        event_category: 'Conversao',
        event_label: data.projectType,
        project_type: data.projectType
      });

      const message = buildTextMessage(data);
      const subject = encodeURIComponent(`Solicitação de Orçamento - ${data.projectType} (${data.name})`);
      const body = encodeURIComponent(message);

      const mailtoUrl = `mailto:${ROVIRO_EMAIL}?subject=${subject}&body=${body}`;
      window.location.href = mailtoUrl;
      showToast('Abrindo seu aplicativo de e-mail...');
    });
  }

  // --- Copiar Resumo ---
  const btnCopyBriefing = document.getElementById('btnCopyBriefing');
  if (btnCopyBriefing) {
    btnCopyBriefing.addEventListener('click', () => {
      const data = getBriefingData();
      const message = buildTextMessage(data);

      // Evento no Google Analytics 4
      trackGAEvent('copiar_briefing', {
        event_category: 'Interacao',
        event_label: data.projectType
      });

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(message)
          .then(() => {
            showToast('✓ Resumo da proposta copiado para a área de transferência!');
          })
          .catch(() => {
            showToast('Não foi possível copiar automaticamente.');
          });
      } else {
        showToast('Recurso de cópia indisponível no navegador.');
      }
    });
  }

  // --- Floating WhatsApp Button Action ---
  const floatingWhatsapp = document.getElementById('floatingWhatsapp');
  if (floatingWhatsapp) {
    floatingWhatsapp.addEventListener('click', (e) => {
      // Evento no Google Analytics 4
      trackGAEvent('clique_whatsapp_flutuante', {
        event_category: 'Contato',
        event_label: 'Botao Flutuante'
      });

      // Se tiver número direto de Roviro definido, abre o WhatsApp direto, senão rola até o formulário
      if (ROVIRO_PHONE && ROVIRO_PHONE.trim() !== '') {
        e.preventDefault();
        const initialText = encodeURIComponent('Olá Roviro! Gostaria de conversar sobre um projeto ou orçamento de sistema.');
        window.open(`https://api.whatsapp.com/send?phone=${ROVIRO_PHONE}&text=${initialText}`, '_blank');
      }
      // Se não, segue o href normal para #orcamento
    });
  }

  // --- Toast Notification Helper ---
  function showToast(text) {
    const toast = document.getElementById('toastNotification');
    if (!toast) return;

    toast.textContent = text;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }
});
