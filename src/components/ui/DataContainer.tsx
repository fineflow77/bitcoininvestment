import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface DataContainerProps {
    isLoading: boolean;
    error: Error | null;
    children: React.ReactNode;
    loadingMessage?: string;
    className?: string;
}

const DataContainer: React.FC<DataContainerProps> = ({
    isLoading,
    error,
    children,
    loadingMessage = 'データを読み込み中...',
    className = '',
}) => {
    if (isLoading) {
        return (
            <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-btc-text font-medium">{loadingMessage}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-red-900/20 border border-red-700 rounded-lg p-6 ${className}`}>
                <h3 className="text-red-400 font-bold mb-2">エラーが発生しました</h3>
                <p className="text-btc-text">{error.message}</p>
            </div>
        );
    }

    return <>{children}</>;
};

export default DataContainer;