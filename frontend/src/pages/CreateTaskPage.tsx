// src/pages/CreateTaskPage.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { createTask, clearError } from '../store/slices/taskSlice';
import { Layout, Button, Card, CardBody, CardHeader, Input, TextArea, Select, Alert } from '../components';

interface CreateTaskForm {
  title: string;
  description: string;
  priority: string;
  dueDate: string;
}

export const CreateTaskPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { isLoading, error } = useAppSelector((state) => state.tasks);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTaskForm>({
    defaultValues: {
      priority: 'MEDIUM',
    },
  });

  const onSubmit = async (data: CreateTaskForm) => {
    if (!projectId) return;

    const result = await dispatch(
      createTask({
        projectId,
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: data.dueDate,
      })
    );

    if (createTask.fulfilled.match(result)) {
      navigate(`/projects/${projectId}`);
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Task</h1>
        <p className="text-gray-600 mt-1">Add a task to your project</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Task Details</h2>
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
              label="Task Title"
              placeholder="What needs to be done?"
              register={register('title', { required: 'Title is required' })}
              error={errors.title}
            />

            <TextArea
              label="Description"
              placeholder="Provide more details about this task"
              rows={4}
              register={register('description')}
              error={errors.description}
            />

            <Select
              label="Priority"
              options={[
                { value: 'LOW', label: 'Low' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'HIGH', label: 'High' },
                { value: 'CRITICAL', label: 'Critical' },
              ]}
              register={register('priority')}
              error={errors.priority}
            />

            <Input
              label="Due Date"
              type="datetime-local"
              register={register('dueDate')}
              error={errors.dueDate}
            />

            <div className="flex gap-4">
              <Button type="submit" variant="primary" size="md" loading={isLoading}>
                Create Task
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => navigate(`/projects/${projectId}`)}
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
