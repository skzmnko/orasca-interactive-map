class AuthService {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.users = this.loadUsers();
    }

    loadUsers() {
        return [
            { 
                username: 'dungeonmaster', 
                password: 'dm_access_2024', 
                role: 'DM',
                displayName: 'Dungeon Master'
            },
            { 
                username: 'orasca', 
                password: 'orasca_2026', 
                role: 'player',
                displayName: 'Наблюдатель'
            }
        ];
    }

    login(username, password) {
        const user = this.users.find(u => 
            u.username === username && u.password === password
        );

        if (user) {
            this.currentUser = { ...user };
            this.isAuthenticated = true;
            
            sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            sessionStorage.setItem('isAuthenticated', 'true');
            
            console.log(`✅ Successful login: ${user.displayName} (${user.role})`);
            return { success: true, user: this.currentUser };
        } else {
            console.warn('❌ Invalid credentials');
            return { success: false, error: 'Неверное имя пользователя или пароль' };
        }
    }

    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('isAuthenticated');
        console.log('🚪 The user logged out');
    }

    checkAuthStatus() {
        const storedUser = sessionStorage.getItem('currentUser');
        const storedAuth = sessionStorage.getItem('isAuthenticated');
        
        if (storedUser && storedAuth === 'true') {
            this.currentUser = JSON.parse(storedUser);
            this.isAuthenticated = true;
            console.log(`🔐 Automatic login: ${this.currentUser.displayName}`);
            return true;
        }
        return false;
    }

    hasRole(role) {
        return this.isAuthenticated && this.currentUser.role === role;
    }

    isDM() {
        return this.hasRole('DM');
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getIsAuthenticated() {
        return this.isAuthenticated;
    }
}

export default new AuthService();