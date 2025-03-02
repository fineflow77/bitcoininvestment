// src/components/ErrorBoundary.jsx

import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            errorInfo: errorInfo
        });
        console.error("コンポーネントエラー:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="bg-red-700 text-white p-4 rounded-md">
                    <h2 className="text-xl font-bold mb-2">エラーが発生しました</h2>
                    <p>ページを再読み込みしてください。問題が解決しない場合は、管理者にお問い合わせください。</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-3 bg-white text-red-700 px-4 py-2 rounded-md"
                    >
                        再読み込み
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;