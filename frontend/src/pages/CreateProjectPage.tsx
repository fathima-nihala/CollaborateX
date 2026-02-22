import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { createProject, clearError } from '../store/slices/projectSlice';
import { addToast } from '../store/slices/uiSlice';
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
    try {
      const result = await dispatch(createProject(data));
      if (createProject.fulfilled.match(result)) {
        dispatch(addToast({ message: 'Project created successfully', type: 'success' }));
        navigate('/dashboard');
      } else {
        dispatch(addToast({ message: 'Failed to create project', type: 'error' }));
      }
    } catch (err) {
      dispatch(addToast({ message: 'An unexpected error occurred', type: 'error' }));
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-4xl font-bold text-white tracking-tight">Create New Project</h1>
          <p className="text-slate-400 mt-2 text-lg">Initialize a new workspace and start delegating tasks today.</p>
        </div>

        <Card className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
          <CardHeader className="p-6 border-b border-white/[0.05]">
            <h2 className="text-xl font-bold text-white tracking-tight">Project Configuration</h2>
          </CardHeader>

          <CardBody className="p-6">
            {error && (
              <Alert
                type="error"
                message={error}
                onClose={() => dispatch(clearError())}
                className="mb-8"
              />
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <Input
                label="Project Name"
                placeholder="e.g., Marketing Campaign 2026"
                register={register('name', { required: 'Name is required' })}
                error={errors.name}
              />

              <TextArea
                label="Project Description"
                placeholder="Provide a high-level overview of the project objectives..."
                rows={5}
                register={register('description')}
                error={errors.description}
              />

              <div className="flex items-center gap-4 pt-4 border-t border-white/[0.08]">
                <Button type="submit" variant="primary" loading={isLoading} className="flex-1 sm:flex-none py-3 px-8">
                  Create Project
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 sm:flex-none py-3 px-8"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </Layout>
  );
};
