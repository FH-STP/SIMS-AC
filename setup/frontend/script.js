// Application State
const appState = {
    isLoggedIn: false,
    currentUser: null,
    currentTab: 'grafana',
    adminAuthenticatedForRegistration: false, // Track if admin is authenticated for user creation
    adminTokenForRegistration: null, // Store admin token temporarily for user creation
    settings: {
        darkMode: false,
        emailNotifications: true,
        incidentNotifications: true,
        systemNotifications: false,
        securityNotifications: true
    },
    // Incident management state
    allIncidents: [], // Store all loaded incidents for filtering/sorting
    usersCache: {}, // Cache for user ID to username mapping
    currentSort: { field: 'id', direction: 'desc' }, // Default sort
    currentFilters: { status: '', severity: '', search: '' }
};

// DOM Elements - will be initialized after DOM is loaded
let elements = {};

// API Configuration
// Direct connection to API on port 5321 (bypass nginx proxy for now)
const API_BASE_URL = 'http://localhost:5321';

// Authentication Functions
async function login(username, password) {
    console.log(`🔐 Attempting login with username: ${username}`);
    try {
        // Real API call to /Account/Login endpoint
        const response = await fetch(`${API_BASE_URL}/Account/Login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                UserName: username, 
                Password: password 
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Login successful:', data);
            
            // Store JWT token if provided (API returns accessToken in lowercase)
            const token = data.accessToken || data.AccessToken;
            if (token) {
                localStorage.setItem('jwt_token', token);
                console.log('🔑 JWT token stored successfully');
            }
            
            // Create user object from response
            console.log('Login API response:', data);
            
            const user = {
                id: data.ID || data.Id || data.id || data.UserId || data.userId || 1,
                username: data.UserName || data.userName || username,
                name: data.UserName || data.userName || username,
                email: data.email || `${username}@sims-ac.local`,
                role: data.role || 'user',
                phone: data.phone || null,
                profileImage: null
            };
            
            console.log('Created user object:', user);
            
            appState.isLoggedIn = true;
            appState.currentUser = user;
            
            // Save session data
            sessionStorage.setItem('simsAcSession', JSON.stringify({
                isLoggedIn: true,
                currentUser: user,
                currentTab: 'grafana'
            }));
            console.log('💾 Session data saved');
            
            showDashboard();
            return { success: true };
        } else if (response.status === 401) {
            console.warn('Login failed: Unauthorized');
            return { success: false, error: 'Ungültige Anmeldedaten' };
        } else if (response.status === 204) {
            console.warn('Login failed: Account disabled');
            return { success: false, error: 'Konto ist deaktiviert' };
        } else {
            const errorText = await response.text();
            console.error('Login failed:', response.status, errorText);
            return { success: false, error: 'Anmeldung fehlgeschlagen' };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Verbindungsfehler zur API. Bitte versuchen Sie es später erneut.' };
    }
}

async function logout() {
    try {
        // Clear JWT token and session data
        localStorage.removeItem('jwt_token');
        sessionStorage.removeItem('simsAcSession');
        
        // No specific logout API endpoint in backend, just clear local state
        console.log('🔓 Logging out and clearing all session data...');
        
        appState.isLoggedIn = false;
        appState.currentUser = null;
        showAuthScreen();
    } catch (error) {
        console.error('Logout error:', error);
        // Still logout locally even if anything fails
        localStorage.removeItem('jwt_token');
        sessionStorage.removeItem('simsAcSession');
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

// Real API calls to backend with JWT authentication
async function apiCall(endpoint, options = {}) {
    try {
        const url = `${API_BASE_URL}${endpoint}`;
        
        // Add JWT token to headers if available
        const token = localStorage.getItem('jwt_token');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const config = {
            headers,
            ...options
        };

        console.log(`🌐 Real API Call: ${config.method || 'GET'} ${url}`);
        
        const response = await fetch(url, config);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.warn(`API returned ${response.status}. Response:`, errorText);
            
            // Handle authentication errors
            if (response.status === 401) {
                console.warn('Authentication failed - clearing token and redirecting to login');
                localStorage.removeItem('jwt_token');
                appState.isLoggedIn = false;
                appState.currentUser = null;
                showAuthScreen();
            }
            
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('✅ API Response:', data);
        return data;
        
    } catch (error) {
        console.error('❌ API Error:', error);
        
        // Only use fallback for development during API development
        // Remove this for production!
        if (endpoint === '/auth/login' || endpoint === '/auth/register') {
            console.log('🔄 Authentication endpoints - using mock fallback for development...');
            return simulateApiCall(endpoint, options);
        }
        
        // For other endpoints, throw the error
        throw error;
    }
}

// Fallback simulation for development (when API is not available)
async function simulateApiCall(endpoint, options = {}) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`Mock API Call: ${options.method || 'GET'} ${endpoint}`);
            
            // Simulate different responses based on endpoint
            if (endpoint === '/auth/login') {
                const body = JSON.parse(options.body || '{}');
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
                const body = JSON.parse(options.body || '{}');
                
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
                    const body = JSON.parse(options.body || '{}');
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

// Admin Authentication for User Registration
async function authenticateAdminForRegistration(username, password) {
    console.log(`🔐 Attempting admin authentication for user creation with username: ${username}`);
    try {
        // Real API call to /Account/Login endpoint
        const response = await fetch(`${API_BASE_URL}/Account/Login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                UserName: username, 
                Password: password 
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Admin authentication successful:', data);
            
            // Check if user is actually an admin (you may need to verify this based on your API response)
            // Store the admin token temporarily for user creation
            // Note: API returns 'accessToken' (lowercase) not 'AccessToken'
            const token = data.accessToken || data.AccessToken;
            
            if (token) {
                console.log('Setting admin token in appState...');
                appState.adminTokenForRegistration = token;
                appState.adminAuthenticatedForRegistration = true;
                console.log('🔑 Admin token stored for user creation');
                console.log('Verification - Token in appState:', appState.adminTokenForRegistration);
                console.log('Verification - Auth flag in appState:', appState.adminAuthenticatedForRegistration);
            } else {
                console.error('⚠️ Access token is missing in response!');
            }
            
            return { success: true };
        } else if (response.status === 401) {
            console.warn('Admin authentication failed: Unauthorized');
            return { success: false, error: 'Ungültige Admin-Anmeldedaten' };
        } else if (response.status === 204) {
            console.warn('Admin authentication failed: Account disabled');
            return { success: false, error: 'Admin-Konto ist deaktiviert' };
        } else {
            const errorText = await response.text();
            console.error('Admin authentication failed:', response.status, errorText);
            return { success: false, error: 'Admin-Authentifizierung fehlgeschlagen' };
        }
    } catch (error) {
        console.error('Admin authentication error:', error);
        return { success: false, error: 'Verbindungsfehler zur API. Bitte versuchen Sie es später erneut.' };
    }
}

