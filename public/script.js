document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('signupForm').addEventListener('submit', function(event) {
        event.preventDefault();  // Evita que o formulário seja enviado imediatamente

        // Obtendo os valores dos campos
        var username = document.getElementById('usernameRegister').value;
        var password = document.getElementById('passwordRegister').value;
        var confirmPassword = document.getElementById('confirm_password').value;

        // Referenciando as mensagens de sucesso e erro
        const messageSuccess = document.getElementById('successRegister');
        const messageError = document.getElementById('errorRegister');

        // Limpando mensagens anteriores
        messageError.textContent = '';
        messageSuccess.textContent = '';

        // Verificando se as senhas coincidem
        if (password !== confirmPassword) {
            console.log('As senhas não coincidem.');
            messageError.textContent = 'As senhas não coincidem.';
            return;  // Sai da função, não permitindo que o fetch seja executado
        }

        // Enviando a requisição ao servidor
        fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username, password: password })
        })
        .then(response => {
            return response.json().then(data => {
                if (!response.ok) {
                    throw new Error(data.error || 'Erro ao registrar usuário.');
                }
                return data;
            });
        })
        .then(data => {
            console.log(data);  // Logando a resposta do servidor
            messageSuccess.textContent = data.message;
        })
        .catch(error => {
            console.error('Erro ao registrar:', error);
            messageError.textContent = 'Erro ao registrar usuário: ' + error.message;
        });
    });
});




document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    const messageSuccess = document.getElementById('success');
    const messageError = document.getElementById('error');

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username, password: password })
    })
    .then(response => {
        return response.json().then(data => {
            if (!response.ok) {
                throw new Error(data.error || 'Erro ao logar.');
            }
            return data;
        });
    })
    .then(data => {
        console.log(data);  // Logando a resposta do servidor
        messageSuccess.textContent = data.message;
        messageError.textContent = '';
    })
    .catch(error => {
        console.error('Erro ao logar:', error);
        messageError.textContent = 'Erro ao logar: ' + error.message;
        messageSuccess.textContent = '';
    });
});


//Animaçes de login e registro.
const signInBtnLink = document.querySelector('.signInBtnLink');
const signUpBtnLink = document.querySelector('.signUpBtnLink');
const wrapper = document.querySelector('.wrapper');

signUpBtnLink.addEventListener('click', () => {
    wrapper.classList.toggle('active');
});

signInBtnLink.addEventListener('click', () => {
    wrapper.classList.toggle('active');
});

particlesJS.load('particles-js', 'particles.json', function() {
    console.log('callback - particles.js config loaded');
  });

