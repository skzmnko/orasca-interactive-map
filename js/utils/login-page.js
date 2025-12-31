import AuthService from '../services/auth-service.js';

class LoginPage {
    constructor() {
        this.container = null;
        this.onLoginSuccess = null;
    }

    initialize(onLoginSuccess) {
        this.onLoginSuccess = onLoginSuccess;
        this.render();
        this.bindEvents();
    }

    render() {
        this.container = document.createElement('div');
        this.container.id = 'login-page';
        this.container.className = 'login-page';
        
        this.container.innerHTML = `
            <div class="login-container">
                <div class="login-header">
                    <h1>Fading World</h1>
                    <p>Интерактивная карта кампании</p>
                </div>
                
                <form id="login-form" class="login-form">
                    <div class="form-group">
                        <label for="username">Имя пользователя</label>
                        <input 
                            type="text" 
                            id="username" 
                            name="username" 
                            required 
                            autocomplete="username"
                            placeholder="Введите ваше имя пользователя"
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="password">Пароль</label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            required 
                            autocomplete="current-password"
                            placeholder="Введите ваш пароль"
                        >
                    </div>
                    
                    <button type="submit" class="login-btn" id="login-submit">
                        <span class="btn-text">Войти в мир</span>
                    </button>
                </form>
                
                <!-- ИЗМЕНЕНО: убираем текст ошибки по умолчанию и добавляем hidden -->
                <div id="login-error" class="error-message hidden"></div>
                
                <div class="login-footer">
                    <p>Выберите своего персонажа для входа</p>
                </div>
            </div>
        `;

        document.body.appendChild(this.container);
        
        setTimeout(() => {
            const usernameInput = document.getElementById('username');
            if (usernameInput) usernameInput.focus();
        }, 100);
    }

    bindEvents() {
        const loginForm = document.getElementById('login-form');
        const errorElement = document.getElementById('login-error');

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        const inputs = loginForm.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                // ИЗМЕНЕНО: скрываем ошибку при вводе текста
                this.hideError();
            });
        });

        this.setupTestCredentials();
    }

    async handleLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const errorElement = document.getElementById('login-error');
        const loginBtn = document.getElementById('login-submit');
        const btnText = loginBtn.querySelector('.btn-text');

        // ИЗМЕНЕНО: всегда скрываем ошибку перед проверкой
        this.hideError();

        loginBtn.classList.add('loading');
        btnText.textContent = 'Вход...';
        loginBtn.disabled = true;

        await new Promise(resolve => setTimeout(resolve, 800));

        const result = AuthService.login(username, password);

        loginBtn.classList.remove('loading');
        btnText.textContent = 'Войти в мир';
        loginBtn.disabled = false;

        if (result.success) {
            console.log(`🎉 Добро пожаловать, ${result.user.displayName}!`);
            this.showSuccessAnimation();
            
            setTimeout(() => {
                this.hide();
                if (this.onLoginSuccess) {
                    this.onLoginSuccess();
                }
            }, 600);
        } else {
            // ИЗМЕНЕНО: показываем ошибку только при неудачном входе
            this.showError(result.error);
            this.shakeForm();
        }
    }

    // ИЗМЕНЕНО: добавляем метод для показа ошибки
    showError(message) {
        const errorElement = document.getElementById('login-error');
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }

    // ИЗМЕНЕНО: добавляем метод для скрытия ошибки
    hideError() {
        const errorElement = document.getElementById('login-error');
        errorElement.textContent = '';
        errorElement.classList.add('hidden');
    }

    showSuccessAnimation() {
        const loginContainer = document.querySelector('.login-container');
        loginContainer.style.animation = 'none';
        setTimeout(() => {
            loginContainer.style.animation = 'slideUp 0.6s ease-out, successGlow 1s ease-in-out';
        }, 10);
    }

    shakeForm() {
        const loginForm = document.getElementById('login-form');
        loginForm.style.animation = 'none';
        setTimeout(() => {
            loginForm.style.animation = 'shake 0.5s ease-in-out';
        }, 10);
    }

    setupTestCredentials() {
        console.log('👥 Тестовые пользователи:');
        console.log('DM: dungeonmaster / dm_access_2024');
        console.log('Игрок: benevir / player_bene_2024');
    }

    show() {
        if (this.container) {
            this.container.classList.remove('hidden');
        }
    }

    hide() {
        if (this.container) {
            this.container.classList.add('hidden');
        }
    }

    destroy() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

export default LoginPage;