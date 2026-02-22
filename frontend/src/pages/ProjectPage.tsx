// src/pages/ProjectPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchProject } from '../store/slices/projectSlice';
import { fetchTasks } from '../store/slices/taskSlice';
import { Layout, Button, Card, CardBody, CardHeader, Loading, EmptyState, Pagination, Select,Alert } from '../components';
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

  if (projectLoading) {
    return (
      <Layout>
        <Loading message="Loading project..." />
      </Layout>
    );
  }

  if (!currentProject) {
    return (
      <Layout>
        <EmptyState title="Project not found" />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{currentProject.name}</h1>
            <p className="text-gray-600 mt-1">{currentProject.description || 'No description'}</p>
          </div>
          <Button onClick={handleCreateTask} variant="primary" size="lg">
            + New Task
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardBody>
              <p className="text-gray-600 text-sm">Members</p>
              <p className="text-2xl font-bold text-gray-900">{currentProject.members?.length || 0}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-gray-600 text-sm">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
            </CardBody>
          </Card>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
            <div className="flex gap-3">
              <Select
                options={statusOptions}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              />
              <Select
                options={priorityOptions}
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardBody>
          {error && <Alert type="error" message={error} />}

          {tasksLoading && tasks.length === 0 ? (
            <Loading message="Loading tasks..." />
          ) : tasks.length === 0 ? (
            <EmptyState
              title="No tasks yet"
              description="Create your first task to get started"
              action={
                <Button onClick={handleCreateTask} variant="primary">
                  New Task
                </Button>
              }
            />
          ) : (
            <>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <TaskCard key={task.id} task={task} projectId={projectId!} />
                ))}
              </div>

              {pagination.pages > 1 && (
                <Pagination
                  page={pagination.page}
                  pages={pagination.pages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </CardBody>
      </Card>
    </Layout>
  );
};
