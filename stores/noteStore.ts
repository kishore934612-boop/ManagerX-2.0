import { create } from 'zustand';
import { Note } from '../types/database';
import { databaseService } from '../services/database';

interface NoteState {
  notes: Note[];
  filteredNotes: Note[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  filterColor: string | null;
  showPinnedOnly: boolean;
  
  // Actions
  loadNotes: (userId: string) => Promise<void>;
  createNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateNote: (note: Note) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  toggleNotePin: (noteId: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setFilterColor: (color: string | null) => void;
  setShowPinnedOnly: (show: boolean) => void;
  applyFilters: () => void;
  clearError: () => void;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  filteredNotes: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  filterColor: null,
  showPinnedOnly: false,

  loadNotes: async (userId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const notes = await databaseService.getNotes(userId);
      set({ notes, isLoading: false });
      get().applyFilters();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load notes',
        isLoading: false 
      });
    }
  },

  createNote: async (noteData) => {
    try {
      const note: Note = {
        ...noteData,
        id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await databaseService.createNote(note);
      
      const { notes } = get();
      const updatedNotes = [note, ...notes];
      set({ notes: updatedNotes });
      get().applyFilters();
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create note'
      });
    }
  },

  updateNote: async (note) => {
    try {
      const updatedNote = { ...note, updatedAt: new Date().toISOString() };
      await databaseService.updateNote(updatedNote);
      
      const { notes } = get();
      const updatedNotes = notes.map(n => n.id === note.id ? updatedNote : n);
      set({ notes: updatedNotes });
      get().applyFilters();
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update note'
      });
    }
  },

  deleteNote: async (noteId) => {
    try {
      const { notes } = get();
      const note = notes.find(n => n.id === noteId);
      if (!note) return;
      
      await databaseService.deleteNote(noteId, note.userId);
      
      const updatedNotes = notes.filter(n => n.id !== noteId);
      set({ notes: updatedNotes });
      get().applyFilters();
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete note'
      });
    }
  },

  toggleNotePin: async (noteId) => {
    try {
      const { notes } = get();
      const note = notes.find(n => n.id === noteId);
      if (!note) return;
      
      const updatedNote = { 
        ...note, 
        isPinned: !note.isPinned,
        updatedAt: new Date().toISOString()
      };
      
      await databaseService.updateNote(updatedNote);
      
      const updatedNotes = notes.map(n => n.id === noteId ? updatedNote : n);
      set({ notes: updatedNotes });
      get().applyFilters();
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to toggle note pin'
      });
    }
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().applyFilters();
  },

  setFilterColor: (color) => {
    set({ filterColor: color });
    get().applyFilters();
  },

  setShowPinnedOnly: (show) => {
    set({ showPinnedOnly: show });
    get().applyFilters();
  },

  applyFilters: () => {
    const { notes, searchQuery, filterColor, showPinnedOnly } = get();
    
    let filtered = notes.filter(note => {
      // Search query filter
      if (searchQuery && !note.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !note.content.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Color filter
      if (filterColor && note.color !== filterColor) {
        return false;
      }
      
      // Pinned filter
      if (showPinnedOnly && !note.isPinned) {
        return false;
      }
      
      return true;
    });

    // Sort by pinned status, then by updated date
    filtered.sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    set({ filteredNotes: filtered });
  },

  clearError: () => {
    set({ error: null });
  }
}));