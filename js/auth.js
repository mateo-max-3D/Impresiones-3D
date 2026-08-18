/**
 * PROTOTYP 3D - Authentication Module
 * Manages authorized users Mateo and Martina (Both are Administrador)
 */

const AUTH_STORAGE_KEY = 'prototyp3d_auth_user_v2';

const AUTHORIZED_USERS = [
    {
        username: 'Mateo',
        email: 'mateo@prototyp3d.com',
        password: 'Prototype3D',
        role: 'ADMINISTRADOR',
        avatar: 'M',
        coordinates: 'X: 14.20 Y: 88.02 Z: 1.00'
    },
    {
        username: 'Martina',
        email: 'martina@prototyp3d.com',
        password: 'Prototype3D',
        role: 'ADMINISTRADOR',
        avatar: 'M',
        coordinates: 'X: 09.55 Y: 33.19 Z: 1.00'
    }
];

class AuthService {
    constructor() {
        this.currentUser = this.loadUserSession();
    }

    loadUserSession() {
        try {
            const saved = localStorage.getItem(AUTH_STORAGE_KEY);
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    }

    login(identifier, password) {
        if (!identifier || !password) {
            return { success: false, message: 'Por favor complete todos los campos de acceso.' };
        }

        const cleanId = identifier.trim().toLowerCase();
        const user = AUTHORIZED_USERS.find(u => 
            (u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId) &&
            u.password === password
        );

        if (user) {
            this.currentUser = {
                username: user.username,
                email: user.email,
                role: 'ADMINISTRADOR',
                avatar: user.avatar,
                coordinates: user.coordinates,
                loginTime: new Date().toLocaleTimeString()
            };
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
            return { success: true, user: this.currentUser };
        }

        return { 
            success: false, 
            message: 'Credenciales inválidas. Verifique usuario/correo y contraseña.' 
        };
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem(AUTH_STORAGE_KEY);
    }

    isAuthenticated() {
        return !!this.currentUser;
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

window.authService = new AuthService();
