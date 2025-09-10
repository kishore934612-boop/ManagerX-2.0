import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Checkbox, IconButton, Chip, useTheme } from 'react-native-paper';
import { Task } from '../../types/database';
import { priorityColors } from '../../constants/theme';
import { Calendar, Clock, Tag } from 'lucide-react-native';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCard({ task, onToggleComplete, onEdit, onDelete }: TaskCardProps) {
  const theme = useTheme();
  
  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    if (diffDays < 7) return `In ${diffDays} days`;
    
    return date.toLocaleDateString();
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.isCompleted;
  
  return (
    <Card style={[
      styles.card,
      task.isCompleted && styles.completedCard,
      isOverdue && styles.overdueCard
    ]}>
      <View style={styles.cardContent}>
        <View style={styles.leftSection}>
          <Checkbox
            status={task.isCompleted ? 'checked' : 'unchecked'}
            onPress={() => onToggleComplete(task.id)}
            theme={{ colors: { primary: theme.colors.primary } }}
          />
          <View style={styles.taskInfo}>
            <Text 
              variant="titleMedium" 
              style={[
                styles.title,
                task.isCompleted && styles.completedText
              ]}
              numberOfLines={2}
            >
              {task.title}
            </Text>
            {task.description && (
              <Text 
                variant="bodySmall" 
                style={[
                  styles.description,
                  task.isCompleted && styles.completedText
                ]}
                numberOfLines={2}
              >
                {task.description}
              </Text>
            )}
            <View style={styles.metadata}>
              <View style={[
                styles.priorityIndicator,
                { backgroundColor: priorityColors[task.priority] }
              ]} />
              <Text variant="labelSmall" style={styles.priority}>
                {task.priority.toUpperCase()}
              </Text>
              {task.dueDate && (
                <View style={styles.dueDateContainer}>
                  <Clock size={12} color={isOverdue ? theme.colors.error : theme.colors.outline} />
                  <Text 
                    variant="labelSmall" 
                    style={[
                      styles.dueDate,
                      isOverdue && { color: theme.colors.error }
                    ]}
                  >
                    {formatDueDate(task.dueDate)}
                  </Text>
                </View>
              )}
            </View>
            {task.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {task.tags.slice(0, 3).map((tag, index) => (
                  <Chip
                    key={index}
                    mode="outlined"
                    compact
                    style={styles.tag}
                    textStyle={styles.tagText}
                  >
                    {tag}
                  </Chip>
                ))}
                {task.tags.length > 3 && (
                  <Text variant="labelSmall" style={styles.moreTagsText}>
                    +{task.tags.length - 3} more
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
        <View style={styles.rightSection}>
          <IconButton
            icon="pencil"
            size={20}
            onPress={() => onEdit(task)}
            style={styles.actionButton}
          />
          <IconButton
            icon="delete"
            size={20}
            onPress={() => onDelete(task.id)}
            style={styles.actionButton}
            iconColor={theme.colors.error}
          />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
  },
  completedCard: {
    opacity: 0.7,
  },
  overdueCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  taskInfo: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  description: {
    marginBottom: 8,
    lineHeight: 18,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  priority: {
    marginRight: 12,
    fontWeight: '500',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueDate: {
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  tag: {
    marginRight: 6,
    marginBottom: 4,
    height: 24,
  },
  tagText: {
    fontSize: 10,
    lineHeight: 14,
  },
  moreTagsText: {
    opacity: 0.6,
    fontStyle: 'italic',
  },
  rightSection: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  actionButton: {
    margin: 0,
  },
});