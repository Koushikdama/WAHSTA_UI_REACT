
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import AuthLayout from './AuthLayout';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useApp();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) return;

        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            login();
            navigate('/chats');
            setIsLoading(false);
        }, 1000);
    };

    return (
        <AuthLayout title="Welcome Back" subtitle="Log in to your Aura account to continue connecting.">
            <form onSubmit={handleLogin} className="flex flex-col gap-6">
                
                {/* Email Input */}
                <div className="relative border-b border-wa-teal py-2 group">
                    <div className="absolute left-0 top-3 text-gray-500 dark:text-gray-400 group-focus-within:text-wa-teal transition-colors">
                        <Mail size={20} />
                    </div>
                    <input 
                        type="email" 
                        placeholder="Email Address" 
                        className="w-full pl-8 outline-none bg-transparent text-[#111b21] dark:text-gray-100 placeholder:text-gray-400 py-1 font-medium"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoFocus
                    />
                </div>

                {/* Password Input */}
                <div className="relative border-b border-wa-teal py-2 group">
                    <div className="absolute left-0 top-3 text-gray-500 dark:text-gray-400 group-focus-within:text-wa-teal transition-colors">
                        <Lock size={20} />
                    </div>
                    <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Password" 
                        className="w-full pl-8 pr-8 outline-none bg-transparent text-[#111b21] dark:text-gray-100 placeholder:text-gray-400 py-1 font-medium"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-3 text-gray-500 dark:text-gray-400 hover:text-wa-teal transition-colors"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>

                <div className="flex justify-end">
                    <button type="button" className="text-xs text-wa-teal font-bold hover:underline tracking-wide">
                        Forgot Password?
                    </button>
                </div>

                <button 
                    type="submit" 
                    disabled={!email || !password || isLoading}
                    className={`w-full py-3.5 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 mt-4 shadow-lg
                        ${!email || !password || isLoading 
                            ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-wa-teal to-teal-500 hover:shadow-xl active:scale-[0.98]'}
                    `}
                >
                    {isLoading ? 'Authenticating...' : 'Log In'}
                </button>

                <div className="mt-4 text-center">
                    <p className="text-sm text-[#667781] dark:text-gray-400">
                        New to Aura? <span onClick={() => navigate('/signup')} className="text-wa-teal font-bold cursor-pointer hover:underline">Create Account</span>
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
};

export default Login;
