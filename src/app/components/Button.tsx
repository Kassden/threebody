interface ButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export default function Button({ active, onClick, children }: ButtonProps) {
  return (
    <button
      className={`px-4 py-2 mr-2 rounded transition-colors ${
        active 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-200 hover:bg-gray-300'
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
} 