import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { createTask, clearError } from '../store/slices/taskSlice';
import { fetchProject } from '../store/slices/projectSlice';
import { addToast } from '../store/slices/uiSlice';
import { Layout, Button, Card, CardBody, CardHeader, Input, TextArea, Select, Alert } from '../components';

interface CreateTaskForm {
  title: string;
  description: string;
  priority: string;
  dueDate: string;
  assignedToId?: string;
}

export const CreateTaskPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user } = useAppSelector((state) => state.auth);
  const { isLoading, error } = useAppSelector((state) => state.tasks);
  const { currentProject } = useAppSelector((state) => state.projects);

  const isAdmin = currentProject?.members.find((m: any) => m.userId === user?.id)?.role === 'ADMIN';

  useEffect(() => {
    if (projectId && (!currentProject || currentProject.id !== projectId)) {
      dispatch(fetchProject(projectId));
    }
  }, [dispatch, projectId, currentProject]);

  useEffect(() => {
    if (currentProject && !isAdmin) {
      dispatch(addToast({ message: 'Only admins can create tasks', type: 'error' }));
      navigate(`/projects/${projectId}`);
    }
  }, [currentProject, isAdmin, navigate, projectId, dispatch]);

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

    try {
      const result = await dispatch(
        createTask({
          projectId,
          title: data.title,
          description: data.description,
          priority: data.priority,
          assignedToId: data.assignedToId || undefined,
          dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
        })
      );

      if (createTask.fulfilled.match(result)) {
        dispatch(addToast({ message: 'Task created successfully', type: 'success' }));
        navigate(`/projects/${projectId}`);
      } else {
        dispatch(addToast({ message: 'Failed to create task', type: 'error' }));
      }
    } catch (err) {
      dispatch(addToast({ message: 'An unexpected error occurred', type: 'error' }));
    }
  };

  const memberOptions = [
    { value: '', label: 'Unassigned' },
    ...(currentProject?.members?.map((m: any) => ({
      value: m.user.id,
      label: `@${m.user.username}`,
    })) || []),
  ];

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center border border-primary-500/20">
              <svg className="w-6 h-6 text-primary-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Create New Task</h1>
              <p className="text-slate-400 mt-1">Add a high-priority task to your project</p>
            </div>
          </div>
        </div>

        <Card className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
          <CardHeader>
            <h2 className="text-lg font-semibold text-white">Task Details</h2>
          </CardHeader>

          <CardBody>
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
                placeholder="e.g., Implement dark mode"
                register={register('title', { required: 'Title is required' })}
                error={errors.title}
              />

              <TextArea
                label="Description"
                placeholder="Provide a detailed overview of the task requirements..."
                rows={4}
                register={register('description')}
                error={errors.description}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Select
                  label="Assign To"
                  options={memberOptions}
                  register={register('assignedToId')}
                  error={errors.assignedToId}
                />

                <Select
                  label="Priority"
                  options={[
                    { value: 'LOW', label: 'Low - Minimal impact' },
                    { value: 'MEDIUM', label: 'Medium - Normal priority' },
                    { value: 'HIGH', label: 'High - Important' },
                    { value: 'CRITICAL', label: 'Critical - Immediate action' },
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
                  Create Task
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
        </Card>
      </div>
    </Layout>
  );
};
