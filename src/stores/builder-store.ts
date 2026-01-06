import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { Form } from "@/lib/db/schema/forms";
import type {
  BuilderQuestion,
  PreviewMode,
  HistoryAction,
} from "@/types/builder";

// Default question values
function createDefaultQuestion(
  type: string,
  order: number
): Omit<BuilderQuestion, "id"> {
  return {
    type: type as BuilderQuestion["type"],
    title: "",
    description: null,
    placeholder: null,
    order,
    groupId: null,
    required: false,
    validations: {},
    settings: {},
    image: null,
    video: null,
    logicJump: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    isNew: true,
    options: [],
  };
}

interface FormBuilderState {
  // Form metadata
  form: Form | null;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;
  saveError: string | null;

  // Questions
  questions: BuilderQuestion[];
  selectedQuestionId: string | null;

  // History for undo/redo
  history: HistoryAction[];
  historyIndex: number;

  // UI State
  previewMode: PreviewMode;
  sidebarCollapsed: boolean;
  previewCollapsed: boolean;
}

interface FormBuilderActions {
  // Form actions
  setForm: (form: Form, questions: BuilderQuestion[]) => void;
  updateFormMeta: (updates: Partial<Form>) => void;
  resetBuilder: () => void;

  // Question actions
  addQuestion: (type: string, index?: number) => string;
  updateQuestion: (id: string, updates: Partial<BuilderQuestion>) => void;
  deleteQuestion: (id: string) => void;
  duplicateQuestion: (id: string) => string | null;
  reorderQuestions: (activeId: string, overId: string) => void;
  selectQuestion: (id: string | null) => void;

  // History actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // UI actions
  setPreviewMode: (mode: PreviewMode) => void;
  toggleSidebar: () => void;
  togglePreview: () => void;

  // Save state
  setSaving: (isSaving: boolean) => void;
  setSaveError: (error: string | null) => void;
  markSaved: () => void;
}

const MAX_HISTORY_SIZE = 50;

const initialState: FormBuilderState = {
  form: null,
  isDirty: false,
  isSaving: false,
  lastSavedAt: null,
  saveError: null,
  questions: [],
  selectedQuestionId: null,
  history: [],
  historyIndex: -1,
  previewMode: "desktop",
  sidebarCollapsed: false,
  previewCollapsed: false,
};