// Registration Functions
async function register(userData) {
    try {
        // Ensure admin is authenticated
        if (!appState.adminAuthenticatedForRegistration || !appState.adminTokenForRegistration) {
            return { success: false, error: 'Admin-Authentifizierung erforderlich' };
        }

        // Real API call to /User endpoint (CreateUser) with admin token
        const response = await fetch(`${API_BASE_URL}/User`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${appState.adminTokenForRegistration}`
            },
            body: JSON.stringify({
                UserName: userData.username,
                Password: userData.password,
                EMail: userData.email,
                Telephone: userData.phone || '',
                isAdmin: false
            })
        });

        if (response.ok) {
            console.log('✅ User creation successful');
            
            // If profile image is provided, upload it
            if (userData.profileImage) {
                try {
                    console.log('📸 Uploading profile image for new user...');
                    
                    // Login with the new user credentials to get proper session
                    const loginResult = await login(userData.username, userData.password);
                    
                    if (loginResult.success) {
                        // Convert base64 to file object
                        const base64Response = await fetch(userData.profileImage);
                        const blob = await base64Response.blob();
                        const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
                        
                        // Use the same upload logic as in profile tab
                        const uploadResult = await uploadProfileImage(file);
                        
                        if (uploadResult.success) {
                            console.log('✅ Profile image uploaded successfully');
                        } else {
                            console.warn('❌ Profile image upload failed:', uploadResult.error);
                        }
                        
                        // Logout the new user (we're still in admin context)
                        appState.isLoggedIn = false;
                        appState.currentUser = null;
                        localStorage.removeItem('jwt_token');
                        sessionStorage.removeItem('simsAcSession');
                    } else {
                        console.warn('Could not login new user to upload profile image');
                    }
                } catch (imageError) {
                    console.error('Error handling profile image:', imageError);
                    // Don't fail the whole registration if image upload fails
                }
            }
            
            // Clear admin token after successful user creation
            appState.adminAuthenticatedForRegistration = false;
            appState.adminTokenForRegistration = null;
            
            return { success: true, message: 'Benutzer erfolgreich erstellt!' };
        } else if (response.status === 400) {
            const errorText = await response.text();
            console.warn('User creation failed:', errorText);
            
            // Check for specific error messages
            if (errorText.includes('Password to weak')) {
                return { success: false, error: 'Passwort zu schwach. Verwenden Sie ein stärkeres Passwort.' };
            } else {
                return { success: false, error: 'Benutzererstellung fehlgeschlagen: ' + errorText };
            }
        } else if (response.status === 401) {
            // Admin token expired or invalid
            appState.adminAuthenticatedForRegistration = false;
            appState.adminTokenForRegistration = null;
            return { success: false, error: 'Admin-Sitzung abgelaufen. Bitte erneut anmelden.' };
        } else {
            const errorText = await response.text();
            console.error('User creation failed:', response.status, errorText);
            return { success: false, error: 'Benutzererstellung fehlgeschlagen' };
        }
    } catch (error) {
        console.error('User creation error:', error);
        return { success: false, error: 'Verbindungsfehler zur API. Bitte versuchen Sie es später erneut.' };
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
    
    // Reset registration state
    appState.adminAuthenticatedForRegistration = false;
    appState.adminTokenForRegistration = null;
}

function showRegisterForm() {
    elements.loginContainer.style.display = 'none';
    elements.registerContainer.style.display = 'block';
    
    // Reset to step 1 (admin authentication)
    elements.adminAuthStep.style.display = 'block';
    elements.userCreationStep.style.display = 'none';
    elements.adminAuthError.style.display = 'none';
    elements.adminAuthForm.reset();
    
    // Reset state
    appState.adminAuthenticatedForRegistration = false;
    appState.adminTokenForRegistration = null;
}

function showUserCreationStep() {
    console.log('🔄 Switching to user creation step...');
    console.log('adminAuthStep element:', elements.adminAuthStep);
    console.log('userCreationStep element:', elements.userCreationStep);
    
    // Show step 2 after admin authentication
    elements.adminAuthStep.style.display = 'none';
    elements.userCreationStep.style.display = 'block';
    elements.registerError.style.display = 'none';
    elements.registerSuccess.style.display = 'none';
    elements.registerForm.reset();
    clearImagePreview('reg');
    
    console.log('✅ User creation step should now be visible');
}

function showDashboard() {
    elements.authScreen.style.display = 'none';
    elements.dashboard.style.display = 'flex';
    
    // Update user info
    elements.currentUser.textContent = appState.currentUser.name || appState.currentUser.username;
    
    // Load profile image from MongoDB
    loadProfileImage();
    
    // Load user profile data
    loadUserProfile();
    
    // Apply user settings
    applySettings();
    
    // Show default tab (Grafana)
    switchTab('grafana');
    
    // Initialize sort icons
    updateSortIcons();
    
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

    // Load content based on tab
    if (tabName === 'incidents') {
        loadIncidents();
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
        const response = await apiCall('/user/profile', {
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

// Profile Image API Functions
async function uploadProfileImage(file) {
    try {
        console.log('🔄 Uploading profile image...');
        
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${API_BASE_URL}/User/UploadPicture`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
            },
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Profile image uploaded successfully:', result);
            
            // Reload profile image after upload
            await loadProfileImage();
            
            return { success: true, fileId: result };
        } else {
            console.error('Failed to upload profile image:', response.status);
            const errorText = await response.text();
            return { success: false, error: errorText };
        }
    } catch (error) {
        console.error('Error uploading profile image:', error);
        return { success: false, error: 'Verbindungsfehler beim Hochladen' };
    }
}

