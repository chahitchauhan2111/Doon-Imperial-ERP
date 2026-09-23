import { Badge, DateChip, Empty } from './ui';

type Notice = { id: string; title: string; body: string; audience: string; postedBy: string | null; createdAt: Date };

export default function NoticeList({ notices, compact, action }: { notices: Notice[]; compact?: boolean; action?: (n: Notice) => React.ReactNode }) {
  if (!notices.length) return <Empty title="No notices yet" />;
  return (
    <div>
      {notices.map(n => (
        <div className="list-item" key={n.id}>
          <DateChip d={n.createdAt} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4>{n.title}</h4>
            <p style={compact ? { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } : { whiteSpace: 'pre-line' }}>{n.body}</p>
            {!compact && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                <Badge v={n.audience} label={n.audience === 'ALL' ? 'Everyone' : n.audience.charAt(0) + n.audience.slice(1).toLowerCase()} />
                {n.postedBy && <span className="small muted">Posted by {n.postedBy}</span>}
              </div>
            )}
          </div>
          {action?.(n)}
        </div>
      ))}
    </div>
  );
}
