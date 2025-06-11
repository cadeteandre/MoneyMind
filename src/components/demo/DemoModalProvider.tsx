"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useLanguage } from '@/components/providers/language-provider';
import { useTranslation } from '@/app/i18n/client';

type DemoLimitationType = 
  | 'addTransaction'
  | 'editProfile' 
  | 'deleteData'
  | 'exportData'
  | 'addCategory'
  | 'setBudgets'
  | 'generateReports'
  | 'custom';

interface DemoModalState {
  isOpen: boolean;
  limitationType: DemoLimitationType;
  customMessage?: string;
}

interface DemoModalContextType {
  // State
  isOpen: boolean;
  limitationType: DemoLimitationType;
  
  // Actions
  showLimitation: (type: DemoLimitationType, customMessage?: string) => void;
  closeModal: () => void;
  
  // Quick helpers
  showAddTransactionLimitation: () => void;
  showEditProfileLimitation: () => void;
  showDeleteDataLimitation: () => void;
  showExportDataLimitation: () => void;
  showAddCategoryLimitation: () => void;
  showSetBudgetsLimitation: () => void;
  showGenerateReportsLimitation: () => void;
  showCustomLimitation: (message: string) => void;
  
  // Utilities
  getLimitationMessage: () => string;
  translations: (key: string) => string;
}

const DemoModalContext = createContext<DemoModalContextType | undefined>(undefined);

export function DemoModalProvider({ children }: { children: React.ReactNode }) {
  const { userLocale } = useLanguage();
  const { t } = useTranslation(userLocale, 'demo-modal');
  
  const [modalState, setModalState] = useState<DemoModalState>({
    isOpen: false,
    limitationType: 'addTransaction',
    customMessage: undefined
  });

  // Show modal for specific limitation type
  const showLimitation = useCallback((
    type: DemoLimitationType, 
    customMessage?: string
  ) => {
    setModalState({
      isOpen: true,
      limitationType: type,
      customMessage
    });
  }, []);

  // Close modal
  const closeModal = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      isOpen: false
    }));
  }, []);

  // Get limitation message based on type
  const getLimitationMessage = useCallback(() => {
    if (modalState.limitationType === 'custom' && modalState.customMessage) {
      return modalState.customMessage;
    }
    
    return t(`limitations.${modalState.limitationType}`);
  }, [modalState.limitationType, modalState.customMessage, t]);

  // Quick helper functions for common limitations
  const showAddTransactionLimitation = useCallback(() => {
    showLimitation('addTransaction');
  }, [showLimitation]);

  const showEditProfileLimitation = useCallback(() => {
    showLimitation('editProfile');
  }, [showLimitation]);

  const showDeleteDataLimitation = useCallback(() => {
    showLimitation('deleteData');
  }, [showLimitation]);

  const showExportDataLimitation = useCallback(() => {
    showLimitation('exportData');
  }, [showLimitation]);

  const showAddCategoryLimitation = useCallback(() => {
    showLimitation('addCategory');
  }, [showLimitation]);

  const showSetBudgetsLimitation = useCallback(() => {
    showLimitation('setBudgets');
  }, [showLimitation]);

  const showGenerateReportsLimitation = useCallback(() => {
    showLimitation('generateReports');
  }, [showLimitation]);

  const showCustomLimitation = useCallback((message: string) => {
    showLimitation('custom', message);
  }, [showLimitation]);

  const contextValue: DemoModalContextType = {
    // State
    isOpen: modalState.isOpen,
    limitationType: modalState.limitationType,
    
    // Actions
    showLimitation,
    closeModal,
    
    // Quick helpers
    showAddTransactionLimitation,
    showEditProfileLimitation,
    showDeleteDataLimitation,
    showExportDataLimitation,
    showAddCategoryLimitation,
    showSetBudgetsLimitation,
    showGenerateReportsLimitation,
    showCustomLimitation,
    
    // Utilities
    getLimitationMessage,
    translations: t
  };

  return (
    <DemoModalContext.Provider value={contextValue}>
      {children}
    </DemoModalContext.Provider>
  );
}

export function useDemoModalContext() {
  const context = useContext(DemoModalContext);
  if (context === undefined) {
    throw new Error('useDemoModalContext must be used within a DemoModalProvider');
  }
  return context;
} 