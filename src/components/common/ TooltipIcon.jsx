// src/components/common/TooltipIcon.jsx
import React from 'react';
import { HelpCircle } from 'lucide-react';

const TooltipIcon = ({ content }) => (
  <div className="group relative inline-block ml-2">
    <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-300 cursor-help transition-colors" />
    <div className="invisible group-hover:visible absolute z-10 w-64 p-2 mt-2 text-sm text-gray-300 bg-gray-800 rounded-lg shadow-lg -translate-x-1/2 left-1/2">
      <div>{content}</div>
    </div>
  </div>
);

export default TooltipIcon;