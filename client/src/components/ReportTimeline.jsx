import Timeline from '@mui/lab/Timeline';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import { Clock } from 'lucide-react';
import { getStatusColor } from '../utils/statusColor';
import { formatBoldText } from '../utils/formatText';

const ReportTimeline = ({ remarks = [] }) => {
  // Sort remarks to ensure the latest is always on top
  const sortedRemarks = [...remarks].sort((a, b) => {
    const timeA = a.dateRemarked ? new Date(a.dateRemarked).getTime() : 0;
    const timeB = b.dateRemarked ? new Date(b.dateRemarked).getTime() : 0;
    return timeB - timeA;
  });

  // Safe Date Formatter
  const formatRemarkDate = (dateVal) => {
    if (!dateVal) return 'Just now';
    const date = dateVal.toDate ? dateVal.toDate() : new Date(dateVal);
    return date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  // Dot Colors
  const latestDotColor = 'var(--color-status-progress)';
  const oldDotColor = 'var(--color-text-muted)';

  if (!remarks || remarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-text-muted bg-surface">
        <Clock size={32} className="mb-2 opacity-50" />
        <p className="text-sm font-medium">No timeline updates yet.</p>
      </div>
    );
  }

  return (
    <div className="px-2 pb-6 pt-2 bg-surface">
      <Timeline
        sx={{
          [`& .${timelineItemClasses.root}:before`]: {
            flex: 0,
            padding: 0,
          },
          padding: 0,
          margin: 0,
        }}
      >
        {sortedRemarks.map((remark, index) => {
          const isLast = index === sortedRemarks.length - 1;
          const isLatest = index === 0; 
          const dotColor = isLatest ? latestDotColor : oldDotColor;

          // Determine badge coloring: vibrant if latest, neutral if old
          const badgeColorClass = isLatest 
            ? getStatusColor(remark.status)
            : "bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] border-[var(--color-border-light)]";

          return (
            <TimelineItem key={index}>
              
              <TimelineSeparator>
                {/* Margin adjusted to align perfectly with the top status badge */}
                <TimelineDot 
                    sx={{ 
                      backgroundColor: dotColor,
                      boxShadow: 'none',
                      margin: '4px 0' 
                    }} 
                />
                {!isLast && <TimelineConnector sx={{ backgroundColor: 'var(--color-border-light)' }} />} 
              </TimelineSeparator>
              
              {/* Right Column: Status, Date, and Bubble */}
              <TimelineContent sx={{ pt: 0, pb: 4, px: 2, display: 'flex', flexDirection: 'column' }}>
                
                {/* Header: Status badge on top, Date directly below */}
                <div className="flex flex-col items-start mb-2.5">
                  <span 
                    className={`text-[10px] font-black tracking-wider px-2 py-0.5 rounded border whitespace-nowrap mb-1.5 ${badgeColorClass}`}
                  >
                    {(remark.status || 'UPDATE').toUpperCase().replace(/_/g, ' ')}
                  </span>
                  
                  <div className="flex items-center text-[11px] font-medium text-text-muted">
                    <Clock size={12} className="mr-1.5" />
                    <span>{formatRemarkDate(remark.dateRemarked)}</span>
                  </div>
                </div>

                {/* Comment Bubble */}
                <div className="bg-surface-elevated p-3.5 rounded-2xl rounded-tl-none border border-border-light text-sm text-text-primary w-full shadow-sm whitespace-pre-wrap">
                  {formatBoldText(remark.comment)}
                </div>
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
    </div>
  );
};

export default ReportTimeline;