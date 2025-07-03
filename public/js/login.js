// Validação simples do formulário
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Validação básica
    if (!email || !password) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    // Aqui você pode adicionar a lógica de autenticação
    console.log('Email:', email);
    console.log('Password:', password);

    // Simulando um login bem-sucedido
    alert('Login realizado com sucesso! (simulação)');
    window.location.href = '/../../views/inicial.html';

    // Redirecionamento (substitua pela sua URL)
    // window.location.href = 'dashboard.html';
});