// Application State
const appState = {
    isLoggedIn: false,
    currentUser: null,
    currentTab: 'grafana',
    settings: {
        darkMode: false,
        emailNotifications: true,
        incidentNotifications: true,
        systemNotifications: false,
        securityNotifications: true
    }
};

// DOM Elements
const elements = {
    // Auth Elements
    authScreen: document.getElementById('authScreen'),
    loginContainer: document.getElementById('loginContainer'),
    registerContainer: document.getElementById('registerContainer'),
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    loginError: document.getElementById('loginError'),
    registerError: document.getElementById('registerError'),
    registerSuccess: document.getElementById('registerSuccess'),
    showRegister: document.getElementById('showRegister'),
    showLogin: document.getElementById('showLogin'),
    
    // Dashboard Elements
    dashboard: document.getElementById('dashboard'),
    userMenuBtn: document.getElementById('userMenuBtn'),
    userDropdown: document.getElementById('userDropdown'),
    currentUser: document.getElementById('currentUser'),
    topNavAvatar: document.getElementById('topNavAvatar'),
    topNavAvatarPlaceholder: document.getElementById('topNavAvatarPlaceholder'),
    logoutBtn: document.getElementById('logoutBtn'),
    userSettings: document.getElementById('userSettings'),
    userProfile: document.getElementById('userProfile'),
    
    // Navigation
    navButtons: document.querySelectorAll('.nav-button'),
    tabContents: document.querySelectorAll('.tab-content'),
    grafanaFrame: document.getElementById('grafanaFrame'),
    grafanaLoading: document.getElementById('grafanaLoading'),
    
    // Profile Elements
    profileForm: document.getElementById('profileForm'),
    profileAvatar: document.getElementById('profileAvatar'),
    avatarPlaceholder: document.getElementById('avatarPlaceholder'),
    profileImageInput: document.getElementById('profileImageInput'),
    removeProfileImage: document.getElementById('removeProfileImage'),
    profileUsername: document.getElementById('profileUsername'),
    profileEmail: document.getElementById('profileEmail'),
    profilePhone: document.getElementById('profilePhone'),
    profileSuccess: document.getElementById('profileSuccess'),
    profileError: document.getElementById('profileError'),
    cancelProfileChanges: document.getElementById('cancelProfileChanges'),
    
    // Settings Elements
    settingsModal: document.getElementById('settingsModal'),
    closeSettings: document.getElementById('closeSettings'),
    darkModeToggle: document.getElementById('darkModeToggle'),
    emailNotifications: document.getElementById('emailNotifications'),
    incidentNotifications: document.getElementById('incidentNotifications'),
    systemNotifications: document.getElementById('systemNotifications'),
    securityNotifications: document.getElementById('securityNotifications'),
    saveSettings: document.getElementById('saveSettings'),
    resetSettings: document.getElementById('resetSettings'),
    settingsSuccess: document.getElementById('settingsSuccess'),
    settingsError: document.getElementById('settingsError')
};

// API Configuration
const API_BASE_URL = '/api';

// Authentication Functions
async function login(username, password) {
    try {
        // Simulate API call to backend
        const response = await simulateApiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });

        if (response.success) {
            appState.isLoggedIn = true;
            appState.currentUser = response.user;
            showDashboard();
            return { success: true };
        } else {
            return { success: false, error: response.error };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Verbindungsfehler' };
    }
}

async function logout() {
    try {
        // Simulate API call
        await simulateApiCall('/auth/logout', { method: 'POST' });
        
        appState.isLoggedIn = false;
        appState.currentUser = null;
        showAuthScreen();
    } catch (error) {
        console.error('Logout error:', error);
        // Still logout locally even if API call fails
        appState.isLoggedIn = false;
        appState.currentUser = null;
        showAuthScreen();
    }
}

// Mock Database
const mockUsers = [
    {
        id: 1,
        username: 'admin',
        email: 'admin@sims-ac.local',
        password: 'admin',
        name: 'Administrator',
        role: 'admin',
        phone: '+43 123 456 789',
        profileImage: null
    },
    {
        id: 2,
        username: 'user',
        email: 'user@sims-ac.local',
        password: 'user',
        name: 'Benutzer',
        role: 'user',
        phone: null,
        profileImage: null
    }
];

