
import React from 'react';
import { FiInfo, FiChevronLeft, FiChevronRight, FiMoreHorizontal } from 'react-icons/fi';

export const InfoIcon: React.FC = () => (
    <FiInfo className="h-5 w-5 text-gray-500" />
);

export const ChevronLeftIcon: React.FC = () => (
    <FiChevronLeft className="h-5 w-5 text-gray-500" strokeWidth={2.5} />
);

export const ChevronRightIcon: React.FC = () => (
    <FiChevronRight className="h-5 w-5 text-gray-500" strokeWidth={2.5} />
);

export const MoreHorizontalIcon: React.FC = () => (
    <FiMoreHorizontal className="h-5 w-5 text-gray-500" />
);
