// src/pages/CreateProjectPage.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { createProject, clearError } from '../store/slices/projectSlice';
import { Layout, Button, Card, CardBody, CardHeader, Input, TextArea, Alert } from '../components';

interface CreateProjectForm {
  name: string;
  description: string;
}

export const CreateProjectPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.projects);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProjectForm>();

  const onSubmit = async (data: CreateProjectForm) => {
    const result = await dispatch(createProject(data));
    if (createProject.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
        <p className="text-gray-600 mt-1">Start a new project and invite your team</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Project Details</h2>
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
              label="Project Name"
              placeholder="My Awesome Project"
              register={register('name', { required: 'Name is required' })}
              error={errors.name}
            />

            <TextArea
              label="Description"
              placeholder="What is this project about?"
              rows={4}
              register={register('description')}
              error={errors.description}
            />

            <div className="flex gap-4">
              <Button type="submit" variant="primary" size="md" loading={isLoading}>
                Create Project
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </Layout>
  );
};
