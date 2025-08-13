import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner; 