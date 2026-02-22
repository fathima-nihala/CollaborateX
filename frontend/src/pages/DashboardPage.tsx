// src/pages/DashboardPage.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchProjects } from '../store/slices/projectSlice';
import { Layout, Button, Card, CardBody, CardHeader, Loading, EmptyState, Pagination } from '../components';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { projects, isLoading, pagination } = useAppSelector((state) => state.projects);

  useEffect(() => {
    dispatch(fetchProjects({ page: 1, limit: 10 }));
  }, [dispatch]);

  const handlePageChange = (page: number) => {
    dispatch(fetchProjects({ page, limit: 10 }));
  };

  const handleCreateProject = () => {
    navigate('/projects/new');
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your projects and tasks</p>
        </div>
        <Button onClick={handleCreateProject} variant="primary" size="lg">
          + New Project
        </Button>
      </div>

      {isLoading && projects.length === 0 ? (
        <Loading message="Loading your projects..." />
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to get started"
          action={
            <Button onClick={handleCreateProject} variant="primary">
              Create Project
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} hoverable>
                <CardHeader>
                  <Link to={`/projects/${project.id}`}>
                    <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                      {project.name}
                    </h3>
                  </Link>
                </CardHeader>
                <CardBody>
                  <p className="text-gray-600 text-sm mb-4">{project.description || 'No description'}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{project.members?.length || 0} members</span>
                    <span>{project.tasks?.length || 0} tasks</span>
                  </div>
                </CardBody>
              </Card>
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
    </Layout>
  );
};
