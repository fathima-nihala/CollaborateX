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
        data: {
          ...data,
          dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
        },
      })
    );

    if (updateTask.fulfilled.match(result)) {
      navigate(`/projects/${projectId}`);
    }
  };

  const handleDelete = async () => {
    if (!projectId || !taskId) return;
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      const result = await dispatch(deleteTask({ projectId, taskId }));
      if (deleteTask.fulfilled.match(result)) {
        navigate(`/projects/${projectId}`);
      }
    }
  };

  if (isLoading && !currentTask) {
    return (
      <Layout>
        <Loading message="Fetching task details..." />
      </Layout>
    );
  }

  if (!currentTask) {
    return (
      <Layout>
        <EmptyState title="Task not found" description="The task you are looking for might have been deleted or moved." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Manage Task</h1>
            <p className="text-slate-400 mt-2 text-lg">Modify attributes and track task lifecycle.</p>
          </div>
          <Button onClick={handleDelete} variant="danger" className="py-2.5 px-6 sm:w-auto w-full">
            Delete Task
          </Button>
        </div>

        <Card className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100 mb-10">
          <CardHeader className="p-6 border-b border-white/[0.05]">
            <h2 className="text-xl font-bold text-white tracking-tight leading-tight">
              {currentTask.title}
            </h2>
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
                label="Task Title"
                register={register('title', { required: 'Title is required' })}
                error={errors.title}
              />

              <TextArea
                label="Task Description"
                rows={5}
                register={register('description')}
                error={errors.description}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                    { value: 'LOW', label: 'Low - Low impact' },
                    { value: 'MEDIUM', label: 'Medium - Normal priority' },
                    { value: 'HIGH', label: 'High - Important' },
                    { value: 'CRITICAL', label: 'Critical - Immediate' },
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
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-white/[0.08]">
                <Button type="submit" variant="primary" loading={isLoading} className="flex-1 sm:flex-none py-3 px-8">
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate(`/projects/${projectId}`)}
                  className="flex-1 sm:flex-none py-3 px-8"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardBody>
          <div className="p-6 bg-white/[0.02] border-t border-white/[0.05] rounded-b-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1.5">Created By</p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white">
                    {currentTask.createdBy.username[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-slate-300 font-semibold">@{currentTask.createdBy.username}</span>
                </div>
              </div>

              {currentTask.assignedTo && (
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1.5">Assigned To</p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center text-[10px] font-bold text-primary-400 border border-primary-500/30">
                      {currentTask.assignedTo.username[0].toUpperCase()}
                    </div>
                    <span className="text-sm text-slate-300 font-semibold">@{currentTask.assignedTo.username}</span>
                  </div>
                </div>
              )}

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1.5">Created Date</p>
                <span className="text-sm text-slate-300 font-semibold">
                  {new Date(currentTask.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};
