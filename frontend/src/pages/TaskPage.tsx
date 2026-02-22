// src/pages/TaskPage.tsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchTask, updateTask, deleteTask, clearError } from '../store/slices/taskSlice';
import { Layout, Button, Card, CardBody, CardHeader, Input, TextArea, Select, Alert, Loading, EmptyState } from '../components';

interface TaskFormData {
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
}

export const TaskPage: React.FC = () => {
  const { projectId, taskId } = useParams<{ projectId: string; taskId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { currentTask, isLoading, error } = useAppSelector((state) => state.tasks);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TaskFormData>();

  useEffect(() => {
    if (projectId && taskId) {
      dispatch(fetchTask({ projectId, taskId }));
    }
  }, [dispatch, projectId, taskId]);

  useEffect(() => {
    if (currentTask) {
      reset({
        title: currentTask.title,
        description: currentTask.description,
        status: currentTask.status,
        priority: currentTask.priority,
        dueDate: currentTask.dueDate ? new Date(currentTask.dueDate).toISOString().slice(0, 16) : '',
      });
    }
  }, [currentTask, reset]);

  const onSubmit = async (data: TaskFormData) => {
    if (!projectId || !taskId) return;

    const result = await dispatch(
      updateTask({
        projectId,
        taskId,
        data,
      })
    );

    if (updateTask.fulfilled.match(result)) {
      navigate(`/projects/${projectId}`);
    }
  };

  const handleDelete = async () => {
    if (!projectId || !taskId) return;
    if (window.confirm('Are you sure you want to delete this task?')) {
      const result = await dispatch(deleteTask({ projectId, taskId }));
      if (deleteTask.fulfilled.match(result)) {
        navigate(`/projects/${projectId}`);
      }
    }
  };

  if (isLoading && !currentTask) {
    return (
      <Layout>
        <Loading message="Loading task..." />
      </Layout>
    );
  }

  if (!currentTask) {
    return (
      <Layout>
        <EmptyState title="Task not found" />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Task</h1>
          <p className="text-gray-600 mt-1">Update task details</p>
        </div>
        <Button onClick={handleDelete} variant="danger" size="md">
          Delete Task
        </Button>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">{currentTask.title}</h2>
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
              label="Title"
              register={register('title', { required: 'Title is required' })}
              error={errors.title}
            />

            <TextArea
              label="Description"
              rows={4}
              register={register('description')}
              error={errors.description}
            />

            <Select
              label="Status"
              options={[
                { value: 'OPEN', label: 'Open' },
                { value: 'IN_PROGRESS', label: 'In Progress' },
                { value: 'IN_REVIEW', label: 'In Review' },
                { value: 'COMPLETED', label: 'Completed' },
                { value: 'ARCHIVED', label: 'Archived' },
              ]}
              register={register('status')}
              error={errors.status}
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
                Save Changes
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

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Created by:</strong> {currentTask.createdBy.username}
            </p>
            {currentTask.assignedTo && (
              <p className="text-sm text-gray-600">
                <strong>Assigned to:</strong> {currentTask.assignedTo.username}
              </p>
            )}
            <p className="text-sm text-gray-600">
              <strong>Created:</strong> {new Date(currentTask.createdAt).toLocaleString()}
            </p>
          </div>
        </CardBody>
      </Card>
    </Layout>
  );
};
