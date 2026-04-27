import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTodoItems } from '../hooks/useTodoItems';
import GlassCard from '../../../ui/cards/GlassCard';
import PageHeader from '../../../ui/layout/PageHeader';
import PageShell from '../../../ui/layout/PageShell';
import SectionHeader from '../../../ui/layout/SectionHeader';

type TodoFilter = 'today' | 'week' | 'done';

const FILTERS: Array<{ key: TodoFilter; label: string }> = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'Week' },
  { key: 'done', label: 'Done' },
];

function isTodayTask(due: string) {
  return due.trim().toLowerCase() === 'today';
}

export default function TodoPage() {
  const [searchParams] = useSearchParams();
  const { items, isLoading, errorMessage, addItem, toggleItem, deleteItem } = useTodoItems();
  const [title, setTitle] = useState('');
  const [activeFilter, setActiveFilter] = useState<TodoFilter>('today');

  const isCreating = searchParams.get('create') === 'task';

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

  function handleAddTask() {
    const cleanTitle = title.trim();

    if (!cleanTitle) return;

    addItem(cleanTitle);
    setTitle('');
    setActiveFilter('today');
  }

  return (
    <main>
      <PageHeader
        eyebrow="To-do"
        title="Family tasks"
        subtitle="Shared chores, household admin, and the sacred ritual of moving tasks from one day to the next."
      />

      <PageShell>
        {isCreating && (
          <GlassCard className="todoCreateCard">
            <div className="todoCreateForm">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleAddTask();
                }}
                placeholder="Add task"
                autoFocus
                aria-label="New task title"
              />

              <button type="button" onClick={handleAddTask} disabled={!title.trim()}>
                Add
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
                  <div key={task.id} className={`todoRow ${task.done ? 'todoRowDone' : ''}`}>
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

                    <button
                      type="button"
                      className="todoDeleteButton"
                      onClick={() => deleteItem(task.id)}
                      aria-label={`Delete ${task.title}`}
                    >
                      ×
                    </button>
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