async function loadProfileImage() {
    try {
        console.log('🔄 Loading profile image...');
        
        const response = await fetch(`${API_BASE_URL}/User/GetUserPic`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
            }
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            
            // Update profile image in current user state
            if (appState.currentUser) {
                appState.currentUser.profileImage = imageUrl;
            }
            
            // Update all avatar displays
            updateAllAvatars(imageUrl);
            
            console.log('✅ Profile image loaded successfully');
            return { success: true, imageUrl };
        } else if (response.status === 404) {
            // No profile image found - use default
            console.log('ℹ️ No profile image found, using default');
            updateAllAvatars(null);
            return { success: true, imageUrl: null };
        } else {
            console.error('Failed to load profile image:', response.status);
            return { success: false, error: 'Fehler beim Laden des Profilbildes' };
        }
    } catch (error) {
        console.error('Error loading profile image:', error);
        return { success: false, error: 'Verbindungsfehler beim Laden' };
    }
}

function updateAllAvatars(imageUrl) {
    if (imageUrl) {
        // Show profile image in profile tab
        elements.profileAvatar.src = imageUrl;
        elements.profileAvatar.style.display = 'block';
        elements.avatarPlaceholder.style.display = 'none';
        
        // Show profile image in top navigation
        elements.topNavAvatar.src = imageUrl;
        elements.topNavAvatar.style.display = 'block';
        elements.topNavAvatarPlaceholder.style.display = 'none';
    } else {
        // Show placeholder in profile tab
        elements.profileAvatar.style.display = 'none';
        elements.avatarPlaceholder.style.display = 'flex';
        
        // Show placeholder in top navigation
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
    // Grafana is now opened in a new tab instead of iframe
    // No iframe loading needed anymore
    console.log('Grafana tab selected - use the "Grafana öffnen" button to access Grafana');
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

// Incident Management Functions
async function loadIncidents() {
    try {
        console.log('🔄 Loading incidents...');
        
        // Show loading state
        const tbody = elements.incidentsTableBody;
        tbody.innerHTML = `
            <tr class="loading-row">
                <td colspan="7" class="loading-cell">
                    <i class="fas fa-spinner fa-spin"></i> Lade Incidents...
                </td>
            </tr>
        `;

        const response = await fetch(`${API_BASE_URL}/Incident/GetIncidentList`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
            }
        });

        if (response.ok) {
            const incidents = await response.json();
            console.log('✅ Incidents loaded:', incidents);
            console.log('� Total incidents received:', incidents ? incidents.length : 0);
            
            // Debug: Count null values
            if (incidents) {
                const nullCount = incidents.filter(i => i === null || i === undefined).length;
                const validCount = incidents.filter(i => i !== null && i !== undefined).length;
                console.log('📋 Valid incidents:', validCount, 'Null incidents:', nullCount);
                
                // Show first valid incident
                const firstValid = incidents.find(i => i !== null && i !== undefined);
                if (firstValid) {
                    console.log('📋 First valid incident sample:', firstValid);
                    console.log('🔍 Incident properties:', Object.keys(firstValid));
                }
            }
            
            // Store incidents in state (filter out null values) and apply current filters/sorting
            appState.allIncidents = (incidents || []).filter(incident => incident !== null && incident !== undefined);
            console.log('💾 Stored valid incidents:', appState.allIncidents.length);
            filterAndSortIncidents();
        } else {
            console.error('Failed to load incidents:', response.status);
            tbody.innerHTML = `
                <tr class="error-row">
                    <td colspan="7" class="error-cell">
                        <i class="fas fa-exclamation-triangle"></i> Fehler beim Laden der Incidents
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Error loading incidents:', error);
        elements.incidentsTableBody.innerHTML = `
            <tr class="error-row">
                <td colspan="7" class="error-cell">
                    <i class="fas fa-exclamation-triangle"></i> Verbindungsfehler
                </td>
            </tr>
        `;
    }
}

function displayIncidents(incidents) {
    const tbody = elements.incidentsTableBody;
    
    if (!incidents || incidents.length === 0) {
        elements.incidentsEmpty.style.display = 'block';
        tbody.innerHTML = '';
        return;
    }
    
    elements.incidentsEmpty.style.display = 'none';
    
    // Create incident rows (with placeholders for usernames)
    const incidentRows = incidents.map(incident => {
        if (!incident) return '';
        
        // Map properties to handle both PascalCase and camelCase
        const incidentData = mapIncidentProperties(incident);
        
        // Skip if mapping failed
        if (!incidentData) return '';
        
        const statusText = getStatusText(incidentData.status);
        const severityText = getSeverityText(incidentData.severity);
        const isUnassigned = incidentData.owner === 0;
        
        return `
            <tr class="incident-row" data-incident-id="${incidentData.id}">
                <td class="incident-id">#${incidentData.id}</td>
                <td class="incident-title" title="${incidentData.title}">${incidentData.title}</td>
                <td class="incident-owner ${isUnassigned ? 'unassigned' : ''}" data-owner-id="${incidentData.owner}">
                    ${isUnassigned ? 'Nicht zugewiesen' : 'Lädt...'}
                </td>
                <td class="incident-status">
                    <span class="status-badge status-${incidentData.status}">${statusText}</span>
                </td>
                <td class="incident-severity">
                    <span class="severity-badge severity-${incidentData.severity}">${severityText}</span>
                </td>
                <td class="incident-created">${formatDate(incidentData.creationTime)}</td>
                <td class="incident-actions">
                    ${isUnassigned ? 
                        `<button class="btn-small btn-primary assign-to-me" data-incident-id="${incidentData.id}" title="Mir zuweisen">
                            <i class="fas fa-hand-paper"></i>
                        </button>` 
                        : ''
                    }
                    <button class="btn-small btn-secondary incident-details" data-incident-id="${incidentData.id}" title="Details anzeigen">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = incidentRows.join('');
    
    // Load usernames asynchronously
    loadIncidentOwnerNames();
    
    // Add event listeners for action buttons
    addIncidentActionListeners();
}

async function loadIncidentOwnerNames() {
    const ownerCells = document.querySelectorAll('.incident-owner[data-owner-id]');
    
    for (const cell of ownerCells) {
        const ownerId = parseInt(cell.dataset.ownerId);
        if (ownerId === 0) continue; // Skip unassigned
        
        const username = await getUsernameById(ownerId);
        cell.textContent = username;
    }
}

// Helper function to map incident properties (handles both PascalCase and camelCase)
function mapIncidentProperties(incident) {
    // Return null for invalid incidents
    if (!incident || typeof incident !== 'object') {
        return null;
    }
    
    return {
        id: incident.Id || incident.id || 0,
        owner: incident.Owner || incident.owner || 0,
        creator: incident.Creator || incident.creator || 0,
        title: incident.Title || incident.title || 'Unbekannt',
        apiText: incident.APIText || incident.apiText || '{}',
        notesText: incident.NotesText || incident.notesText || '',
        severity: incident.Severity || incident.severity || 1,
        conclusion: incident.Conclusion || incident.conclusion || 0,
        status: incident.Status || incident.status || 0,
        creationTime: incident.CreationTime || incident.creationTime || new Date().toISOString(),
        isDisabled: incident.IsDisabled || incident.isDisabled || false
    };
}

// User caching and lookup functions
async function getUsernameById(userId) {
    if (userId === 0) return 'Nicht zugewiesen';
    
    // Check cache first
    if (appState.usersCache[userId]) {
        return appState.usersCache[userId];
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/User/GetUserInfo/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
            }
        });
        
        if (response.ok) {
            const user = await response.json();
            const username = user.userName || user.UserName || user.username || `User ${userId}`;
            // Cache the username
            appState.usersCache[userId] = username;
            return username;
        } else {
            return `User ${userId}`;
        }
    } catch (error) {
        console.error('Error fetching user info:', error);
        return `User ${userId}`;
    }
}

