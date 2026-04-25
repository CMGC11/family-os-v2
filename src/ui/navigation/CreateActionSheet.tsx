import { useNavigate } from 'react-router-dom';

type CreateActionSheetProps = {
  open: boolean;
  onClose: () => void;
};

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
          <button type="button" className="createActionRow" onClick={() => handleNavigate('/calendar?create=event')}>
            <div className="createActionIcon tintBlue">◷</div>
            <div>
              <strong>Event</strong>
              <span>Add something to the family calendar</span>
            </div>
            <span className="chevron">›</span>
          </button>

          <button type="button" className="createActionRow" onClick={() => handleNavigate('/todo?create=task')}>
            <div className="createActionIcon tintGreen">✓</div>
            <div>
              <strong>Task</strong>
              <span>Create a shared household to-do</span>
            </div>
            <span className="chevron">›</span>
          </button>

          <button type="button" className="createActionRow" onClick={() => handleNavigate('/family/grocery?create=grocery')}>
            <div className="createActionIcon tintLime">◌</div>
            <div>
              <strong>Grocery</strong>
              <span>Add something to the shopping list</span>
            </div>
            <span className="chevron">›</span>
          </button>

          <button type="button" className="createActionRow" onClick={() => handleNavigate('/family/health?create=health')}>
            <div className="createActionIcon tintGreen">+</div>
            <div>
              <strong>Health note</strong>
              <span>Capture care info for later</span>
            </div>
            <span className="chevron">›</span>
          </button>

          <button type="button" className="createActionRow" onClick={() => handleNavigate('/family/wishlist?create=wishlist')}>
            <div className="createActionIcon tintRose">♡</div>
            <div>
              <strong>Wishlist</strong>
              <span>Save an idea or gift</span>
            </div>
            <span className="chevron">›</span>
          </button>
        </div>
      </section>
    </div>
  );
}