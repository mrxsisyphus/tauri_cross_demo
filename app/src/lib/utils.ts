import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days > 0 && days <= 7) return `In ${days} days`;
  if (days < 0 && days >= -7) return `${Math.abs(days)} days ago`;

  return formatDate(d);
}

export function isOverdue(date: string): boolean {
  return new Date(date) < new Date();
}

export function getPriorityColor(priority: 'low' | 'medium' | 'high'): string {
  switch (priority) {
    case 'high':
      return 'bg-priority-high/10 text-priority-high border-priority-high/30';
    case 'medium':
      return 'bg-priority-medium/10 text-priority-medium border-priority-medium/30';
    case 'low':
      return 'bg-priority-low/10 text-priority-low border-priority-low/30';
  }
}

export function getPriorityLabel(priority: 'low' | 'medium' | 'high'): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}
