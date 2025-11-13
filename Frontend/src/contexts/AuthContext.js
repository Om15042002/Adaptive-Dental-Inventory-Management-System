import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Check if user is authenticated on app start
    useEffect(() => {
        const checkAuth = async () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (storedToken && storedUser) {
                try {
                    // Verify token with backend
                    const response = await fetch('http://localhost:3000/api/auth/profile', {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${storedToken}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setUser(data.data);
                        setToken(storedToken);
                    } else {
                        // Token is invalid
                        logout();
                    }
                } catch (error) {
                    console.error('Auth check failed:', error);
                    logout();
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (username, password) => {
        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                const { user: userData, token: userToken } = data.data;
                
                setUser(userData);
                setToken(userToken);
                
                // Store in localStorage
                localStorage.setItem('token', userToken);
                localStorage.setItem('user', JSON.stringify(userData));
                
                toast.success(data.message || 'Login successful!');
                return { success: true };
            } else {
                toast.error(data.message || 'Login failed');
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Network error. Please try again.');
            return { success: false, message: 'Network error' };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.info('You have been logged out');
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const isAuthenticated = () => {
        return user && token;
    };

    const isAdmin = () => {
        return user && user.role === 'admin';
    };

    const isStaff = () => {
        return user && (user.role === 'staff' || user.role === 'admin');
    };

    const value = {
        user,
        token,
        loading,
        login,
        logout,
        updateUser,
        isAuthenticated,
        isAdmin,
        isStaff,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};