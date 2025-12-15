
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { Camera, Lock, Eye, EyeOff } from 'lucide-react';

const Signup = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && email && password) {
            // Navigate to verification
            navigate('/verify-otp', { state: { email, name } });
        }
    };

    return (
        <AuthLayout title="Create your account" subtitle="Please fill in your details to get started.">
            <form onSubmit={handleNext} className="flex flex-col gap-5">
                
                {/* Avatar Placeholder */}
                <div className="flex justify-center mb-2">
                    <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity relative">
                        <Camera size={32} className="text-gray-400" />
                        <div className="absolute bottom-0 right-0 bg-wa-teal p-1.5 rounded-full border-2 border-white dark:border-wa-dark-paper">
                            <span className="text-white text-xs font-bold">+</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className="text-xs font-medium text-wa-teal mb-1 block">Full Name</label>
                        <input 
                            type="text" 
                            placeholder="John Doe" 
                            className="w-full border-b border-gray-300 dark:border-gray-600 focus:border-wa-teal bg-transparent py-2 outline-none text-[#111b21] dark:text-gray-100 transition-colors"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="text-xs font-medium text-wa-teal mb-1 block">Email Address</label>
                        <input 
                            type="email" 
                            placeholder="john@example.com" 
                            className="w-full border-b border-gray-300 dark:border-gray-600 focus:border-wa-teal bg-transparent py-2 outline-none text-[#111b21] dark:text-gray-100 transition-colors"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <label className="text-xs font-medium text-wa-teal mb-1 block">Password</label>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Create a password" 
                            className="w-full border-b border-gray-300 dark:border-gray-600 focus:border-wa-teal bg-transparent py-2 outline-none text-[#111b21] dark:text-gray-100 transition-colors pr-8"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-0 bottom-2 text-gray-500 dark:text-gray-400 hover:text-wa-teal"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={!name || !email || !password}
                    className={`w-full py-3 rounded-full font-bold text-white transition-all mt-6
                        ${!name || !email || !password ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed' : 'bg-wa-teal hover:bg-wa-tealDark shadow-md active:scale-95'}
                    `}
                >
                    Next
                </button>

                <div className="text-center">
                    <p className="text-sm text-[#667781] dark:text-gray-400">
                        Already have an account? <span onClick={() => navigate('/login')} className="text-wa-teal font-medium cursor-pointer hover:underline">Log in</span>
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
};

export default Signup;
