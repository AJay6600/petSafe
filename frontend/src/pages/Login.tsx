import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input, Button, Alert } from 'antd';
import { Mail, Lock, LogIn, ShieldAlert } from 'lucide-react';
import { LoginPayload } from '../api/auth';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginPayload>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginPayload) => {
    setErrorMsg(null);
    setSubmitting(true);
    try {
      await login(data);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-2xl mx-auto mb-3">
            🐾
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Welcome Back to PetSafe</h2>
          <p className="text-xs text-slate-400">Log in to manage your pets and receive finder notifications</p>
        </div>

        {errorMsg && (
          <Alert
            message="Authentication Error"
            description={errorMsg}
            type="error"
            showIcon
            icon={<ShieldAlert className="w-5 h-5 text-rose-400" />}
            className="bg-rose-500/10 border-rose-500/30 text-rose-200 text-xs rounded-xl"
          />
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <Controller
              name="email"
              control={control}
              rules={{
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Enter a valid email address' },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  prefix={<Mail className="w-4 h-4 text-slate-500 mr-2" />}
                  placeholder="name@example.com"
                  size="large"
                  className="bg-slate-900 border-slate-800 text-white rounded-xl hover:border-emerald-500 focus:border-emerald-500"
                />
              )}
            />
            {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <Controller
              name="password"
              control={control}
              rules={{ required: 'Password is required' }}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  prefix={<Lock className="w-4 h-4 text-slate-500 mr-2" />}
                  placeholder="••••••••"
                  size="large"
                  className="bg-slate-900 border-slate-800 text-white rounded-xl hover:border-emerald-500 focus:border-emerald-500"
                />
              )}
            />
            {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password.message}</p>}
          </div>

          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            icon={<LogIn className="w-4 h-4 inline mr-1" />}
            block
            size="large"
            className="bg-emerald-600 hover:bg-emerald-500 border-none rounded-xl font-medium mt-2 text-sm h-11"
          >
            Log In
          </Button>
        </form>

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-900">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-400 font-semibold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
