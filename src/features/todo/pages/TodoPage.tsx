import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTodoItems } from '../hooks/useTodoItems';
import GlassCard from '../../../ui/cards/GlassCard';
import PageHeader from '../../../ui/layout/PageHeader';
import PageShell from '../../../ui/layout/PageShell';
import SectionHeader from '../../../ui/layout/SectionHeader';
import type { TaskItem } from '../types';

type TodoFilter = 'today' | 'week' | 'done';

type TodoFormState = {
  title: string;
  area: string;
  due: string;
};

const EMPTY_FORM: TodoFormState = {
  title: '',
  area: 'Family',
  due: 'Today',
};

const FILTERS: Array<{ key: TodoFilter; label: string }> = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'Week' },
  { key: 'done', label: 'Done' },
];

function isTodayTask(due: string) {
  return due.trim().toLowerCase() === 'today';
}

function getFormFromTask(task: TaskItem): TodoFormState {
  return {
    title: task.title,
    area: task.area || 'Family',
    due: task.due || 'Today',
  };
}

export default function TodoPage() {
  const [searchParams] = useSearchParams();
  const { items, isLoading, errorMessage, addItem, editItem, toggleItem, deleteItem } = useTodoItems();
  const [form, setForm] = useState<TodoFormState>(EMPTY_FORM);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<TodoFilter>('today');

  const isCreating = searchParams.get('create') === 'task';
  const isEditing = Boolean(editingTaskId);
  const showComposer = isCreating || isEditing;

  const openItems = useMemo(() => items.filter((item) => !item.done), [items]);
  const doneItems = useMemo(() => items.filter((item) => item.done), [items]);
  const todayItems = useMemo(() => openItems.filter((item) => isTodayTask(item.due)), [openItems]);
  const weekItems = useMemo(() => openItems.filter((item) => !isTodayTask(item.due)), [openItems]);

  const visibleItems = useMemo(() => {
    if (activeFilter === 'done') return doneItems;
    if (activeFilter === 'week') return weekItems;
    return todayItems;
  }, [activeFilter, doneItems, todayItems, weekItems]);

  const emptyCopy = {
    today: {
      title: 'No tasks for today',
      detail: 'A clean list. Either impressive or deeply suspicious.',
    },
    week: {
      title: 'No later tasks',
      detail: 'Nothing waiting in the wings. Rare behavior from a household.',
    },
    done: {
      title: 'Nothing completed yet',
      detail: 'The victory archive is empty. Tragic, but fixable.',
    },
  }[activeFilter];

  function updateForm(field: keyof TodoFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetComposer() {
    setForm(EMPTY_FORM);
    setEditingTaskId(null);
  }

  function startEditTask(task: TaskItem) {
    setEditingTaskId(task.id);
    setForm(getFormFromTask(task));
  }

  async function handleSaveTask() {
    const cleanTitle = form.title.trim();

    if (!cleanTitle) return;

    if (editingTaskId) {
      const updatedTask = await editItem(editingTaskId, form);

      if (updatedTask) {
        setForm(getFormFromTask(updatedTask));
        setEditingTaskId(null);
        setActiveFilter(updatedTask.done ? 'done' : isTodayTask(updatedTask.due) ? 'today' : 'week');
      }

      return;
    }

    const newTask = await addItem(form);

    if (newTask) {
      setForm(EMPTY_FORM);
      setActiveFilter(isTodayTask(newTask.due) ? 'today' : 'week');
    }
  }

  async function handleDeleteTask(task: TaskItem) {
    if (editingTaskId === task.id) {
      resetComposer();
    }

    await deleteItem(task.id);
  }

  return (
    <main>
      <PageHeader
        eyebrow="To-do"
        title="Family tasks"
        subtitle="Shared chores, household admin, and the sacred ritual of moving tasks from one day to the next."
      />

      <PageShell>
        {showComposer && (
          <GlassCard className="todoCreateCard todoEditCard">
            <div className="todoComposerHeader">
              <div>
                <p className="mutedLabel">{isEditing ? 'Edit task' : 'New task'}</p>
                <h2>{isEditing ? 'Update the task' : 'Add a family task'}</h2>
              </div>

              {isEditing && (
                <button type="button" className="todoCancelButton" onClick={resetComposer}>
                  Cancel
                </button>
              )}
            </div>

            <div className="todoCreateForm todoEditForm">
              <input
                value={form.title}
                onChange={(event) => updateForm('title', event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleSaveTask();
                }}
                placeholder="Task title"
                autoFocus
                aria-label="Task title"
              />

              <input
                value={form.area}
                onChange={(event) => updateForm('area', event.target.value)}
                placeholder="Area"
                aria-label="Task area"
              />

              <input
                value={form.due}
                onChange={(event) => updateForm('due', event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleSaveTask();
                }}
                placeholder="Due"
                aria-label="Task due date"
              />

              <button type="button" onClick={handleSaveTask} disabled={!form.title.trim()}>
                {isEditing ? 'Save' : 'Add'}
              </button>
            </div>
          </GlassCard>
        )}

        <GlassCard className="todoSummaryCard">
          <div>
            <p className="mutedLabel">Open tasks</p>
            <h2>{isLoading ? '—' : openItems.length}</h2>
            <span>
              {todayItems.length} today · {weekItems.length} later · {doneItems.length} done
            </span>
          </div>

          <div className="todoSummaryIcon" aria-hidden="true">
            ✓
          </div>
        </GlassCard>

        {isLoading && (
          <GlassCard className="tasksCard">
            <p className="mutedLabel">Loading tasks...</p>
          </GlassCard>
        )}

        {errorMessage && (
          <GlassCard className="tasksCard">
            <p className="mutedLabel">{errorMessage}</p>
          </GlassCard>
        )}

        {!isLoading && !errorMessage && (
          <GlassCard className="todoListCard">
            <SectionHeader title="Tasks" />

            <div className="todoTabs" role="tablist" aria-label="Task filters">
              {FILTERS.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  className={activeFilter === filter.key ? 'todoTabActive' : ''}
                  onClick={() => setActiveFilter(filter.key)}
                  role="tab"
                  aria-selected={activeFilter === filter.key}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="todoList">
              {visibleItems.length === 0 ? (
                <div className="todoEmptyRow">
                  <span className="todoEmptyIcon" aria-hidden="true">
                    ⌁
                  </span>

                  <div>
                    <strong>{emptyCopy.title}</strong>
                    <span>{emptyCopy.detail}</span>
                  </div>
                </div>
              ) : (
                visibleItems.map((task) => (
                  <div
                    key={task.id}
                    className={`todoRow todoEditableRow ${task.done ? 'todoRowDone' : ''} ${editingTaskId === task.id ? 'todoRowEditing' : ''}`}
                  >
                    <button
                      type="button"
                      className={`todoCheck ${task.done ? 'todoCheckDone' : ''}`}
                      onClick={() => toggleItem(task.id)}
                      aria-label={task.done ? `Mark ${task.title} not done` : `Mark ${task.title} done`}
                    >
                      ✓
                    </button>

                    <button type="button" className="todoMainButton" onClick={() => toggleItem(task.id)}>
                      <strong>{task.title}</strong>
                      <span>
                        {task.area} · {task.due}
                      </span>
                    </button>

                    <div className="todoRowActions">
                      <button
                        type="button"
                        className="todoEditButton"
                        onClick={() => startEditTask(task)}
                        aria-label={`Edit ${task.title}`}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="todoDeleteButton"
                        onClick={() => handleDeleteTask(task)}
                        aria-label={`Delete ${task.title}`}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        )}
      </PageShell>
    </main>
  );
}
