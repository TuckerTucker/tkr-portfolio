import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Play,
  Eye,
  Code,
  Plus,
  GripVertical,
  ArrowRight,
  FileText,
  Brain,
  RefreshCw,
  CheckCircle,
  Circle,
  Clock
} from 'lucide-react';

// Sample markdown content that gets converted to JSON
const sampleMarkdown = `# Project Tasks

## To Do
- [ ] Set up development environment
- [ ] Design system architecture
- [ ] Create user authentication flow
- [ ] Implement basic UI components

## In Progress
- [x] Research competitor analysis (assigned: Sarah, due: 2024-09-25)
- [x] Database schema design (assigned: Mike, due: 2024-09-24)

## Done
- [x] Initial project setup completed
- [x] Team kickoff meeting conducted
- [x] Requirements gathering finished`;

// Converted JSON structure
const sampleTasksJson = {
  "project": "AI Task Management Demo",
  "columns": [
    {
      "id": "todo",
      "title": "To Do",
      "tasks": [
        {
          "id": "task-1",
          "title": "Set up development environment",
          "status": "todo",
          "priority": "high",
          "assignee": null,
          "dueDate": null,
          "createdAt": "2024-09-23T10:00:00Z"
        },
        {
          "id": "task-2",
          "title": "Design system architecture",
          "status": "todo",
          "priority": "high",
          "assignee": null,
          "dueDate": null,
          "createdAt": "2024-09-23T10:15:00Z"
        },
        {
          "id": "task-3",
          "title": "Create user authentication flow",
          "status": "todo",
          "priority": "medium",
          "assignee": null,
          "dueDate": null,
          "createdAt": "2024-09-23T10:30:00Z"
        },
        {
          "id": "task-4",
          "title": "Implement basic UI components",
          "status": "todo",
          "priority": "medium",
          "assignee": null,
          "dueDate": null,
          "createdAt": "2024-09-23T10:45:00Z"
        }
      ]
    },
    {
      "id": "inprogress",
      "title": "In Progress",
      "tasks": [
        {
          "id": "task-5",
          "title": "Research competitor analysis",
          "status": "inprogress",
          "priority": "medium",
          "assignee": "Sarah",
          "dueDate": "2024-09-25",
          "createdAt": "2024-09-23T09:00:00Z"
        },
        {
          "id": "task-6",
          "title": "Database schema design",
          "status": "inprogress",
          "priority": "high",
          "assignee": "Mike",
          "dueDate": "2024-09-24",
          "createdAt": "2024-09-23T08:30:00Z"
        }
      ]
    },
    {
      "id": "done",
      "title": "Done",
      "tasks": [
        {
          "id": "task-7",
          "title": "Initial project setup completed",
          "status": "done",
          "priority": "high",
          "assignee": "Team",
          "dueDate": null,
          "completedAt": "2024-09-22T16:00:00Z",
          "createdAt": "2024-09-22T09:00:00Z"
        },
        {
          "id": "task-8",
          "title": "Team kickoff meeting conducted",
          "status": "done",
          "priority": "medium",
          "assignee": "Team",
          "dueDate": null,
          "completedAt": "2024-09-22T14:00:00Z",
          "createdAt": "2024-09-22T10:00:00Z"
        },
        {
          "id": "task-9",
          "title": "Requirements gathering finished",
          "status": "done",
          "priority": "high",
          "assignee": "Product Team",
          "dueDate": null,
          "completedAt": "2024-09-23T12:00:00Z",
          "createdAt": "2024-09-23T08:00:00Z"
        }
      ]
    }
  ],
  "metadata": {
    "totalTasks": 9,
    "completedTasks": 3,
    "inProgressTasks": 2,
    "todoTasks": 4,
    "lastUpdated": "2024-09-23T15:00:00Z"
  }
};

