// src/pages/RegisterPage.tsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { register as registerUser, clearError } from '../store/slices/authSlice';
import { Input, Button, Card, CardBody, CardHeader, CardFooter, Alert } from '../components';
import { Link } from 'react-router-dom';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  // firstName: z.string().optional(),
  // lastName: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: (data) => {
      try {
        registerSchema.parse(data);
        return { values: data, errors: {} };
      } catch (err: any) {
        const errors: Record<string, any> = {};
        if (err.errors) {
          err.errors.forEach((error: any) => {
            errors[error.path[0]] = { message: error.message };
          });
        }
        return { values: {}, errors };
      }
    },
  });

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: RegisterFormData) => {
    const result = await dispatch(registerUser(data));
    if (registerUser.fulfilled.match(result)) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-1">Join CollaborateX</p>
        </CardHeader>

        <CardBody>
          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => dispatch(clearError())}
              className="mb-4"
            />
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              register={register('email')}
              error={errors.email}
            />

            <Input
              label="Username"
              type="text"
              placeholder="Your username"
              register={register('username')}
              error={errors.username}
            />

            <Input
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              register={register('password')}
              error={errors.password}
            />

            {/* <Input
              label="First Name (Optional)"
              type="text"
              placeholder="John"
              register={register('firstName')}
              error={errors.firstName}
            />

            <Input
              label="Last Name (Optional)"
              type="text"
              placeholder="Doe"
              register={register('lastName')}
              error={errors.lastName}
            /> */}

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isLoading}
              className="w-full"
            >
              Create Account
            </Button>
          </form>
        </CardBody>

        <CardFooter className="text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-semibold">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
