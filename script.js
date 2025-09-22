document.addEventListener('DOMContentLoaded', () => {

    /**
     * MÓDULO 0: BANNER DE CONSENTIMENTO DE COOKIES
     * Verifica se o usuário já consentiu, mostra o banner se não,
     * e salva o consentimento ao clicar em 'Aceitar'.
     */
    const cookieBanner = document.getElementById('cookie-consent-banner');
    const acceptCookiesButton = document.getElementById('accept-cookies-button');

    // Verifica no armazenamento local se o consentimento já foi dado
    if (!localStorage.getItem('cookie_consent')) {
        // Se não foi dado, mostra o banner com a animação
        cookieBanner.classList.add('visible');
    }

    // Adiciona o evento de clique ao botão de aceitar
    if (acceptCookiesButton) {
        acceptCookiesButton.addEventListener('click', () => {
            // Salva a informação de que o usuário consentiu
            localStorage.setItem('cookie_consent', 'true');
            
            // Esconde o banner com a animação
            cookieBanner.classList.remove('visible');
        });
    }

    /**
     * MÓDULO 1: SELETOR DE TEMA (CLARO/ESCURO) COM MEMÓRIA
     */
    const themeToggle = document.getElementById('theme-toggle');
    const applyTheme = (theme) => {
        if (theme === 'dark') { document.body.classList.add('dark-mode'); if (themeToggle) themeToggle.checked = false; } 
        else { document.body.classList.remove('dark-mode'); if (themeToggle) themeToggle.checked = true; }
    };
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    if (themeToggle) {
        themeToggle.addEventListener('change', (e) => {
            const newTheme = e.target.checked ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });
    }

    /**
     * MÓDULO 2: Barra de Navegação (Navbar)
     */
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    /**
     * MÓDULO 3: MÁSCARA DE CPF AUTOMÁTICA
     * Formata o campo de CPF no padrão ###.###.###-## enquanto o usuário digita.
     */
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', (e) => {
            // Pega o valor atual do campo
            let value = e.target.value;

            // 1. Remove tudo que não for um número.
            // Isso garante que se o usuário colar "123.abc.456", apenas os números fiquem.
            value = value.replace(/\D/g, '');

            // 2. Limita o valor a 11 dígitos (o tamanho de um CPF).
            value = value.substring(0, 11);

            // 3. Aplica as pontuações usando expressões regulares, passo a passo.
            // Adiciona o primeiro ponto depois do 3º dígito
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            // Adiciona o segundo ponto depois do 6º dígito
            value = value.replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
            // Adiciona o traço depois do 9º dígito
            value = value.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})/, '$1.$2.$3-$4');

            // 4. Devolve o valor já formatado para o campo.
            e.target.value = value;
        });
    }

    /**
     * MÓDULO 4: Contador Animado e Círculo de Progresso
     */
    const signatureCountElement = document.getElementById('signature-count');
    const progressRing = document.getElementById('progress-ring-circle');
    const radius = progressRing ? progressRing.r.baseVal.value : 0;
    const circumference = radius * 2 * Math.PI;
    const GOAL = 1000;
    if(progressRing) { progressRing.style.strokeDasharray = `${circumference} ${circumference}`; progressRing.style.strokeDashoffset = circumference; }
    function setProgress(percent) { if(progressRing) { const offset = circumference - (percent / 100) * circumference; progressRing.style.strokeDashoffset = offset; } }
    function animateCountUp(element, finalCount) { let currentCount = 0; const increment = Math.ceil(finalCount / 100) || 1; const interval = setInterval(() => { currentCount += increment; if (currentCount >= finalCount) { currentCount = finalCount; clearInterval(interval); } element.textContent = currentCount; }, 20); }

    /**
     * MÓDULO 5: Lógica do Formulário (Supabase) e Modal
     */
    const petitionForm = document.getElementById('petition-form');
    const modal = document.getElementById('confirmation-modal');
    const closeModalButton = document.getElementById('close-modal');
    const API_URL_GET_COUNT = '/api/getSignatureCount';
    const API_URL_SUBMIT = '/api/addSignature';
    const loadSignatureCount = async () => { try { const response = await fetch(API_URL_GET_COUNT); if (!response.ok) throw new Error('Erro de rede'); const data = await response.json(); animateCountUp(signatureCountElement, data.count); setProgress((data.count / GOAL) * 100); } catch (error) { console.error('Erro ao carregar contador:', error); signatureCountElement.textContent = '0'; setProgress(0); } };
    loadSignatureCount();
    if (petitionForm) {
        petitionForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const submitButton = document.getElementById('submit-button');
            submitButton.disabled = true; submitButton.textContent = 'ENVIANDO...';
            const formData = new FormData(petitionForm); const data = Object.fromEntries(formData.entries());
            try {
                const response = await fetch(API_URL_SUBMIT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), });
                const result = await response.json(); if (!response.ok) throw new Error(result.message);
                modal.classList.add('visible');
                loadSignatureCount();
                petitionForm.reset();
            } catch (error) {
                alert(`Erro: ${error.message}`);
            } finally {
                submitButton.disabled = false; submitButton.textContent = 'CONFIRMAR E FAZER PARTE';
            }
        });
    }
    if (closeModalButton) { closeModalButton.addEventListener('click', () => modal.classList.remove('visible')); }

    const telefoneInput = document.getElementById('telefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            value = value.substring(0, 11);

            if (value.length > 2) {
                value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
            }

            if (value.length > 9) {
                // Inteligência para celular (9 dígitos) vs fixo (8 dígitos)
                if(value.length > 10) { // Celular: (XX) 9XXXX-XXXX
                    value = value.replace(/(\)\s\d{5})(\d{4})/, '$1-$2');
                } else { // Fixo: (XX) XXXX-XXXX
                    value = value.replace(/(\)\s\d{4})(\d{4})/, '$1-$2');
                }
            }
            
            e.target.value = value;
        });
    }

    /**
     * MÓDULO 6: EFEITO 3D INTERATIVO NOS CARDS
     * Aplica um efeito de inclinação parallax nos cards da seção "O Problema".
     */
    const cards = document.querySelectorAll('.problem-card');

    cards.forEach(card => {
        const maxRotation = 12; // O ângulo máximo de inclinação em graus

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // Posição X do mouse dentro do card
            const y = e.clientY - rect.top;  // Posição Y do mouse dentro do card

            const { width, height } = rect;
            const middleX = width / 2;
            const middleY = height / 2;

            // Calcula a rotação baseada na distância do mouse ao centro
            const rotateX = ((y - middleY) / middleY) * -maxRotation; // Rotação no eixo X
            const rotateY = ((x - middleX) / middleX) * maxRotation;   // Rotação no eixo Y

            // Aplica a transformação 3D e uma leve escala para o efeito "pop-up"
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        });

        // Reseta o card para a posição original quando o mouse sai
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
        });
    });

}); // <-- ESTA É A ÚLTIMA LINHA DO SEU ARQUIVO. ADICIONE O CÓDIGO ACIMA DELA.