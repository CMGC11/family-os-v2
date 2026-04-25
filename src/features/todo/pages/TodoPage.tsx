import { tasks } from '../../../data/mockFamilyData';
import GlassCard from '../../../ui/cards/GlassCard';
import PageHeader from '../../../ui/layout/PageHeader';

export default function TodoPage() {
  return (
    <main>
      <PageHeader
        eyebrow="To-do"
        title="Family tasks"
        subtitle="Shared chores, household admin, and the sacred ritual of moving tasks from one day to the next."
      />

      <section className="pageSection">
        <GlassCard className="tasksCard">
          <div className="taskTabs">
            {['Today', 'Week', 'Done'].map((tab, index) => (
              <button key={tab} type="button" className={index === 0 ? 'taskTabActive' : ''}>
                {tab}
              </button>
            ))}
          </div>

          <div className="taskList">
            {tasks.map((task) => (
              <div key={task.title} className="taskRow">
                <div className={`taskCheck ${task.done ? 'taskDone' : ''}`}>✓</div>

                <div>
                  <strong className={task.done ? 'taskTextDone' : ''}>{task.title}</strong>
                  <span>
                    {task.area} · {task.due}
                  </span>
                </div>

                <span className="chevron">›</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>
    </main>
  );
}