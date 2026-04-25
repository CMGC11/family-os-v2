import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTodoItems } from '../hooks/useTodoItems';
import GlassCard from '../../../ui/cards/GlassCard';
import PageHeader from '../../../ui/layout/PageHeader';
import PageShell from '../../../ui/layout/PageShell';

export default function TodoPage() {
  const [searchParams] = useSearchParams();
  const { items, addItem, toggleItem, deleteItem } = useTodoItems();
  const [title, setTitle] = useState('');

  const isCreating = searchParams.get('create') === 'task';

  function handleAddTask() {
    addItem(title);
    setTitle('');
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
          <GlassCard className="quickCreateCard">
            <div className="quickCreateForm">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleAddTask();
                }}
                placeholder="Add task..."
                autoFocus
                aria-label="New task title"
              />

              <button type="button" onClick={handleAddTask}>
                Add
              </button>
            </div>
          </GlassCard>
        )}

        <GlassCard className="tasksCard">
          <div className="taskTabs">
            {['Today', 'Week', 'Done'].map((tab, index) => (
              <button key={tab} type="button" className={index === 0 ? 'taskTabActive' : ''}>
                {tab}
              </button>
            ))}
          </div>

          <div className="taskList">
            {items.map((task) => (
              <div key={task.id} className="taskRow">
                <button
                  type="button"
                  className={`taskCheck ${task.done ? 'taskDone' : ''}`}
                  onClick={() => toggleItem(task.id)}
                  aria-label={task.done ? `Mark ${task.title} not done` : `Mark ${task.title} done`}
                >
                  ✓
                </button>

                <button type="button" className="taskMainButton" onClick={() => toggleItem(task.id)}>
                  <strong className={task.done ? 'taskTextDone' : ''}>{task.title}</strong>
                  <span>
                    {task.area} · {task.due}
                  </span>
                </button>

                <button
                  type="button"
                  className="taskDeleteButton"
                  onClick={() => deleteItem(task.id)}
                  aria-label={`Delete ${task.title}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </GlassCard>
      </PageShell>
    </main>
  );
}