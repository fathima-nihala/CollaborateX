import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import type { TasksState, Task } from '../../types';
import apiClient from '../../api/client';

interface ApiErrorResponse {
  message: string;
}

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    return axiosError.response?.data?.message || axiosError.message || 'An error occurred';
  }
  return 'An error occurred';
};

const initialState: TasksState = {
  tasks: [],
  currentTask: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  filters: {},
};

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (
    {
      projectId,
      page = 1,
      limit = 10,
      filters = {},
    }: {
      projectId: string;
      page?: number;
      limit?: number;
      filters?: { status?: string; priority?: string; assignedToId?: string };
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.getTasks(projectId, page, limit, filters);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchTask = createAsyncThunk(
  'tasks/fetchTask',
  async ({ projectId, taskId }: { projectId: string; taskId: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.getTask(projectId, taskId);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (
    {
      projectId,
      title,
      description,
      priority,
      assignedToId,
      dueDate,
    }: {
      projectId: string;
      title: string;
      description?: string;
      priority?: string;
      assignedToId?: string;
      dueDate?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.createTask(
        projectId,
        title,
        description,
        priority,
        assignedToId,
        dueDate
      );
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async (
    { projectId, taskId, data }: { projectId: string; taskId: string; data: Record<string, unknown> },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.updateTask(projectId, taskId, data);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async ({ projectId, taskId }: { projectId: string; taskId: string }, { rejectWithValue }) => {
    try {
      await apiClient.deleteTask(projectId, taskId);
      return taskId;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Tasks
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload.data;
        state.pagination = action.payload.pageInfo;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Task
    builder
      .addCase(fetchTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.isLoading = false;
        state.currentTask = action.payload;
      })
      .addCase(fetchTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Task
    builder
      .addCase(createTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.isLoading = false;
        state.tasks.unshift(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Task
    builder
      .addCase(updateTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.isLoading = false;
        const index = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?.id === action.payload.id) {
          state.currentTask = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Task
    builder
      .addCase(deleteTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.tasks = state.tasks.filter((t) => t.id !== action.payload);
        if (state.currentTask?.id === action.payload) {
          state.currentTask = null;
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentTask, setFilters } = taskSlice.actions;
export default taskSlice.reducer;
