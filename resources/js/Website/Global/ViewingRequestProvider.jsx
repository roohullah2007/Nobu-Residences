import React, { createContext, useContext, useState } from 'react';
import { ViewingRequestModal } from '@/Website/Global/Components';

/**
 * Global Viewing Request Context and Provider
 * Provides viewing request modal functionality across the entire application
 */
const ViewingRequestContext = createContext();

export const useViewingRequest = () => {
  const context = useContext(ViewingRequestContext);
  if (!context) {
    throw new Error('useViewingRequest must be used within a ViewingRequestProvider');
  }
  return context;
};

export const ViewingRequestProvider = ({ children }) => {
  const [viewingModal, setViewingModal] = useState({
    isOpen: false,
    property: null
  });

  const openViewingModal = (property) => {
    setViewingModal({
      isOpen: true,
      property: property
    });
  };

  const closeViewingModal = () => {
    setViewingModal({
      isOpen: false,
      property: null
    });
  };

  const contextValue = {
    openViewingModal,
    closeViewingModal,
    isOpen: viewingModal.isOpen,
    property: viewingModal.property
  };

  return (
    <ViewingRequestContext.Provider value={contextValue}>
      {children}
      
      {/* Global Viewing Request Modal */}
      <ViewingRequestModal 
        isOpen={viewingModal.isOpen}
        onClose={closeViewingModal}
        property={viewingModal.property}
      />
    </ViewingRequestContext.Provider>
  );
};

export default ViewingRequestProvider;