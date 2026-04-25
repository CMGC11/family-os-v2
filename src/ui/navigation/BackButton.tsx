import { useNavigate } from 'react-router-dom';

type BackButtonProps = {
  fallbackTo?: string;
  label?: string;
};

export default function BackButton({ fallbackTo = '/family', label = 'Back' }: BackButtonProps) {
  const navigate = useNavigate();

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(fallbackTo);
  }

  return (
    <button type="button" className="backButton" onClick={handleBack}>
      <span>‹</span>
      {label}
    </button>
  );
}