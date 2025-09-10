import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { 
  Text, 
  Card, 
  useTheme,
  ProgressBar
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { useTaskStore } from '../../stores/taskStore';
import { useNoteStore } from '../../stores/noteStore';
import { useAuthStore } from '../../stores/authStore';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { TrendingUp, CircleCheck as CheckCircle, Clock, Target } from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const { tasks, loadTasks } = useTaskStore();
  const { notes, loadNotes } = useNoteStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        await Promise.all([
          loadTasks(user.id),
          loadNotes(user.id),
        ]);
        setIsLoading(false);
      }
    };
    loadData();
  }, [user]);

  const getTaskStats = () => {
    const completed = tasks.filter(t => t.isCompleted).length;
    const total = tasks.length;
    const pending = total - completed;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    const priorityStats = {
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length,
    };

    const overdue = tasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date() && !t.isCompleted
    ).length;

    return {
      total,
      completed,
      pending,
      overdue,
      completionRate,
      priorityStats
    };
  };

  const getWeeklyProgress = () => {
    const today = new Date();
    const weekData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayTasks = tasks.filter(t => {
        const taskDate = new Date(t.createdAt);
        return taskDate.toDateString() === date.toDateString();
      });
      const completedTasks = dayTasks.filter(t => t.isCompleted).length;
      
      weekData.push({
        day: date.toLocaleDateString('en', { weekday: 'short' }),
        completed: completedTasks,
        total: dayTasks.length
      });
    }
    
    return weekData;
  };

  const taskStats = getTaskStats();
  const weeklyData = getWeeklyProgress();

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
    labelColor: (opacity = 1) => theme.colors.onSurface,
    style: {
      borderRadius: 16,
    },
  };

  const priorityPieData = [
    {
      name: 'High',
      population: taskStats.priorityStats.high,
      color: '#ef4444',
      legendFontColor: theme.colors.onSurface,
      legendFontSize: 12,
    },
    {
      name: 'Medium',
      population: taskStats.priorityStats.medium,
      color: '#f59e0b',
      legendFontColor: theme.colors.onSurface,
      legendFontSize: 12,
    },
    {
      name: 'Low',
      population: taskStats.priorityStats.low,
      color: '#10b981',
      legendFontColor: theme.colors.onSurface,
      legendFontSize: 12,
    },
  ].filter(item => item.population > 0);

  const barData = {
    labels: weeklyData.map(d => d.day),
    datasets: [
      {
        data: weeklyData.map(d => d.completed),
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
      },
    ],
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Analytics
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Track your productivity and progress
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <CheckCircle size={24} color={theme.colors.primary} />
              <Text variant="headlineSmall" style={styles.statValue}>
                {taskStats.completed}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Completed Tasks
              </Text>
            </View>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Clock size={24} color={theme.colors.secondary} />
              <Text variant="headlineSmall" style={styles.statValue}>
                {taskStats.pending}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Pending Tasks
              </Text>
            </View>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Target size={24} color={theme.colors.error} />
              <Text variant="headlineSmall" style={styles.statValue}>
                {taskStats.overdue}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Overdue Tasks
              </Text>
            </View>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <TrendingUp size={24} color={theme.colors.tertiary} />
              <Text variant="headlineSmall" style={styles.statValue}>
                {notes.length}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Total Notes
              </Text>
            </View>
          </Card>
        </View>

        <Card style={styles.progressCard}>
          <View style={styles.cardContent}>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Completion Rate
            </Text>
            <View style={styles.progressContainer}>
              <Text variant="headlineLarge" style={styles.percentageText}>
                {taskStats.completionRate.toFixed(0)}%
              </Text>
              <ProgressBar 
                progress={taskStats.completionRate / 100} 
                color={theme.colors.primary}
                style={styles.progressBar}
              />
              <Text variant="bodySmall" style={styles.progressLabel}>
                {taskStats.completed} of {taskStats.total} tasks completed
              </Text>
            </View>
          </View>
        </Card>

        <Card style={styles.chartCard}>
          <View style={styles.cardContent}>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Weekly Progress
            </Text>
            <BarChart
              data={barData}
              width={screenWidth - 64}
              height={220}
              chartConfig={chartConfig}
              showBarTops={false}
              showValuesOnTopOfBars
              style={styles.chart}
            />
          </View>
        </Card>

        {priorityPieData.length > 0 && (
          <Card style={styles.chartCard}>
            <View style={styles.cardContent}>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Tasks by Priority
              </Text>
              <PieChart
                data={priorityPieData}
                width={screenWidth - 64}
                height={200}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                style={styles.chart}
              />
            </View>
          </Card>
        )}

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.7,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    padding: 16,
    alignItems: 'center',
  },
  statContent: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    textAlign: 'center',
    opacity: 0.7,
  },
  progressCard: {
    margin: 16,
    marginTop: 24,
  },
  cardContent: {
    padding: 20,
  },
  cardTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  progressContainer: {
    alignItems: 'center',
  },
  percentageText: {
    fontWeight: '700',
    marginBottom: 12,
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressLabel: {
    opacity: 0.7,
  },
  chartCard: {
    margin: 16,
  },
  chart: {
    borderRadius: 16,
  },
  spacer: {
    height: 100,
  },
});