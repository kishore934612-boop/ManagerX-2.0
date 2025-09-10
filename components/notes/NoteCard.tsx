import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Card, Text, IconButton, useTheme } from 'react-native-paper';
import { Note } from '../../types/database';
import { Pin, Tag } from 'lucide-react-native';

interface NoteCardProps {
  note: Note;
  onPress: (note: Note) => void;
  onTogglePin: (noteId: string) => void;
  onDelete: (noteId: string) => void;
}

export function NoteCard({ note, onPress, onTogglePin, onDelete }: NoteCardProps) {
  const theme = useTheme();
  
  const stripHtmlTags = (html: string) => {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <Card style={[styles.card, { backgroundColor: note.color }]}>
      <Pressable onPress={() => onPress(note)}>
        <View style={styles.cardContent}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              {note.isPinned && (
                <Pin 
                  size={16} 
                  color={theme.colors.primary}
                  style={styles.pinIcon}
                />
              )}
              <Text 
                variant="titleSmall" 
                style={styles.title}
                numberOfLines={1}
              >
                {note.title}
              </Text>
            </View>
            <View style={styles.actions}>
              <IconButton
                icon={note.isPinned ? "pin" : "pin-outline"}
                size={18}
                onPress={() => onTogglePin(note.id)}
                style={styles.actionButton}
                iconColor={note.isPinned ? theme.colors.primary : theme.colors.outline}
              />
              <IconButton
                icon="delete"
                size={18}
                onPress={() => onDelete(note.id)}
                style={styles.actionButton}
                iconColor={theme.colors.error}
              />
            </View>
          </View>
          
          <Text 
            variant="bodySmall" 
            style={styles.content}
            numberOfLines={6}
          >
            {stripHtmlTags(note.content)}
          </Text>
          
          <View style={styles.footer}>
            <Text variant="labelSmall" style={styles.date}>
              {formatDate(note.updatedAt)}
            </Text>
            {note.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                <Tag size={12} color={theme.colors.outline} />
                <Text variant="labelSmall" style={styles.tagCount}>
                  {note.tags.length} tags
                </Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 8,
    elevation: 2,
    borderRadius: 12,
  },
  cardContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pinIcon: {
    marginRight: 6,
  },
  title: {
    flex: 1,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  actionButton: {
    margin: 0,
    width: 32,
    height: 32,
  },
  content: {
    lineHeight: 20,
    marginBottom: 12,
    minHeight: 60,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    opacity: 0.7,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagCount: {
    marginLeft: 4,
    opacity: 0.7,
  },
});