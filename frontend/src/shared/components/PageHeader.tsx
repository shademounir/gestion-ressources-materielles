interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  status: string;
  titleId: string;
}

export function PageHeader({ eyebrow, title, description, status, titleId }: PageHeaderProps) {
  return (
    <div className="resource-page-header">
      <div>
        <span className="dashboard-eyebrow">{eyebrow}</span>
        <h1 id={titleId}>{title}</h1>
        <p>{description}</p>
      </div>
      <span className="dashboard-status">{status}</span>
    </div>
  );
}
