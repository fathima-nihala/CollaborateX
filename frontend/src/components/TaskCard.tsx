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
  const statusColors = {
    OPEN: 'bg-gray-100 text-gray-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    IN_REVIEW: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
    ARCHIVED: 'bg-gray-200 text-gray-700',
  };

  const priorityColors = {
    LOW: 'text-blue-600',
    MEDIUM: 'text-gray-600',
    HIGH: 'text-orange-600',
    CRITICAL: 'text-red-600',
  };

  return (
    <Link to={`/projects/${projectId}/tasks/${task.id}`}>
      <Card hoverable>
        <CardBody>
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-gray-900 flex-1">{task.title}</h4>
            <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[task.status]}`}>
              {task.status.replace(/_/g, ' ')}
            </span>
          </div>

          <p className="text-gray-600 text-sm mb-3">{task.description}</p>

          <div className="flex items-center justify-between text-xs">
            <div className="flex gap-3">
              <span className={`font-semibold ${priorityColors[task.priority]}`}>
                {task.priority}
              </span>
              {task.dueDate && (
                <span className="text-gray-500">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
            {task.assignedTo && (
              <span className="text-gray-500">@{task.assignedTo.username}</span>
            )}
          </div>
        </CardBody>
      </Card>
    </Link>
  );
};