// Incident filtering, sorting and search functions
function filterAndSortIncidents() {
    let filteredIncidents = [...appState.allIncidents];
    
    // Apply status filter
    if (appState.currentFilters.status !== '') {
        const statusValue = parseInt(appState.currentFilters.status);
        filteredIncidents = filteredIncidents.filter(incident => {
            const incidentData = mapIncidentProperties(incident);
            return incidentData && incidentData.status === statusValue;
        });
    }
    
    // Apply severity filter
    if (appState.currentFilters.severity !== '') {
        const severityValue = parseInt(appState.currentFilters.severity);
        filteredIncidents = filteredIncidents.filter(incident => {
            const incidentData = mapIncidentProperties(incident);
            return incidentData && incidentData.severity === severityValue;
        });
    }
    
    // Apply search filter
    if (appState.currentFilters.search !== '') {
        const searchTerm = appState.currentFilters.search.toLowerCase();
        filteredIncidents = filteredIncidents.filter(incident => {
            const incidentData = mapIncidentProperties(incident);
            return incidentData && incidentData.title.toLowerCase().includes(searchTerm);
        });
    }
    
    // Apply sorting
    filteredIncidents.sort((a, b) => {
        const aData = mapIncidentProperties(a);
        const bData = mapIncidentProperties(b);
        
        // Skip if mapping failed
        if (!aData || !bData) return 0;
        
        let aValue = aData[appState.currentSort.field];
        let bValue = bData[appState.currentSort.field];
        
        // Handle different data types
        if (appState.currentSort.field === 'creationTime') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        } else if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }
        
        let result = 0;
        if (aValue < bValue) result = -1;
        if (aValue > bValue) result = 1;
        
        return appState.currentSort.direction === 'desc' ? -result : result;
    });
    
    displayIncidents(filteredIncidents);
}

