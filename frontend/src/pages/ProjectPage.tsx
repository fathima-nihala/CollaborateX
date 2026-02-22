import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchProject, deleteProject, addProjectMember, removeProjectMember } from '../store/slices/projectSlice';
import { fetchTasks } from '../store/slices/taskSlice';
import { addToast } from '../store/slices/uiSlice';
import { searchUsers } from '../store/slices/authSlice';
import { Layout, Button, Card, CardBody, CardHeader, Loading, EmptyState, Pagination, Select, Alert, Modal } from '../components';
import { TaskCard } from '../components/TaskCard';

export const ProjectPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user } = useAppSelector((state) => state.auth);
  const { currentProject, isLoading: projectLoading } = useAppSelector((state) => state.projects);
  const { tasks, isLoading: tasksLoading, pagination, error } = useAppSelector((state) => state.tasks);

  const isAdmin = currentProject?.members.find((m: any) => m.userId === user?.id)?.role === 'ADMIN';

  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Member search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedRole, setSelectedRole] = useState('USER');

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
    if (!projectId) return;
    setIsDeleting(true);
    try {
      const result = await dispatch(deleteProject(projectId));
      if (deleteProject.fulfilled.match(result)) {
        dispatch(addToast({ message: 'Project deleted successfully', type: 'success' }));
        navigate('/dashboard');
      } else {
        dispatch(addToast({ message: 'Failed to delete project', type: 'error' }));
      }
    } catch (err) {
      dispatch(addToast({ message: 'An unexpected error occurred', type: 'error' }));
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setHasSearched(false);
    try {
      const result = await dispatch(searchUsers(searchQuery));
      if (searchUsers.fulfilled.match(result)) {
        setSearchResults(result.payload);
        setHasSearched(true);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMember = async (userId: string) => {
    if (!projectId) return;
    try {
      const result = await dispatch(addProjectMember({ projectId, userId, role: selectedRole }));
      if (addProjectMember.fulfilled.match(result)) {
        dispatch(addToast({ message: 'Member added successfully', type: 'success' }));
        setSearchQuery('');
        setSearchResults([]);
      } else {
        dispatch(addToast({ message: 'Failed to add member', type: 'error' }));
      }
    } catch (err) {
      dispatch(addToast({ message: 'An unexpected error occurred', type: 'error' }));
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!projectId) return;
    try {
      const result = await dispatch(removeProjectMember({ projectId, memberId }));
      if (removeProjectMember.fulfilled.match(result)) {
        dispatch(addToast({ message: 'Member removed successfully', type: 'success' }));
      } else {
        dispatch(addToast({ message: 'Failed to remove member', type: 'error' }));
      }
    } catch (err) {
      dispatch(addToast({ message: 'An unexpected error occurred', type: 'error' }));
    }
  };

  const handleCloseMembersModal = () => {
    setIsMembersModalOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
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
            {isAdmin && (
              <>
                <Button onClick={() => setIsMembersModalOpen(true)} variant="secondary" className="py-2.5 px-6">
                  Manage Members
                </Button>
                <Button onClick={() => setIsDeleteModalOpen(true)} variant="danger" className="py-2.5 px-6">
                  Delete Project
                </Button>
                <Button onClick={handleCreateTask} variant="primary" className="py-2.5 px-6">
                  + New Task
                </Button>
              </>
            )}
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

      {/* Delete Project Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Project"
        confirmLabel="Delete Project"
        onConfirm={handleDeleteProject}
        variant="danger"
        isLoading={isDeleting}
      >
        Are you sure you want to delete <span className="text-white font-bold">{currentProject.name}</span>?
        All associated tasks and data will be permanently removed. This action cannot be undone.
      </Modal>

      {/* Manage Members Modal */}
      <Modal
        isOpen={isMembersModalOpen}
        onClose={handleCloseMembersModal}
        title="Manage Project Members"
        cancelLabel="Close"
      >
        <div className="space-y-6">
          {/* Current Members */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Current Members</h4>
            <div className="space-y-2">
              {currentProject.members?.map((member: any) => (
                <div key={member.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white uppercase">
                      {member.user.username[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{member.user.username}</p>
                      <p className="text-[10px] text-slate-500">{member.role}</p>
                    </div>
                  </div>
                  {isAdmin && member.userId !== user?.id && (
                    <Button
                      onClick={() => handleRemoveMember(member.userId)}
                      variant="danger"
                      size="sm"
                      className="py-1 px-3 text-[10px]"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-white/[0.05]" />

          {/* Add New Member */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Add New Member</h4>
            <div className="flex gap-2 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by username or email..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchUsers()}
                />
              </div>
              <Button onClick={handleSearchUsers} loading={isSearching} className="py-2">Search</Button>
            </div>

            {searchResults.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                  <span className="text-xs font-bold text-slate-400">Assign Role:</span>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="bg-transparent text-xs font-bold text-indigo-400 outline-none cursor-pointer"
                  >
                    <option value="USER">Member</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {searchResults.map((user) => {
                    const isAlreadyMember = currentProject.members?.some((m: any) => m.userId === user.id);
                    return (
                      <div key={user.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 uppercase">
                            {user.username[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{user.username}</p>
                            <p className="text-[10px] text-slate-500">{user.email}</p>
                          </div>
                        </div>
                        {isAlreadyMember ? (
                          <span className="text-[10px] font-bold text-slate-500 uppercase px-2 py-1 bg-slate-800 rounded-md">Member</span>
                        ) : (
                          <Button onClick={() => handleAddMember(user.id)} size="sm" variant="primary">Add</Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : hasSearched && (
              <div className="p-8 text-center rounded-xl bg-white/[0.02] border border-dashed border-white/10">
                <p className="text-sm text-slate-400">No users found matching <span className="text-white font-semibold">"{searchQuery}"</span></p>
                <p className="text-[10px] text-slate-500 mt-1">Make sure the username or email is correct.</p>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </Layout>
  );
};
