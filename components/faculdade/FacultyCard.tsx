import React from 'react';

type Props = {
  title: string;
  count?: number;
  color?: string;
  onClick?: () => void;
};

export default function FacultyCard(
  {
    title,
    count,
    color = 'bg-blue-500',
    onClick,
  }: Props
) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded shadow ${color} text-white text-left w-full`}
    >
      <div className='flex items-center justify-between'>
        <div>
          <div className='text-sm opacity-90'>{title}</div>
          {typeof count === 'number' && (
            <div className='text-2xl font-semibold mt-1'>{count}</div>
          )}
        </div>
        <div className='text-xs opacity-80'>Ver</div>
      </div>
    </button>
  );
}