function setSortField(field) {
    if (appState.currentSort.field === field) {
        // Toggle direction if same field
        appState.currentSort.direction = appState.currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        // New field, default to ascending
        appState.currentSort.field = field;
        appState.currentSort.direction = 'asc';
    }
    
    updateSortIcons();
    filterAndSortIncidents();
}

function updateSortIcons() {
    // Reset all sort icons
    document.querySelectorAll('.sortable i').forEach(icon => {
        icon.className = 'fas fa-sort';
    });
    
    // Set active sort icon
    const activeHeader = document.querySelector(`[data-field="${appState.currentSort.field}"] i`);
    if (activeHeader) {
        activeHeader.className = appState.currentSort.direction === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
    }
}

function clearAllFilters() {
    appState.currentFilters = { status: '', severity: '', search: '' };
    elements.statusFilter.value = '';
    elements.severityFilter.value = '';
    elements.searchFilter.value = '';
    filterAndSortIncidents();
}

function getStatusText(status) {
    const statusMap = {
        0: 'Offen',
        1: 'In Bearbeitung',
        2: 'Gelöst',
        3: 'Geschlossen'
    };
    return statusMap[status] || 'Unbekannt';
}

function getSeverityText(severity) {
    const severityMap = {
        1: 'Niedrig',
        2: 'Mittel',
        3: 'Hoch',
        4: 'Kritisch',
        5: 'Notfall'
    };
    return severityMap[severity] || 'Unbekannt';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function addIncidentActionListeners() {
    // Assign to me buttons
    document.querySelectorAll('.assign-to-me').forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            const incidentId = parseInt(this.dataset.incidentId);
            await assignIncidentToCurrentUser(incidentId);
        });
    });
    
    // Details buttons (placeholder for future implementation)
    document.querySelectorAll('.incident-details').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const incidentId = parseInt(this.dataset.incidentId);
            alert(`Details für Incident #${incidentId} - Coming soon!`);
        });
    });
}