// Simulate API calls (replace with real API calls later)
async function simulateApiCall(endpoint, options = {}) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate different responses based on endpoint
            if (endpoint === '/auth/login') {
                const body = JSON.parse(options.body);
                const user = mockUsers.find(u => 
                    u.username === body.username && u.password === body.password
                );
                
                if (user) {
                    const { password, ...userWithoutPassword } = user;
                    resolve({
                        success: true,
                        user: userWithoutPassword
                    });
                } else {
                    resolve({
                        success: false,
                        error: 'Ungültige Anmeldedaten'
                    });
                }
            } else if (endpoint === '/auth/register') {
                const body = JSON.parse(options.body);
                
                // Check if username or email already exists
                const existingUser = mockUsers.find(u => 
                    u.username === body.username || u.email === body.email
                );
                
                if (existingUser) {
                    resolve({
                        success: false,
                        error: 'Benutzername oder E-Mail bereits vergeben'
                    });
                } else {
                    const newUser = {
                        id: mockUsers.length + 1,
                        username: body.username,
                        email: body.email,
                        password: body.password,
                        name: body.username,
                        role: 'user',
                        phone: body.phone || null,
                        profileImage: body.profileImage || null
                    };
                    mockUsers.push(newUser);
                    resolve({ success: true });
                }
            } else if (endpoint === '/user/profile') {
                if (options.method === 'PUT') {
                    const body = JSON.parse(options.body);
                    const userIndex = mockUsers.findIndex(u => u.id === appState.currentUser.id);
                    
                    if (userIndex !== -1) {
                        // Update user
                        mockUsers[userIndex] = { ...mockUsers[userIndex], ...body };
                        const { password, ...userWithoutPassword } = mockUsers[userIndex];
                        appState.currentUser = userWithoutPassword;
                        resolve({ success: true, user: userWithoutPassword });
                    } else {
                        resolve({ success: false, error: 'Benutzer nicht gefunden' });
                    }
                } else {
                    resolve({ success: true });
                }
            } else {
                resolve({ success: true });
            }
        }, 500); // Simulate network delay
    });
}

// Registration Functions
async function register(userData) {
    try {
        const response = await simulateApiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        return response;
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: 'Verbindungsfehler' };
    }
}

// UI Functions
function showAuthScreen() {
    elements.authScreen.style.display = 'flex';
    elements.dashboard.style.display = 'none';
    showLoginForm();
    
    // Add fade-in animation
    elements.authScreen.classList.add('fade-in');
}

function showLoginForm() {
    elements.loginContainer.style.display = 'block';
    elements.registerContainer.style.display = 'none';
    elements.loginError.style.display = 'none';
    elements.loginForm.reset();
}

function showRegisterForm() {
    elements.loginContainer.style.display = 'none';
    elements.registerContainer.style.display = 'block';
    elements.registerError.style.display = 'none';
    elements.registerSuccess.style.display = 'none';
    elements.registerForm.reset();
    clearImagePreview('reg');
}

function showDashboard() {
    elements.authScreen.style.display = 'none';
    elements.dashboard.style.display = 'flex';
    
    // Update user info
    elements.currentUser.textContent = appState.currentUser.name || appState.currentUser.username;
    
    // Update top navigation avatar
    updateTopNavAvatar();
    
    // Load user profile data
    loadUserProfile();
    
    // Apply user settings
    applySettings();
    
    // Show default tab (Grafana)
    switchTab('grafana');
    
    // Add fade-in animation
    elements.dashboard.classList.add('fade-in');
}

function switchTab(tabName) {
    // Update navigation buttons
    elements.navButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });

    // Update tab contents
    elements.tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === tabName + '-tab') {
            content.classList.add('active');
        }
    });

    // Special handling for Grafana tab
    if (tabName === 'grafana') {
        loadGrafana();
    }

    appState.currentTab = tabName;
}

// Top Navigation Avatar Functions
function updateTopNavAvatar() {
    if (!appState.currentUser) return;
    
    const user = appState.currentUser;
    
    if (user.profileImage) {
        elements.topNavAvatar.src = user.profileImage;
        elements.topNavAvatar.style.display = 'block';
        elements.topNavAvatarPlaceholder.style.display = 'none';
    } else {
        elements.topNavAvatar.style.display = 'none';
        elements.topNavAvatarPlaceholder.style.display = 'flex';
    }
}

