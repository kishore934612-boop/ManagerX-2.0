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
import { useTaskStore } from '../../stores/taskStore';
import { useAuthStore } from '../../stores/authStore';
import { TaskCard } from '../../components/tasks/TaskCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { Task } from '../../types/database';
import { Filter, Import as SortAsc } from 'lucide-react-native';

export default function TasksScreen() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const {
    filteredTasks,
    isLoading,
    error,
    searchQuery,
    filterPriority,
    showCompleted,
    loadTasks,
    loadCategories,
    toggleTaskComplete,
    deleteTask,
    setSearchQuery,
    setFilterPriority,
    setShowCompleted,
    clearError,
  } = useTaskStore();

  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadTasks(user.id);
      loadCategories(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (error) {
      setSnackbarMessage(error);
      setSnackbarVisible(true);
      clearError();
    }
  }, [error]);

  const handleToggleComplete = async (taskId: string) => {
    try {
      await toggleTaskComplete(taskId);
      setSnackbarMessage('Task updated');
      setSnackbarVisible(true);
    } catch (err) {
      setSnackbarMessage('Failed to update task');
      setSnackbarVisible(true);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setSnackbarMessage('Task deleted');
      setSnackbarVisible(true);
    } catch (err) {
      setSnackbarMessage('Failed to delete task');
      setSnackbarVisible(true);
    }
  };

  const handleEditTask = (task: Task) => {
    router.push({
      pathname: '/task-form',
      params: { taskId: task.id }
    });
  };

  const renderTask = ({ item }: { item: Task }) => (
    <TaskCard
      task={item}
      onToggleComplete={handleToggleComplete}
      onEdit={handleEditTask}
      onDelete={handleDeleteTask}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        No tasks found
      </Text>
      <Text variant="bodyMedium" style={styles.emptyMessage}>
        Create your first task to get started with organizing your day!
      </Text>
      <Button
        mode="contained"
        onPress={() => router.push('/task-form')}
        style={styles.emptyButton}
      >
        Create Task
      </Button>
    </View>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.Content title="Tasks" />
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
            title="All Tasks"
            onPress={() => {
              setFilterPriority(null);
              setFilterMenuVisible(false);
            }}
            leadingIcon={filterPriority === null ? "check" : undefined}
          />
          <Menu.Item
            title="High Priority"
            onPress={() => {
              setFilterPriority('high');
              setFilterMenuVisible(false);
            }}
            leadingIcon={filterPriority === 'high' ? "check" : undefined}
          />
          <Menu.Item
            title="Medium Priority"
            onPress={() => {
              setFilterPriority('medium');
              setFilterMenuVisible(false);
            }}
            leadingIcon={filterPriority === 'medium' ? "check" : undefined}
          />
          <Menu.Item
            title="Low Priority"
            onPress={() => {
              setFilterPriority('low');
              setFilterMenuVisible(false);
            }}
            leadingIcon={filterPriority === 'low' ? "check" : undefined}
          />
          <Menu.Item
            title={showCompleted ? "Hide Completed" : "Show Completed"}
            onPress={() => {
              setShowCompleted(!showCompleted);
              setFilterMenuVisible(false);
            }}
          />
        </Menu>
      </Appbar.Header>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search tasks..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchbar}
        />
      </View>

      {filteredTasks.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredTasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FAB
        icon="plus"
        onPress={() => router.push('/task-form')}
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 80,
  },
});