async function assignIncidentToCurrentUser(incidentId) {
    try {
        console.log(`🔄 Assigning incident ${incidentId} to current user...`);
        
        if (!appState.currentUser) {
            console.error('No current user found');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/Incident/Assign`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
            },
            body: JSON.stringify({
                Id: incidentId,
                Owner: appState.currentUser.id
            })
        });

        if (response.ok) {
            console.log('✅ Incident assigned successfully');
            showSuccessMessage('Incident wurde Ihnen zugewiesen!');
            // Reload incidents to reflect changes
            loadIncidents();
        } else {
            console.error('Failed to assign incident:', response.status);
            showErrorMessage('Fehler beim Zuweisen des Incidents');
        }
    } catch (error) {
        console.error('Error assigning incident:', error);
        showErrorMessage('Verbindungsfehler beim Zuweisen');
    }
}

// Function to create test incidents via API
async function createTestIncidents() {
    try {
        console.log('🔄 Creating test incidents...');
        
        const response = await fetch(`${API_BASE_URL}/Incident/InserTestInfoIncidents`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
            }
        });
        
        if (response.ok) {
            console.log('✅ Test incidents created successfully');
            showSuccessMessage('Test-Incidents wurden erfolgreich erstellt!');
            // Reload incidents to show new test incidents
            if (appState.currentTab === 'incidents') {
                loadIncidents();
            }
        } else {
            console.error('Failed to create test incidents:', response.status);
            showErrorMessage('Fehler beim Erstellen der Test-Incidents');
        }
    } catch (error) {
        console.error('Error creating test incidents:', error);
        showErrorMessage('Verbindungsfehler beim Erstellen der Test-Incidents');
    }
}

async function createIncident(incidentData) {
    try {
        console.log('🔄 Creating new incident...', incidentData);
        console.log('Current user:', appState.currentUser);
        
        if (!appState.currentUser) {
            console.error('No current user found');
            return { success: false, error: 'Benutzer nicht angemeldet' };
        }

        // Prepare incident data for API
        const newIncident = {
            Id: 0, // Will be generated by backend
            Owner: appState.currentUser.id, // Assign to current user
            Creator: appState.currentUser.id,
            Title: incidentData.title,
            APIText: incidentData.apiText,
            NotesText: incidentData.notes || '',
            Severity: parseInt(incidentData.severity),
            Status: parseInt(incidentData.status),
            Conclusion: 1, // Set conclusion to 1
            CreationTime: new Date().toISOString(),
            IsDisabled: false
        };

        const response = await fetch(`${API_BASE_URL}/Incident`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
            },
            body: JSON.stringify(newIncident)
        });

        if (response.ok) {
            console.log('✅ Incident created successfully');
            return { success: true };
        } else {
            console.error('Failed to create incident:', response.status);
            const errorText = await response.text();
            return { success: false, error: 'Fehler beim Erstellen des Incidents: ' + errorText };
        }
    } catch (error) {
        console.error('Error creating incident:', error);
        return { success: false, error: 'Verbindungsfehler beim Erstellen des Incidents' };
    }
}

function showCreateIncidentModal() {
    elements.createIncidentModal.style.display = 'flex';
    // Reset form
    elements.createIncidentForm.reset();
    elements.createIncidentError.style.display = 'none';
    elements.createIncidentSuccess.style.display = 'none';
    
    // Set default JSON for API Text
    const apiTextArea = document.getElementById('incidentApiText');
    if (apiTextArea) {
        apiTextArea.value = JSON.stringify({
            "description": "Beschreibung des Incidents",
            "source": "System",
            "timestamp": new Date().toISOString(),
            "priority": "medium"
        }, null, 2);
    }
}

function hideCreateIncidentModal() {
    elements.createIncidentModal.style.display = 'none';
}

function showSuccessMessage(message) {
    // Create a temporary success notification
    const notification = document.createElement('div');
    notification.className = 'notification success-notification';
    notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function showErrorMessage(message) {
    // Create a temporary error notification
    const notification = document.createElement('div');
    notification.className = 'notification error-notification';
    notification.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize DOM Elements after DOM is loaded
    elements = {
        // Auth Elements
        authScreen: document.getElementById('authScreen'),
        loginContainer: document.getElementById('loginContainer'),
        registerContainer: document.getElementById('registerContainer'),
        adminAuthStep: document.getElementById('adminAuthStep'),
        userCreationStep: document.getElementById('userCreationStep'),
        adminAuthForm: document.getElementById('adminAuthForm'),
        adminAuthError: document.getElementById('adminAuthError'),
        loginForm: document.getElementById('loginForm'),
        registerForm: document.getElementById('registerForm'),
        loginError: document.getElementById('loginError'),
        registerError: document.getElementById('registerError'),
        registerSuccess: document.getElementById('registerSuccess'),
        showRegister: document.getElementById('showRegister'),
        showLogin: document.getElementById('showLogin'),
        showLoginFromAdmin: document.getElementById('showLoginFromAdmin'),
        cancelRegistration: document.getElementById('cancelRegistration'),
        
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
        settingsError: document.getElementById('settingsError'),
        
        // Incident Elements
        createIncidentBtn: document.getElementById('createIncidentBtn'),
        createTestIncidentsBtn: document.getElementById('createTestIncidentsBtn'),
        incidentsTableBody: document.getElementById('incidentsTableBody'),
        incidentsEmpty: document.getElementById('incidentsEmpty'),
        statusFilter: document.getElementById('statusFilter'),
        severityFilter: document.getElementById('severityFilter'),
        searchFilter: document.getElementById('searchFilter'),
        refreshIncidents: document.getElementById('refreshIncidents'),
        clearFilters: document.getElementById('clearFilters'),
        createIncidentModal: document.getElementById('createIncidentModal'),
        createIncidentForm: document.getElementById('createIncidentForm'),
        closeCreateIncident: document.getElementById('closeCreateIncident'),
        cancelCreateIncident: document.getElementById('cancelCreateIncident'),
        createIncidentSuccess: document.getElementById('createIncidentSuccess'),
        createIncidentError: document.getElementById('createIncidentError')
    };

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

    // Admin Authentication form submission (Step 1 of registration)
    elements.adminAuthForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;
        
        // Disable form during authentication
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authentifiziere...';
        
        const result = await authenticateAdminForRegistration(username, password);
        
        console.log('Admin auth result:', result);
        console.log('Admin token stored:', appState.adminTokenForRegistration);
        console.log('Admin authenticated flag:', appState.adminAuthenticatedForRegistration);
        
        if (result.success) {
            console.log('Moving to user creation step...');
            elements.adminAuthError.style.display = 'none';
            // Move to step 2 (user creation)
            showUserCreationStep();
        } else {
            console.error('Admin auth failed:', result.error);
            elements.adminAuthError.textContent = result.error;
            elements.adminAuthError.style.display = 'block';
        }
        
        // Re-enable form
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-unlock-alt"></i> Als Admin anmelden';
    });

    // Registration form submission (Step 2 - User creation)
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
        
        // Disable form during user creation
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Erstelle Benutzer...';
        
        const result = await register(userData);
        
        if (result.success) {
            elements.registerError.style.display = 'none';
            elements.registerSuccess.textContent = result.message;
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
            
            // If admin session expired, go back to step 1
            if (result.error.includes('Admin-Sitzung abgelaufen')) {
                setTimeout(() => {
                    showRegisterForm();
                }, 2000);
            }
        }
        
        // Re-enable form
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Benutzer erstellen';
    });

    // Cancel user creation button
    elements.cancelRegistration.addEventListener('click', function(e) {
        e.preventDefault();
        // Reset and go back to login
        appState.adminAuthenticatedForRegistration = false;
        appState.adminTokenForRegistration = null;
        showLoginForm();
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
    
    elements.showLoginFromAdmin.addEventListener('click', function(e) {
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
    elements.profileImageInput.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (file) {
            // Show preview immediately
            handleImageUpload(e.target, 'profile');
            
            // Upload to server
            const result = await uploadProfileImage(file);
            if (result.success) {
                showSuccessMessage('Profilbild wurde erfolgreich hochgeladen!');
            } else {
                showErrorMessage('Fehler beim Hochladen des Profilbildes: ' + result.error);
                // Revert preview on error
                loadProfileImage();
            }
        }
    });

    elements.removeProfileImage.addEventListener('click', function() {
        // Clear preview immediately
        clearImagePreview('profile');
        
        // Update user state
        if (appState.currentUser) {
            appState.currentUser.profileImage = null;
        }
        
        // Note: We don't have a delete API endpoint, so we just clear locally
        // The user can upload a new image to replace the old one
        showSuccessMessage('Profilbild wurde entfernt!');
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

    // Incident Management Event Listeners
    elements.createIncidentBtn.addEventListener('click', function() {
        showCreateIncidentModal();
    });

    elements.createTestIncidentsBtn.addEventListener('click', function() {
        createTestIncidents();
    });

    elements.closeCreateIncident.addEventListener('click', function() {
        hideCreateIncidentModal();
    });

    elements.cancelCreateIncident.addEventListener('click', function() {
        hideCreateIncidentModal();
    });

    elements.createIncidentForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const incidentData = {
            title: formData.get('title'),
            severity: formData.get('severity'),
            status: formData.get('status'),
            apiText: formData.get('apiText'),
            notes: formData.get('notes')
        };
        
        // Validate API Text - must not be empty and must be valid JSON
        if (!incidentData.apiText || incidentData.apiText.trim() === '') {
            elements.createIncidentError.textContent = 'API Text darf nicht leer sein';
            elements.createIncidentError.style.display = 'block';
            elements.createIncidentSuccess.style.display = 'none';
            return;
        }
        
        try {
            const parsedJson = JSON.parse(incidentData.apiText);
            // Ensure it's not just an empty object
            if (typeof parsedJson === 'object' && parsedJson !== null && Object.keys(parsedJson).length === 0) {
                elements.createIncidentError.textContent = 'API Text darf nicht nur ein leeres JSON-Objekt sein';
                elements.createIncidentError.style.display = 'block';
                elements.createIncidentSuccess.style.display = 'none';
                return;
            }
        } catch (error) {
            elements.createIncidentError.textContent = 'Ungültiges JSON-Format im API Text Feld';
            elements.createIncidentError.style.display = 'block';
            elements.createIncidentSuccess.style.display = 'none';
            return;
        }
        
        // Disable submit button
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Erstelle...';
        
        const result = await createIncident(incidentData);
        
        if (result.success) {
            elements.createIncidentSuccess.style.display = 'block';
            elements.createIncidentError.style.display = 'none';
            e.target.reset();
            
            // Close modal after short delay and refresh incidents
            setTimeout(() => {
                hideCreateIncidentModal();
                if (appState.currentTab === 'incidents') {
                    loadIncidents();
                }
            }, 1500);
        } else {
            elements.createIncidentError.textContent = result.error;
            elements.createIncidentError.style.display = 'block';
            elements.createIncidentSuccess.style.display = 'none';
        }
        
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Incident erstellen';
    });

    elements.refreshIncidents.addEventListener('click', function() {
        if (appState.currentTab === 'incidents') {
            loadIncidents();
        }
    });

    // Incident filters and search
    elements.statusFilter.addEventListener('change', function() {
        appState.currentFilters.status = this.value;
        filterAndSortIncidents();
    });

    elements.severityFilter.addEventListener('change', function() {
        appState.currentFilters.severity = this.value;
        filterAndSortIncidents();
    });

    elements.searchFilter.addEventListener('input', function() {
        appState.currentFilters.search = this.value;
        filterAndSortIncidents();
    });

    elements.clearFilters.addEventListener('click', function() {
        clearAllFilters();
    });

    // Add sort listeners to table headers
    document.addEventListener('click', function(e) {
        if (e.target.closest('.sortable')) {
            const header = e.target.closest('.sortable');
            const field = header.dataset.field;
            setSortField(field);
        }
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
        hideCreateIncidentModal();
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
    // Check for JWT token first (persistent login)
    const token = localStorage.getItem('jwt_token');
    if (token) {
        console.log('🔑 JWT token found, attempting to restore session...');
        
        // Try to restore session data from sessionStorage
        const savedSession = sessionStorage.getItem('simsAcSession');
        if (savedSession) {
            try {
                const session = JSON.parse(savedSession);
                if (session.isLoggedIn && session.currentUser) {
                    console.log('✅ Session restored from storage');
                    appState.isLoggedIn = true;
                    appState.currentUser = session.currentUser;
                    appState.currentTab = session.currentTab || 'grafana';
                    showDashboard();
                    switchTab(appState.currentTab);
                    return;
                }
            } catch (error) {
                console.error('Error restoring session:', error);
                sessionStorage.removeItem('simsAcSession');
            }
        }
        
        // Token exists but no session data - try to decode token for basic user info
        try {
            // Simple JWT decode (just to get username, not validating signature)
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]));
                console.log('🔍 Decoded JWT payload:', payload);
                
                // Create user from JWT claims
                const user = {
                    id: 1, // We don't have user ID in JWT, using default
                    username: payload.name || payload.sub || 'user',
                    name: payload.name || payload.sub || 'user',
                    email: `${payload.name || 'user'}@sims-ac.local`,
                    role: payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'user',
                    phone: null,
                    profileImage: null
                };
                
                // Check if token is expired
                const now = Math.floor(Date.now() / 1000);
                if (payload.exp && payload.exp < now) {
                    console.warn('JWT token is expired');
                    localStorage.removeItem('jwt_token');
                    showAuthScreen();
                    return;
                }
                
                console.log('✅ Session restored from JWT token');
                appState.isLoggedIn = true;
                appState.currentUser = user;
                showDashboard();
                return;
            }
        } catch (error) {
            console.error('Error decoding JWT token:', error);
            localStorage.removeItem('jwt_token');
        }
    }
    
    // No valid token or session - show login screen
    console.log('No valid session found, showing login screen');
    showAuthScreen();
});

// Export functions for debugging (remove in production)
window.simsApp = {
    login,
    logout,
    switchTab,
    createTestIncidents,
    uploadProfileImage,
    loadProfileImage,
    appState
};