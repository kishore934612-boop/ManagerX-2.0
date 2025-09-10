import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { 
  Appbar, 
  FAB, 
  Searchbar, 
  Menu, 
  Button, 
  Text,
  Snackbar,
  useTheme
} from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNoteStore } from '../../stores/noteStore';
import { useAuthStore } from '../../stores/authStore';
import { NoteCard } from '../../components/notes/NoteCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Note } from '../../types/database';
import { noteColors } from '../../constants/theme';
import { Filter, Palette } from 'lucide-react-native';

export default function NotesScreen() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const {
    filteredNotes,
    isLoading,
    error,
    searchQuery,
    filterColor,
    showPinnedOnly,
    loadNotes,
    toggleNotePin,
    deleteNote,
    setSearchQuery,
    setFilterColor,
    setShowPinnedOnly,
    clearError,
  } = useNoteStore();

  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [numColumns, setNumColumns] = useState(2);

  useEffect(() => {
    if (user) {
      loadNotes(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (error) {
      setSnackbarMessage(error);
      setSnackbarVisible(true);
      clearError();
    }
  }, [error]);

  const handleNotePress = (note: Note) => {
    router.push({
      pathname: '/note-editor',
      params: { noteId: note.id }
    });
  };

  const handleTogglePin = async (noteId: string) => {
    try {
      await toggleNotePin(noteId);
      setSnackbarMessage('Note updated');
      setSnackbarVisible(true);
    } catch (err) {
      setSnackbarMessage('Failed to update note');
      setSnackbarVisible(true);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId);
      setSnackbarMessage('Note deleted');
      setSnackbarVisible(true);
    } catch (err) {
      setSnackbarMessage('Failed to delete note');
      setSnackbarVisible(true);
    }
  };

  const renderNote = ({ item }: { item: Note }) => (
    <View style={[styles.noteContainer, { width: `${100 / numColumns}%` }]}>
      <NoteCard
        note={item}
        onPress={handleNotePress}
        onTogglePin={handleTogglePin}
        onDelete={handleDeleteNote}
      />
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        No notes found
      </Text>
      <Text variant="bodyMedium" style={styles.emptyMessage}>
        Create your first note to start capturing your thoughts and ideas!
      </Text>
      <Button
        mode="contained"
        onPress={() => router.push('/note-editor')}
        style={styles.emptyButton}
      >
        Create Note
      </Button>
    </View>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.Content title="Notes" />
        <Appbar.Action
          icon={() => numColumns === 1 ? "view-grid" : "view-list"}
          onPress={() => setNumColumns(numColumns === 1 ? 2 : 1)}
        />
        <Menu
          visible={filterMenuVisible}
          onDismiss={() => setFilterMenuVisible(false)}
          anchor={
            <Appbar.Action
              icon={() => <Filter size={24} color={theme.colors.onSurface} />}
              onPress={() => setFilterMenuVisible(true)}
            />
          }
        >
          <Menu.Item
            title="All Notes"
            onPress={() => {
              setFilterColor(null);
              setShowPinnedOnly(false);
              setFilterMenuVisible(false);
            }}
            leadingIcon={!filterColor && !showPinnedOnly ? "check" : undefined}
          />
          <Menu.Item
            title="Pinned Only"
            onPress={() => {
              setShowPinnedOnly(!showPinnedOnly);
              setFilterMenuVisible(false);
            }}
            leadingIcon={showPinnedOnly ? "check" : undefined}
          />
          {noteColors.map((color, index) => (
            <Menu.Item
              key={color}
              title={`Color ${index + 1}`}
              onPress={() => {
                setFilterColor(color);
                setFilterMenuVisible(false);
              }}
              leadingIcon={filterColor === color ? "check" : undefined}
              trailingIcon={() => (
                <View style={[styles.colorIndicator, { backgroundColor: color }]} />
              )}
            />
          ))}
        </Menu>
      </Appbar.Header>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search notes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchbar}
        />
      </View>

      {filteredNotes.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredNotes}
          renderItem={renderNote}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          key={numColumns}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FAB
        icon="plus"
        onPress={() => router.push('/note-editor')}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'Dismiss',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
  },
  searchbar: {
    elevation: 0,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  listContainer: {
    paddingBottom: 100,
  },
  noteContainer: {
    paddingHorizontal: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
    opacity: 0.7,
  },
  emptyButton: {
    minWidth: 160,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 80,
  },
});