import { Chip } from '@mui/material';

type StatusType = "completed" | "progress" | "pending";

interface StatusBadgeProps {
  status: StatusType;
}

const statusConfig = {
  completed: {
    text: "Completed",
    color: "#9c27b0"
  },
  progress: {
    text: "In Progress", 
    color: "#4caf50"
  },
  pending: {
    text: "Pending",
    color: "#f44336"
  }
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = statusConfig[status];
  
  return (
    <Chip
      label={config.text}
      sx={{
        backgroundColor: config.color,
        color: 'white',
        fontWeight: 'bold',
        fontSize: '12px',
        height: '24px'
      }}
      size="small"
    />
  );
};