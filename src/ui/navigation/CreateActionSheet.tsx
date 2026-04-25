type CreateActionSheetProps = {
  open: boolean;
  onClose: () => void;
};

const actions = [
  {
    title: 'Event',
    subtitle: 'Add something to the family calendar',
    icon: '◷',
    tint: 'tintBlue',
  },
  {
    title: 'Task',
    subtitle: 'Create a shared household to-do',
    icon: '✓',
    tint: 'tintGreen',
  },
  {
    title: 'Grocery',
    subtitle: 'Add something to the shopping list',
    icon: '◌',
    tint: 'tintLime',
  },
  {
    title: 'Health note',
    subtitle: 'Capture care info for later',
    icon: '+',
    tint: 'tintGreen',
  },
  {
    title: 'Wishlist',
    subtitle: 'Save an idea, gift, or useful link',
    icon: '♡',
    tint: 'tintRose',
  },
];

export default function CreateActionSheet({ open, onClose }: CreateActionSheetProps) {
  if (!open) return null;

  return (
    <div className="createSheetOverlay" onClick={onClose}>
      <section className="createSheet" onClick={(event) => event.stopPropagation()}>
        <div className="createSheetHandle" />

        <div className="createSheetHeader">
          <div>
            <p>Create</p>
            <h2>Add something</h2>
          </div>

          <button type="button" onClick={onClose} aria-label="Close create sheet">
            ×
          </button>
        </div>

        <div className="createActionList">
          {actions.map((action) => (
            <button key={action.title} type="button" className="createActionRow" onClick={onClose}>
              <div className={`createActionIcon ${action.tint}`}>{action.icon}</div>

              <div>
                <strong>{action.title}</strong>
                <span>{action.subtitle}</span>
              </div>

              <span className="chevron">›</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}