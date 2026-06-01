import React from 'react';
import { Calendar, Trash2, Edit2, FileText } from 'lucide-react';

const ApplicationCard = ({ application, onEdit, onDelete }) => {
  // Format Date gracefully
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="kanban-card">
      <div className="kanban-card-title">{application.companyName}</div>
      <div className="kanban-card-subtitle">{application.role}</div>

      <div className="kanban-card-date">
        <Calendar size={12} />
        <span>{formatDate(application.appliedDate)}</span>
      </div>

      {application.notes && (
        <div className="kanban-card-notes" title={application.notes}>
          {application.notes.length > 80
            ? `${application.notes.substring(0, 80)}...`
            : application.notes}
        </div>
      )}

      <div className="kanban-card-actions">
        <button
          className="card-btn btn-edit"
          onClick={() => onEdit(application)}
          title="Edit application details"
        >
          <Edit2 size={12} />
        </button>
        <button
          className="card-btn btn-delete"
          onClick={() => onDelete(application._id)}
          title="Delete application"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
};

export default ApplicationCard;