// Profile Functions
function loadUserProfile() {
    if (!appState.currentUser) return;
    
    const user = appState.currentUser;
    
    // Set form values
    elements.profileUsername.value = user.username || '';
    elements.profileEmail.value = user.email || '';
    elements.profilePhone.value = user.phone || '';
    
    // Set avatar
    if (user.profileImage) {
        elements.profileAvatar.src = user.profileImage;
        elements.profileAvatar.style.display = 'block';
        elements.avatarPlaceholder.style.display = 'none';
    } else {
        elements.profileAvatar.style.display = 'none';
        elements.avatarPlaceholder.style.display = 'flex';
    }
}

async function updateUserProfile(profileData) {
    try {
        const response = await simulateApiCall('/user/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });

        if (response.success) {
            // Update current user data
            appState.currentUser = response.user;
            elements.currentUser.textContent = response.user.name || response.user.username;
            updateTopNavAvatar();
            loadUserProfile();
        }

        return response;
    } catch (error) {
        console.error('Profile update error:', error);
        return { success: false, error: 'Verbindungsfehler' };
    }
}

// Image handling functions
function handleImageUpload(input, previewType) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            showImagePreview(e.target.result, previewType);
        };
        reader.readAsDataURL(file);
    }
}

function showImagePreview(imageSrc, type) {
    if (type === 'reg') {
        const preview = document.getElementById('regImagePreview');
        const img = document.getElementById('regPreviewImg');
        img.src = imageSrc;
        preview.style.display = 'block';
    } else if (type === 'profile') {
        elements.profileAvatar.src = imageSrc;
        elements.profileAvatar.style.display = 'block';
        elements.avatarPlaceholder.style.display = 'none';
        
        // Update top nav avatar immediately for preview
        elements.topNavAvatar.src = imageSrc;
        elements.topNavAvatar.style.display = 'block';
        elements.topNavAvatarPlaceholder.style.display = 'none';
    }
}

function clearImagePreview(type) {
    if (type === 'reg') {
        const preview = document.getElementById('regImagePreview');
        preview.style.display = 'none';
        document.getElementById('regProfileImage').value = '';
    } else if (type === 'profile') {
        elements.profileAvatar.style.display = 'none';
        elements.avatarPlaceholder.style.display = 'flex';
        elements.profileImageInput.value = '';
        
        // Update top nav avatar immediately
        elements.topNavAvatar.style.display = 'none';
        elements.topNavAvatarPlaceholder.style.display = 'flex';
    }
}

