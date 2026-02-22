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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Project Dashboard</h1>
          <p className="text-slate-400 mt-2 text-lg">Manage your team's projects and track progress efficiently.</p>
        </div>
        <Button onClick={handleCreateProject} variant="primary" className="py-3 px-8">
          + New Project
        </Button>
      </div>

      {isLoading && projects.length === 0 ? (
        <Loading message="Fetching your workspace projects..." />
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects found"
          description="Ready to start something new? Create your first project today."
          action={
            <Button onClick={handleCreateProject} variant="primary" className="px-10">
              Create Project
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {projects.map((project) => (
              <Card key={project.id} hoverable className="h-full flex flex-col group overflow-hidden">
                <CardHeader className="p-6 border-b border-white/[0.05]">
                  <Link to={`/projects/${project.id}`}>
                    <h3 className="text-xl font-bold text-white group-hover:text-primary-400 transition-colors tracking-tight leading-tight">
                      {project.name}
                    </h3>
                  </Link>
                </CardHeader>
                <CardBody className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed line-clamp-3">
                      {project.description || 'This project has no detailed description provided yet.'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-6 border-t border-white/[0.05]">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].slice(0, project.members?.length || 0).map((_, i) => (
                          <div key={i} className="w-7 h-7 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
                            👤
                          </div>
                        ))}
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter">
                        {project.members?.length || 0} Members
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20">
                      <span className="text-[11px] font-bold text-primary-400 tracking-tighter">
                        {project.tasks?.length || 0} TASKS
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="mt-12 pt-8 border-t border-white/[0.08]">
              <Pagination
                page={pagination.page}
                pages={pagination.pages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </Layout>
  );
};
