document.addEventListener('DOMContentLoaded', () => {
    // Verificar se já está logado
    if (localStorage.getItem('authToken')) {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const redirectUrl = userInfo?.roles?.includes('ROLE_ADMIN') 
            ? '/views/inicialAdmin.html' 
            : '/views/inicial.html';
        window.location.href = redirectUrl;
        return;
    }

    // Configurar máscaras
    $('#cpf').mask('000.000.000-00');
    $('#cnpj').mask('00.000.000/0000-00');
    $('#phone').mask('(00) 00000-0000');

    // Toggle PF/PJ
    document.querySelectorAll('.toggle-option').forEach(button => {
        button.addEventListener('click', function() {
            const logo = document.querySelector('.logo img');
            const isPJ = this.dataset.value === 'pj';
            
            document.querySelectorAll('.toggle-option').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            document.getElementById('userType').value = this.dataset.value;

            // Alternar entre CPF e CNPJ
            document.getElementById('cpfGroup').style.display = isPJ ? 'none' : 'block';
            document.getElementById('cnpjGroup').style.display = isPJ ? 'block' : 'none';
            document.getElementById('cpf').required = !isPJ;
            document.getElementById('cnpj').required = isPJ;
            
            // Mudar tema e logo
            document.body.classList.toggle('theme-orange', isPJ);
            logo.src = isPJ ? '../public/images/logoAdmin.png' : '../public/images/logo.png';
        });
    });

    // Formulário de registro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

async function handleRegister(event) {
    event.preventDefault();

    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Cadastrando...';

    try {
        const formData = getFormData();
        const errors = validateForm(formData);

        if (errors.length > 0) {
            showError(errors.join('<br>'));
            return;
        }

        const response = await makeApiRequest(formData);
        await handleResponse(response, formData.tipo === 'pj');

    } catch (error) {
        showError(error.message || 'Erro ao processar cadastro');
        console.error('Erro no registro:', error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Cadastrar';
    }
}

function getFormData() {
    const userType = document.getElementById('userType').value;
    const isPJ = userType === 'pj';

    const data = {
        nome: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        telefone: document.getElementById('phone').value.replace(/\D/g, ''),
        senha: document.getElementById('password').value,
        confirmarSenha: document.getElementById('confirmPassword').value, // Alterado para confirmarSenha
        agreeTerms: document.getElementById('agreeTerms').checked, // Alterado para agreeTerms
        tipo: userType
    };

    // Adiciona documento conforme o tipo
    if (isPJ) {
        data.cnpj = document.getElementById('cnpj').value.replace(/\D/g, '');
    } else {
        data.cpf = document.getElementById('cpf').value.replace(/\D/g, '');
    }

    return data;
}

function validateForm(formData) {
    const errors = [];
    const { nome, email, cpf, cnpj, telefone, senha, confirmarSenha, agreeTerms, tipo } = formData; // Campos atualizados
    const isPJ = tipo === 'pj';

    // Validações básicas
    if (!nome || nome.length < 3) errors.push('• Nome deve ter pelo menos 3 caracteres');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('• Email inválido');
    if (!telefone || telefone.length < 11) errors.push('• Telefone inválido');
    if (!senha || senha.length < 6) errors.push('• Senha deve ter pelo menos 6 caracteres');
    if (senha !== confirmarSenha) errors.push('• As senhas não coincidem'); // Campo atualizado
    if (!agreeTerms) errors.push('• Você deve aceitar os termos de serviço'); // Campo atualizado

    // Validação de documentos
    if (isPJ) {
        if (!cnpj || cnpj.length !== 14) errors.push('• CNPJ inválido');
    } else {
        if (!cpf || cpf.length !== 11) errors.push('• CPF inválido');
    }

    return errors;
}

async function makeApiRequest(formData) {
    const response = await fetch('http://localhost:8080/api/usuarios/registrar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao cadastrar');
    }

    return response;
}

async function handleResponse(response, isEmpresa) {
    const data = await response.json();

    showSuccess('Cadastro realizado com sucesso! Redirecionando...');

    if (isEmpresa) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userInfo', JSON.stringify({
            id: data.id,
            email: data.email,
            nome: data.nome,
            roles: ['ROLE_ADMIN']
        }));
        setTimeout(() => window.location.href = '/views/inicialAdmin.html', 2000);
    } else {
        setTimeout(() => window.location.href = 'login.html', 2000);
    }
}

// Funções de exibição de mensagens
function showError(message) {
    const errorDiv = document.getElementById('error-message') || createMessageDiv('error');
    errorDiv.innerHTML = message;
    errorDiv.style.display = 'block';
    setTimeout(() => errorDiv.style.display = 'none', 5000);
}

function showSuccess(message) {
    const successDiv = document.getElementById('success-message') || createMessageDiv('success');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    setTimeout(() => successDiv.style.display = 'none', 3000);
}

function createMessageDiv(type) {
    const div = document.createElement('div');
    div.id = `${type}-message`;
    div.className = `${type}-message`;
    div.style.display = 'none';
    document.getElementById('registerForm')?.parentNode?.insertBefore(div, document.getElementById('registerForm'));
    return div;
}