// Settings Functions
function loadSettings() {
    const savedSettings = localStorage.getItem('simsAcSettings');
    if (savedSettings) {
        try {
            appState.settings = { ...appState.settings, ...JSON.parse(savedSettings) };
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }
    
    // Update UI
    elements.darkModeToggle.checked = appState.settings.darkMode;
    elements.emailNotifications.checked = appState.settings.emailNotifications;
    elements.incidentNotifications.checked = appState.settings.incidentNotifications;
    elements.systemNotifications.checked = appState.settings.systemNotifications;
    elements.securityNotifications.checked = appState.settings.securityNotifications;
}

function saveSettings() {
    const settings = {
        darkMode: elements.darkModeToggle.checked,
        emailNotifications: elements.emailNotifications.checked,
        incidentNotifications: elements.incidentNotifications.checked,
        systemNotifications: elements.systemNotifications.checked,
        securityNotifications: elements.securityNotifications.checked
    };
    
    appState.settings = settings;
    localStorage.setItem('simsAcSettings', JSON.stringify(settings));
    applySettings();
    
    // Show success message
    elements.settingsSuccess.style.display = 'block';
    elements.settingsError.style.display = 'none';
    
    setTimeout(() => {
        elements.settingsSuccess.style.display = 'none';
    }, 3000);
}

function applySettings() {
    // Apply dark mode
    if (appState.settings.darkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

function resetSettings() {
    appState.settings = {
        darkMode: false,
        emailNotifications: true,
        incidentNotifications: true,
        systemNotifications: false,
        securityNotifications: true
    };
    
    loadSettings();
    applySettings();
    
    elements.settingsSuccess.style.display = 'block';
    elements.settingsSuccess.textContent = 'Einstellungen wurden zurückgesetzt!';
    
    setTimeout(() => {
        elements.settingsSuccess.style.display = 'none';
        elements.settingsSuccess.textContent = 'Einstellungen wurden erfolgreich gespeichert!';
    }, 3000);
}

function loadGrafana() {
    // Show loading overlay
    elements.grafanaLoading.style.display = 'flex';
    
    // Set up iframe load event
    elements.grafanaFrame.onload = function() {
        // Hide loading overlay after iframe loads
        setTimeout(() => {
            elements.grafanaLoading.style.display = 'none';
        }, 1000);
    };
    
    // If iframe src is not set or needs refresh
    if (!elements.grafanaFrame.src.includes('/grafana/')) {
        elements.grafanaFrame.src = '/grafana/';
    }
}

function toggleUserDropdown() {
    const isVisible = elements.userDropdown.style.display === 'block';
    elements.userDropdown.style.display = isVisible ? 'none' : 'block';
}

function showSettingsModal() {
    elements.settingsModal.style.display = 'flex';
    elements.userDropdown.style.display = 'none';
}

function hideSettingsModal() {
    elements.settingsModal.style.display = 'none';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Login form submission
    elements.loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        
        // Disable form during login
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Anmelden...';
        
        const result = await login(username, password);
        
        if (result.success) {
            elements.loginError.style.display = 'none';
        } else {
            elements.loginError.textContent = result.error;
            elements.loginError.style.display = 'block';
        }
        
        // Re-enable form
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Anmelden';
    });

    // Registration form submission
    elements.registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        
        // Validate password confirmation
        if (password !== confirmPassword) {
            elements.registerError.textContent = 'Passwörter stimmen nicht überein';
            elements.registerError.style.display = 'block';
            return;
        }

        // Get profile image if selected
        let profileImage = null;
        const imageFile = document.getElementById('regProfileImage').files[0];
        if (imageFile) {
            profileImage = await getBase64(imageFile);
        }

        const userData = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: password,
            phone: formData.get('phone'),
            profileImage: profileImage
        };
        
        // Disable form during registration
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrieren...';
        
        const result = await register(userData);
        
        if (result.success) {
            elements.registerError.style.display = 'none';
            elements.registerSuccess.style.display = 'block';
            elements.registerForm.reset();
            clearImagePreview('reg');
            
            // Switch to login after 2 seconds
            setTimeout(() => {
                showLoginForm();
            }, 2000);
        } else {
            elements.registerError.textContent = result.error;
            elements.registerError.style.display = 'block';
            elements.registerSuccess.style.display = 'none';
        }
        
        // Re-enable form
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Registrieren';
    });

    // Auth screen switching
    elements.showRegister.addEventListener('click', function(e) {
        e.preventDefault();
        showRegisterForm();
    });

    elements.showLogin.addEventListener('click', function(e) {
        e.preventDefault();
        showLoginForm();
    });

    // Registration image upload
    document.getElementById('regProfileImage').addEventListener('change', function(e) {
        handleImageUpload(e.target, 'reg');
    });

    document.getElementById('regRemoveImage').addEventListener('click', function() {
        clearImagePreview('reg');
    });

    // User menu dropdown
    elements.userMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleUserDropdown();
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
        elements.userDropdown.style.display = 'none';
    });

    // Logout button
    elements.logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });

    // User settings
    elements.userSettings.addEventListener('click', function(e) {
        e.preventDefault();
        showSettingsModal();
    });

    // User profile
    elements.userProfile.addEventListener('click', function(e) {
        e.preventDefault();
        switchTab('profile');
        elements.userDropdown.style.display = 'none';
    });

    // Profile form submission
    elements.profileForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const currentPassword = formData.get('currentPassword');
        const newPassword = formData.get('newPassword');
        const confirmNewPassword = formData.get('confirmNewPassword');
        
        // Validate password change if provided
        if (newPassword || confirmNewPassword || currentPassword) {
            if (!currentPassword) {
                elements.profileError.textContent = 'Aktuelles Passwort ist erforderlich';
                elements.profileError.style.display = 'block';
                return;
            }
            
            if (newPassword !== confirmNewPassword) {
                elements.profileError.textContent = 'Neue Passwörter stimmen nicht überein';
                elements.profileError.style.display = 'block';
                return;
            }
            
            if (newPassword.length < 6) {
                elements.profileError.textContent = 'Neues Passwort muss mindestens 6 Zeichen lang sein';
                elements.profileError.style.display = 'block';
                return;
            }
        }

        // Get profile image if changed
        let profileImage = appState.currentUser.profileImage;
        const imageFile = elements.profileImageInput.files[0];
        if (imageFile) {
            profileImage = await getBase64(imageFile);
        }

        const profileData = {
            username: formData.get('username'),
            phone: formData.get('phone'),
            profileImage: profileImage
        };

        // Add password if changing
        if (newPassword) {
            profileData.password = newPassword;
        }
        
        const result = await updateUserProfile(profileData);
        
        if (result.success) {
            elements.profileError.style.display = 'none';
            elements.profileSuccess.style.display = 'block';
            
            // Clear password fields
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmNewPassword').value = '';
            
            setTimeout(() => {
                elements.profileSuccess.style.display = 'none';
            }, 3000);
        } else {
            elements.profileError.textContent = result.error;
            elements.profileError.style.display = 'block';
            elements.profileSuccess.style.display = 'none';
        }
    });

    // Profile image upload
    elements.profileImageInput.addEventListener('change', function(e) {
        handleImageUpload(e.target, 'profile');
    });

    elements.removeProfileImage.addEventListener('click', function() {
        clearImagePreview('profile');
    });

    elements.cancelProfileChanges.addEventListener('click', function() {
        loadUserProfile();
        elements.profileError.style.display = 'none';
        elements.profileSuccess.style.display = 'none';
        
        // Clear password fields
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmNewPassword').value = '';
    });

    // Settings modal close
    elements.closeSettings.addEventListener('click', hideSettingsModal);

    // Close modal when clicking outside
    elements.settingsModal.addEventListener('click', function(e) {
        if (e.target === elements.settingsModal) {
            hideSettingsModal();
        }
    });

    // Settings controls
    elements.saveSettings.addEventListener('click', saveSettings);
    elements.resetSettings.addEventListener('click', resetSettings);

    // Dark mode toggle immediate effect
    elements.darkModeToggle.addEventListener('change', function() {
        if (this.checked) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    });

    // Navigation buttons
    elements.navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            switchTab(tabName);
        });
    });

    // Load settings on startup
    loadSettings();
    applySettings();

    // Initialize app
    showAuthScreen();
});

