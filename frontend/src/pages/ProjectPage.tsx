// src/pages/ProjectPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchProject, deleteProject } from '../store/slices/projectSlice';
import { fetchTasks } from '../store/slices/taskSlice';
import { Layout, Button, Card, CardBody, CardHeader, Loading, EmptyState, Pagination, Select, Alert } from '../components';
import { TaskCard } from '../components/TaskCard';

export const ProjectPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { currentProject, isLoading: projectLoading } = useAppSelector((state) => state.projects);
  const { tasks, isLoading: tasksLoading, pagination, error } = useAppSelector((state) => state.tasks);

  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProject(projectId));
      dispatch(fetchTasks({
        projectId,
        page: 1,
        limit: 10,
        filters: {
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
        },
      }));
    }
  }, [dispatch, projectId, statusFilter, priorityFilter]);

  const handlePageChange = useCallback((page: number) => {
    if (projectId) {
      dispatch(fetchTasks({
        projectId,
        page,
        limit: 10,
        filters: {
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
        },
      }));
    }
  }, [dispatch, projectId, statusFilter, priorityFilter]);

  const handleCreateTask = () => {
    navigate(`/projects/${projectId}/tasks/new`);
  };

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'OPEN', label: 'Open' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'IN_REVIEW', label: 'In Review' },
    { value: 'COMPLETED', label: 'Completed' },
  ];

  const priorityOptions = [
    { value: '', label: 'All Priority' },
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'CRITICAL', label: 'Critical' },
  ];

  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project? All tasks and data will be permanently removed.')) {
      if (projectId) {
        await dispatch(deleteProject(projectId));
        navigate('/dashboard');
      }
    }
  };

  if (projectLoading) {
    return (
      <Layout>
        <Loading message="Loading project details..." />
      </Layout>
    );
  }

  if (!currentProject) {
    return (
      <Layout>
        <EmptyState title="Project not found" description="The project you are looking for might have been deleted or moved." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
          <div className="animate-in fade-in slide-in-from-left-4 duration-700">
            <h1 className="text-4xl font-bold text-white tracking-tight mb-2">{currentProject.name}</h1>
            <p className="text-slate-400 text-lg max-w-2xl">{currentProject.description || 'No description provided for this project.'}</p>
          </div>
          <div className="flex gap-3 animate-in fade-in slide-in-from-right-4 duration-700">
            <Button onClick={handleDeleteProject} variant="danger" className="py-2.5 px-6">
              Delete Project
            </Button>
            <Button onClick={handleCreateTask} variant="primary" className="py-2.5 px-6">
              + New Task
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <Card>
            <CardBody className="p-6">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Members</p>
              <p className="text-3xl font-bold text-white">{currentProject.members?.length || 0}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-6">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Total Tasks</p>
              <p className="text-3xl font-bold text-white">{tasks.length}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-6">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                <p className="text-lg font-semibold text-slate-200 uppercase">{currentProject.status}</p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <Card className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
        <CardHeader className="px-6 py-5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-bold text-white">Project Tasks</h2>
            <div className="flex gap-3 w-full sm:w-auto">
              <Select
                options={statusOptions}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="mb-0 flex-1"
              />
              <Select
                options={priorityOptions}
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="mb-0 flex-1"
              />
            </div>
          </div>
        </CardHeader>

        <CardBody className="p-6">
          {error && <Alert type="error" message={error} className="mb-6" />}

          {tasksLoading && tasks.length === 0 ? (
            <Loading message="Fetching tasks..." />
          ) : tasks.length === 0 ? (
            <EmptyState
              title="No tasks identified"
              description="Get started by creating your first task for this project."
              action={
                <Button onClick={handleCreateTask} variant="primary">
                  Create First Task
                </Button>
              }
            />
          ) : (
            <>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <TaskCard key={task.id} task={task} projectId={projectId!} />
                ))}
              </div>

              {pagination.pages > 1 && (
                <div className="mt-8 pt-8 border-t border-white/[0.08]">
                  <Pagination
                    page={pagination.page}
                    pages={pagination.pages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </Layout>
  );
};
