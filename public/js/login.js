document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    // 1. Obtenção dos valores do formulário
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // 2. Validação básica dos campos
    if (!email || !password) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    try {
        // 3. Requisição de autenticação
        const response = await fetch('http://localhost:8080/api/auth/authenticate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                email: email, 
                senha: password 
            }),
            credentials: 'include' // Importante para cookies/sessão
        });

        // 4. Tratamento da resposta
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro na autenticação');
        }

        // 5. Processamento do token
        const { token } = await response.json();
        
        // Armazenamento seguro do token
        localStorage.setItem('jwtToken', token);
        // sessionStorage.setItem('jwtToken', token);
        
        // Decodificação do payload JWT
        const payload = decodeJwtPayload(token);
        
        // 6. Redirecionamento baseado no perfil
        setTimeout(() => {
            const isProfessional = payload.roles?.includes('ROLE_PROFISSIONAL');
            window.location.href = isProfessional 
                ? '/views/inicialAdmin.html' 
                : '/views/inicial.html';
        }, 100);

    } catch (error) {
        // 7. Tratamento de erros
        console.error('Erro durante o login:', error);
        alert(error.message || 'Erro ao realizar login');
        
        // Limpeza de tokens inválidos
        localStorage.removeItem('jwtToken');
        sessionStorage.removeItem('jwtToken');
    }
});

// Função auxiliar melhorada para decodificação JWT
function decodeJwtPayload(token) {
    try {
        if (!token || typeof token !== 'string') {
            throw new Error('Token inválido');
        }
        
        const payloadBase64 = token.split('.')[1];
        if (!payloadBase64) {
            throw new Error('Estrutura do token inválida');
        }
        
        // Decodificação segura com tratamento de Unicode
        const payloadJson = decodeURIComponent(
            atob(payloadBase64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        
        return JSON.parse(payloadJson);
    } catch (error) {
        console.error('Erro ao decodificar token:', error);
        return {};
    }
}