// Helper function to convert file to base64
function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape key closes modals and dropdowns
    if (e.key === 'Escape') {
        elements.userDropdown.style.display = 'none';
        hideSettingsModal();
    }
    
    // Ctrl+L for quick logout (when logged in)
    if (e.ctrlKey && e.key === 'l' && appState.isLoggedIn) {
        e.preventDefault();
        logout();
    }
});

// Handle page refresh - check if user was logged in
window.addEventListener('beforeunload', function() {
    // Save current state to sessionStorage
    if (appState.isLoggedIn) {
        sessionStorage.setItem('simsAcSession', JSON.stringify({
            isLoggedIn: true,
            currentUser: appState.currentUser,
            currentTab: appState.currentTab
        }));
    } else {
        sessionStorage.removeItem('simsAcSession');
    }
});

// Restore session on page load
window.addEventListener('load', function() {
    const savedSession = sessionStorage.getItem('simsAcSession');
    if (savedSession) {
        try {
            const session = JSON.parse(savedSession);
            if (session.isLoggedIn && session.currentUser) {
                appState.isLoggedIn = true;
                appState.currentUser = session.currentUser;
                appState.currentTab = session.currentTab || 'grafana';
                showDashboard();
                switchTab(appState.currentTab);
            }
        } catch (error) {
            console.error('Error restoring session:', error);
            sessionStorage.removeItem('simsAcSession');
        }
    }
});

// Export functions for debugging (remove in production)
window.simsApp = {
    login,
    logout,
    switchTab,
    appState
};