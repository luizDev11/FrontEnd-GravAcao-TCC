document.addEventListener('DOMContentLoaded', function() {
    // Elementos do modal de termos
    const termsOverlay = document.getElementById('termsOverlay');
    const acceptTermsBtn = document.getElementById('acceptTerms');
    const agreeTermsCheckbox = document.getElementById('agreeTerms');
    
    // Mostrar o modal quando a página carrega (se termos não foram aceitos)
    if(localStorage.getItem('termsAccepted') !== 'true') {
        setTimeout(() => {
            termsOverlay.classList.add('active');
        }, 500);
    } else {
        agreeTermsCheckbox.checked = true;
    }
    
    // Aceitar termos
    acceptTermsBtn.addEventListener('click', function() {
        termsOverlay.classList.remove('active');
        agreeTermsCheckbox.checked = true;
        localStorage.setItem('termsAccepted', 'true');
    });
    
    // Recusar termos
    document.querySelector('.terms-decline')?.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Para se cadastrar em nosso serviço, você precisa aceitar os Termos e Políticas.');
    });

    // Máscara para CPF
    document.getElementById('cpf').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 3) value = value.replace(/^(\d{3})(\d)/g, '$1.$2');
        if (value.length > 6) value = value.replace(/^(\d{3})\.(\d{3})(\d)/g, '$1.$2.$3');
        if (value.length > 9) value = value.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/g, '$1.$2.$3-$4');
        if (value.length > 11) value = value.substring(0, 14);
        
        e.target.value = value;
    });

    // Máscara para telefone
    document.getElementById('phone').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 0) value = '(' + value;
        if (value.length > 3) value = value.substring(0, 3) + ') ' + value.substring(3);
        if (value.length > 10) value = value.substring(0, 10) + '-' + value.substring(10);
        if (value.length > 15) value = value.substring(0, 15);
        
        e.target.value = value;
    });

    // Validação do formulário com melhor feedback visual
    document.getElementById('registerForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Elementos do formulário
        const form = e.target;
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const cpf = document.getElementById('cpf').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;
        
        // Reset de erros
        document.querySelectorAll('.input-group').forEach(group => {
            group.classList.remove('error');
        });
        
        // Validações
        let isValid = true;
        
        if (!name) {
            showError('name', 'Por favor, informe seu nome completo');
            isValid = false;
        }
        
        if (!email || !validateEmail(email)) {
            showError('email', 'Por favor, informe um e-mail válido');
            isValid = false;
        }
        
        if (!cpf || cpf.length < 14) {
            showError('cpf', 'CPF inválido');
            isValid = false;
        }
        
        if (!phone || phone.length < 14) {
            showError('phone', 'Telefone inválido');
            isValid = false;
        }
        
        if (!password || password.length < 6) {
            showError('password', 'A senha deve ter pelo menos 6 caracteres');
            isValid = false;
        }
        
        if (password !== confirmPassword) {
            showError('confirmPassword', 'As senhas não coincidem');
            isValid = false;
        }
        
        if (!agreeTerms) {
            termsOverlay.classList.add('active');
            alert('Você precisa aceitar os Termos e Política de Privacidade');
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Botão de loading
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="spinner"></div> Enviando...';
        
        try {
            const response = await fetch('/register/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name, 
                    email, 
                    cpf: cpf.replace(/\D/g, ''), 
                    phone: phone.replace(/\D/g, ''), 
                    password 
                })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                alert('Cadastro realizado com sucesso!');
                window.location.href = '/login';
            } else {
                // Tratamento de erros específicos do servidor
                if (result.error === 'Email already exists') {
                    showError('email', 'Este e-mail já está cadastrado');
                } else if (result.error === 'CPF already exists') {
                    showError('cpf', 'Este CPF já está cadastrado');
                } else {
                    alert(result.message || 'Erro no cadastro. Tente novamente.');
                }
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro de conexão. Tente novamente mais tarde.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });
    
    // Função auxiliar para mostrar erros
    function showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const inputGroup = field.closest('.input-group');
        
        inputGroup.classList.add('error');
        
        let errorElement = inputGroup.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            inputGroup.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
    }
    
    // Validação de e-mail
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
});