export const useBuilderStore = create<FormBuilderState & FormBuilderActions>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        ...initialState,

        // Form actions
        setForm: (form, questions) => {
          set((state) => {
            state.form = form;
            state.questions = questions;
            state.isDirty = false;
            state.selectedQuestionId = null;
            state.history = [];
            state.historyIndex = -1;
          });
        },

        updateFormMeta: (updates) => {
          set((state) => {
            if (state.form) {
              Object.assign(state.form, updates);
              state.isDirty = true;
            }
          });
        },

        resetBuilder: () => {
          set(initialState);
        },

        // Question actions
        addQuestion: (type, index) => {
          const id = crypto.randomUUID();
          set((state) => {
            // Save to history
            state.history = state.history.slice(0, state.historyIndex + 1);
            state.history.push({
              type: "ADD_QUESTION",
              timestamp: Date.now(),
              data: { id, type, index },
              previousState: JSON.parse(JSON.stringify(state.questions)),
            });
            if (state.history.length > MAX_HISTORY_SIZE) {
              state.history.shift();
            }
            state.historyIndex = state.history.length - 1;

            // Add question
            const insertIndex = index ?? state.questions.length;
            const newQuestion: BuilderQuestion = {
              id,
              ...createDefaultQuestion(type, insertIndex),
            };

            state.questions.splice(insertIndex, 0, newQuestion);

            // Update order for all questions after insert
            state.questions.forEach((q, i) => {
              q.order = i;
            });

            state.selectedQuestionId = id;
            state.isDirty = true;
          });
          return id;
        },

        updateQuestion: (id, updates) => {
          set((state) => {
            const questionIndex = state.questions.findIndex((q) => q.id === id);
            if (questionIndex === -1) return;

            // Save to history
            state.history = state.history.slice(0, state.historyIndex + 1);
            state.history.push({
              type: "UPDATE_QUESTION",
              timestamp: Date.now(),
              data: { id, updates },
              previousState: JSON.parse(JSON.stringify(state.questions)),
            });
            if (state.history.length > MAX_HISTORY_SIZE) {
              state.history.shift();
            }
            state.historyIndex = state.history.length - 1;

            // Update question
            Object.assign(state.questions[questionIndex], updates);
            state.questions[questionIndex].updatedAt = new Date();
            state.isDirty = true;
          });
        },

        deleteQuestion: (id) => {
          set((state) => {
            const questionIndex = state.questions.findIndex((q) => q.id === id);
            if (questionIndex === -1) return;

            // Save to history
            state.history = state.history.slice(0, state.historyIndex + 1);
            state.history.push({
              type: "DELETE_QUESTION",
              timestamp: Date.now(),
              data: { id },
              previousState: JSON.parse(JSON.stringify(state.questions)),
            });
            if (state.history.length > MAX_HISTORY_SIZE) {
              state.history.shift();
            }
            state.historyIndex = state.history.length - 1;

            // Remove question
            state.questions.splice(questionIndex, 1);

            // Update order for remaining questions
            state.questions.forEach((q, i) => {
              q.order = i;
            });

            // Deselect if deleted question was selected
            if (state.selectedQuestionId === id) {
              state.selectedQuestionId = null;
            }

            state.isDirty = true;
          });
        },

        duplicateQuestion: (id) => {
          const state = get();
          const question = state.questions.find((q) => q.id === id);
          if (!question) return null;

          const newId = crypto.randomUUID();
          set((state) => {
            const sourceIndex = state.questions.findIndex((q) => q.id === id);
            if (sourceIndex === -1) return;

            // Save to history
            state.history = state.history.slice(0, state.historyIndex + 1);
            state.history.push({
              type: "DUPLICATE_QUESTION",
              timestamp: Date.now(),
              data: { sourceId: id, newId },
              previousState: JSON.parse(JSON.stringify(state.questions)),
            });
            if (state.history.length > MAX_HISTORY_SIZE) {
              state.history.shift();
            }
            state.historyIndex = state.history.length - 1;

            // Create duplicate
            const duplicate: BuilderQuestion = {
              ...JSON.parse(JSON.stringify(question)),
              id: newId,
              order: sourceIndex + 1,
              isNew: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            state.questions.splice(sourceIndex + 1, 0, duplicate);

            // Update order for all questions
            state.questions.forEach((q, i) => {
              q.order = i;
            });

            state.selectedQuestionId = newId;
            state.isDirty = true;
          });

          return newId;
        },

        reorderQuestions: (activeId, overId) => {
          if (activeId === overId) return;

          set((state) => {
            const activeIndex = state.questions.findIndex(
              (q) => q.id === activeId
            );
            const overIndex = state.questions.findIndex((q) => q.id === overId);

            if (activeIndex === -1 || overIndex === -1) return;

            // Save to history
            state.history = state.history.slice(0, state.historyIndex + 1);
            state.history.push({
              type: "REORDER_QUESTIONS",
              timestamp: Date.now(),
              data: { activeId, overId },
              previousState: JSON.parse(JSON.stringify(state.questions)),
            });
            if (state.history.length > MAX_HISTORY_SIZE) {
              state.history.shift();
            }
            state.historyIndex = state.history.length - 1;

            // Reorder
            const [removed] = state.questions.splice(activeIndex, 1);
            state.questions.splice(overIndex, 0, removed);

            // Update order for all questions
            state.questions.forEach((q, i) => {
              q.order = i;
            });

            state.isDirty = true;
          });
        },

        selectQuestion: (id) => {
          set((state) => {
            state.selectedQuestionId = id;
          });
        },

        // History actions
        undo: () => {
          set((state) => {
            if (state.historyIndex < 0) return;

            const action = state.history[state.historyIndex];
            state.questions = JSON.parse(
              JSON.stringify(action.previousState)
            ) as BuilderQuestion[];
            state.historyIndex -= 1;
            state.isDirty = true;
          });
        },

        redo: () => {
          set((state) => {
            if (state.historyIndex >= state.history.length - 1) return;

            state.historyIndex += 1;
            // Re-apply the action
            // For simplicity, we just move the index forward
            // The actual redo logic would need to re-apply the action
          });
        },

        canUndo: () => {
          const state = get();
          return state.historyIndex >= 0;
        },

        canRedo: () => {
          const state = get();
          return state.historyIndex < state.history.length - 1;
        },

        // UI actions
        setPreviewMode: (mode) => {
          set((state) => {
            state.previewMode = mode;
          });
        },

        toggleSidebar: () => {
          set((state) => {
            state.sidebarCollapsed = !state.sidebarCollapsed;
          });
        },

        togglePreview: () => {
          set((state) => {
            state.previewCollapsed = !state.previewCollapsed;
          });
        },

        // Save state
        setSaving: (isSaving) => {
          set((state) => {
            state.isSaving = isSaving;
          });
        },

        setSaveError: (error) => {
          set((state) => {
            state.saveError = error;
          });
        },

        markSaved: () => {
          set((state) => {
            state.isDirty = false;
            state.lastSavedAt = new Date();
            state.isSaving = false;
            state.saveError = null;
          });
        },
      }))
    ),
    { name: "form-builder" }
  )
);