const TaskBoardAIDemo = ({ className = "" }) => {
  const [currentView, setCurrentView] = useState('human'); // 'human' or 'ai'
  const [tasks, setTasks] = useState(sampleTasksJson);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [showMarkdown, setShowMarkdown] = useState(false);

  // Handle drag start
  const handleDragStart = (e, task, fromColumn) => {
    setDraggedTask({ task, fromColumn });
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  // Handle drop
  const handleDrop = (e, toColumnId) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!draggedTask || draggedTask.fromColumn === toColumnId) return;

    // Create new tasks state with moved task
    const newTasks = { ...tasks };

    // Remove task from original column
    const fromColumn = newTasks.columns.find(col => col.id === draggedTask.fromColumn);
    fromColumn.tasks = fromColumn.tasks.filter(t => t.id !== draggedTask.task.id);

    // Add task to new column
    const toColumn = newTasks.columns.find(col => col.id === toColumnId);
    const updatedTask = {
      ...draggedTask.task,
      status: toColumnId,
      ...(toColumnId === 'done' && { completedAt: new Date().toISOString() })
    };
    toColumn.tasks.push(updatedTask);

    // Update metadata
    newTasks.metadata.todoTasks = newTasks.columns.find(col => col.id === 'todo').tasks.length;
    newTasks.metadata.inProgressTasks = newTasks.columns.find(col => col.id === 'inprogress').tasks.length;
    newTasks.metadata.completedTasks = newTasks.columns.find(col => col.id === 'done').tasks.length;
    newTasks.metadata.lastUpdated = new Date().toISOString();

    setTasks(newTasks);
    setDraggedTask(null);
  };

  const handleConvertMarkdown = () => {
    setIsConverting(true);
    setShowMarkdown(true);

    setTimeout(() => {
      setIsConverting(false);
    }, 2000);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'todo': return <Circle className="w-4 h-4 text-gray-400" />;
      case 'inprogress': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'done': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  const TaskCard = ({ task, fromColumn, isDragging = false }) => (
    <Card
      className={`p-3 cursor-move transition-all hover:shadow-md ${
        isDragging ? 'opacity-50 rotate-2' : ''
      }`}
      draggable
      onDragStart={(e) => handleDragStart(e, task, fromColumn)}
    >
      <div className="flex items-start gap-2 mb-2">
        <GripVertical className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {getStatusIcon(task.status)}
            <h4 className="text-sm font-medium line-clamp-2">{task.title}</h4>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            {task.assignee && (
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full dark:bg-blue-900/20 dark:text-blue-400">
                {task.assignee}
              </span>
            )}
          </div>

          {task.dueDate && (
            <div className="text-xs text-gray-500 mt-1">
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className={`w-full max-w-7xl mx-auto p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Brain className="text-purple-500" />
          TaskBoardAI Demo
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Interactive kanban board with markdown conversion and AI-structured data management
        </p>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <Button
          onClick={() => setCurrentView(currentView === 'human' ? 'ai' : 'human')}
          variant={currentView === 'ai' ? 'default' : 'outline'}
          className="flex items-center gap-2"
        >
          {currentView === 'human' ? <Code className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          Switch to {currentView === 'human' ? 'AI Structured' : 'Human Visual'} View
        </Button>

        <Button
          onClick={handleConvertMarkdown}
          variant="outline"
          disabled={isConverting}
          className="flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          {isConverting ? 'Converting...' : 'Show Markdown Conversion'}
        </Button>

        <Button
          onClick={() => setTasks({...sampleTasksJson, metadata: {...sampleTasksJson.metadata, lastUpdated: new Date().toISOString()}})}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reset Demo
        </Button>
      </div>

      {/* View Switcher */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setCurrentView('human')}
          className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
            currentView === 'human'
              ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Eye className="w-4 h-4" />
          Human Visual Interface
        </button>
        <button
          onClick={() => setCurrentView('ai')}
          className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
            currentView === 'ai'
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Code className="w-4 h-4" />
          AI Structured Data
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {currentView === 'human' ? (
          <>
            {/* Kanban Board */}
            {tasks.columns.map((column) => (
              <div key={column.id}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">{column.title}</h3>
                  <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-sm font-medium">
                    {column.tasks.length}
                  </span>
                </div>

                <div
                  className={`min-h-96 p-4 rounded-lg border-2 border-dashed transition-colors ${
                    dragOverColumn === column.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  onDragOver={(e) => handleDragOver(e, column.id)}
                  onDrop={(e) => handleDrop(e, column.id)}
                  onDragLeave={() => setDragOverColumn(null)}
                >
                  <div className="space-y-3">
                    {column.tasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        fromColumn={column.id}
                        isDragging={draggedTask?.task.id === task.id}
                      />
                    ))}
                  </div>

                  {column.tasks.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <Circle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Drop tasks here</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            {/* AI Structured View */}
            <div className="lg:col-span-4">
              <Card className="p-6">
                <pre className="text-sm overflow-auto max-h-96 bg-gray-50 dark:bg-gray-900 p-4 rounded">
                  {JSON.stringify(tasks, null, 2)}
                </pre>
              </Card>
            </div>
          </>
        )}
      </div>

      {/* Markdown Conversion Modal */}
      {showMarkdown && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="text-blue-500" />
                Markdown to JSON Conversion
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 h-96">
              <div className="p-4 border-r">
                <h4 className="font-medium mb-2">Input Markdown</h4>
                <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded overflow-auto h-full">
                  {sampleMarkdown}
                </pre>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium">Output JSON</h4>
                  {isConverting && <ArrowRight className="text-blue-500 animate-pulse" />}
                </div>
                <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded overflow-auto h-full">
                  {isConverting ? 'Processing...' : JSON.stringify(sampleTasksJson, null, 2)}
                </pre>
              </div>
            </div>

            <div className="p-4 border-t">
              <Button onClick={() => setShowMarkdown(false)} variant="outline">
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{tasks.metadata.totalTasks}</div>
          <div className="text-sm text-gray-500">Total Tasks</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{tasks.metadata.completedTasks}</div>
          <div className="text-sm text-gray-500">Completed</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{tasks.metadata.inProgressTasks}</div>
          <div className="text-sm text-gray-500">In Progress</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{tasks.metadata.todoTasks}</div>
          <div className="text-sm text-gray-500">To Do</div>
        </Card>
      </div>
    </div>
  );
};

export default TaskBoardAIDemo;