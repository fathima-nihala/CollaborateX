// src/components/TaskCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import type { Task } from '../types';
import { Card, CardBody } from './Card';

interface TaskCardProps {
  task: Task;
  projectId: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, projectId }) => {
  const statusStyles = {
    OPEN: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    IN_PROGRESS: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    IN_REVIEW: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    ARCHIVED: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  const priorityStyles = {
    LOW: 'text-indigo-400',
    MEDIUM: 'text-blue-400',
    HIGH: 'text-orange-400',
    CRITICAL: 'text-red-400',
  };

  return (
    <Link to={`/projects/${projectId}/tasks/${task.id}`}>
      <Card hoverable className="transition-all duration-300 transform hover:-translate-y-1">
        <CardBody className="p-5">
          <div className="flex justify-between items-start mb-3 gap-4">
            <h4 className="font-bold text-white text-lg tracking-tight flex-1 leading-tight">{task.title}</h4>
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${statusStyles[task.status]}`}>
              {task.status.replace(/_/g, ' ')}
            </span>
          </div>

          <p className="text-slate-400 text-sm mb-5 line-clamp-2 leading-relaxed">{task.description || 'No description provided'}</p>

          <div className="flex items-center justify-between pt-4 border-t border-white/[0.05]">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-tighter mb-0.5">Priority</span>
                <span className={`text-xs font-bold ${priorityStyles[task.priority]}`}>
                  {task.priority}
                </span>
              </div>

              {task.dueDate && (
                <div className="flex flex-col border-l border-white/[0.08] pl-4">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-tighter mb-0.5">Due Date</span>
                  <span className="text-xs text-slate-300 font-medium">
                    {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              )}
            </div>

            {task.assignedTo && (
              <div className="flex items-center gap-2 bg-white/[0.05] py-1 px-2.5 rounded-full border border-white/[0.08]">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                  {task.assignedTo.username[0].toUpperCase()}
                </div>
                <span className="text-[10px] text-slate-300 font-bold tracking-tight">@{task.assignedTo.username}</span>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </Link>
  );
};
