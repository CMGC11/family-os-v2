import { useNavigate } from 'react-router-dom';

type CreateActionSheetProps = {
  open: boolean;
  onClose: () => void;
};

type CreateAction = {
  label: string;
  detail: string;
  icon: string;
  tint: string;
  path: string;
};

const CREATE_ACTIONS: CreateAction[] = [
  {
    label: 'Event',
    detail: 'Add something to the family calendar',
    icon: '◷',
    tint: 'tintBlue',
    path: '/calendar?create=event',
  },
  {
    label: 'Task',
    detail: 'Create a shared household to-do',
    icon: '✓',
    tint: 'tintGreen',
    path: '/todo?create=task',
  },
  {
    label: 'Grocery',
    detail: 'Add something to the shopping list',
    icon: '◌',
    tint: 'tintLime',
    path: '/family/grocery?create=grocery',
  },
  {
    label: 'Wishlist',
    detail: 'Save an idea or gift',
    icon: '♡',
    tint: 'tintRose',
    path: '/family/wishlist?create=wishlist',
  },
  {
    label: 'Recipe',
    detail: 'Save a recipe for later',
    icon: '♨',
    tint: 'tintOrange',
    path: '/family/recipes?create=recipe',
  },
  {
    label: 'Trip',
    detail: 'Start planning a family trip',
    icon: '⌁',
    tint: 'tintBlue',
    path: '/family/trips?create=trip',
  },
  {
    label: 'Health note',
    detail: 'Capture care info for later',
    icon: '+',
    tint: 'tintGreen',
    path: '/family/health?create=health',
  },
];

export default function CreateActionSheet({ open, onClose }: CreateActionSheetProps) {
  const navigate = useNavigate();

  if (!open) return null;

  function handleNavigate(path: string) {
    navigate(path);
    onClose();
  }

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
          {CREATE_ACTIONS.map((action) => (
            <button
              key={action.path}
              type="button"
              className="createActionRow"
              onClick={() => handleNavigate(action.path)}
            >
              <div className={`createActionIcon ${action.tint}`}>{action.icon}</div>

              <div>
                <strong>{action.label}</strong>
                <span>{action.detail}</span>
              </div>

              <span className="chevron">›</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
