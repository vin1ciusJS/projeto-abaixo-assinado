document.addEventListener('DOMContentLoaded', () => {
    
    // --- PONTOS DE CONEXÃO COM O HTML ---
    const signatureCountElement = document.getElementById('signature-count');
    const progressBarElement = document.getElementById('progress');
    const petitionForm = document.getElementById('petition-form');
    const formMessageElement = document.getElementById('form-message');
    const submitButton = document.getElementById('submit-button');
    const goal = 5000;

    // --- URLs DO SEU BACKEND (AGORA MUITO MAIS SIMPLES!) ---
    // O Vercel automaticamente cria esses links a partir da pasta /api
    const API_URL_GET_COUNT = '/api/getSignatureCount';
    const API_URL_SUBMIT = '/api/addSignature';

    // --- FUNÇÕES (EXATAMENTE AS MESMAS DE ANTES) ---

    function updateCounter(count) {
        signatureCountElement.textContent = count;
        const percentage = Math.min((count / goal) * 100, 100);
        progressBarElement.style.width = `${percentage}%`;
    }

    async function loadSignatureCount() {
        try {
            const response = await fetch(API_URL_GET_COUNT);
            if (!response.ok) throw new Error('Erro de rede ao buscar contagem.');
            
            const data = await response.json();
            updateCounter(data.count);
        } catch (error) {
            console.error('Erro ao carregar o contador:', error);
            signatureCountElement.textContent = '0';
        }
    }

    petitionForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        submitButton.disabled = true;
        submitButton.textContent = 'ENVIANDO...';
        formMessageElement.textContent = '';
        formMessageElement.style.color = 'inherit';

        const formData = new FormData(petitionForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(API_URL_SUBMIT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                petitionForm.reset();
                formMessageElement.textContent = 'Obrigado! Sua assinatura foi registrada com sucesso!';
                formMessageElement.style.color = 'var(--success-color)';
                updateCounter(result.newCount);
            } else {
                throw new Error(result.message || 'Ocorreu um erro desconhecido.');
            }

        } catch (error) {
            formMessageElement.textContent = `Erro: ${error.message}`;
            formMessageElement.style.color = 'var(--error-color)';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'ASSINAR AGORA';
        }
    });
    
    loadSignatureCount();
});