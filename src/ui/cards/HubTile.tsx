type HubTileProps = {
  title: string;
  subtitle: string;
  icon: string;
  tint: string;
};

export default function HubTile({ title, subtitle, icon, tint }: HubTileProps) {
  return (
    <div className="miniHubCard">
      <div className={`hubIcon ${tint}`}>{icon}</div>
      <p>{title}</p>
      <span>{subtitle}</span>
    </div>
  );
}