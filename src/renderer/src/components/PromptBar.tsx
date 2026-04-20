import { useState, useRef, useEffect } from 'react';

interface PromptBarProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

export default function PromptBar({ onSubmit, isLoading }: PromptBarProps) {
  const [prompt, setPrompt] = useState('');
  
  // 1. We create a reference hook to grab the input element directly
  const inputRef = useRef<HTMLInputElement>(null);

  // 2. The Auto-Focus Magic: Watch Evelyn's loading state
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50); 
    }
  }, [isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && prompt.trim() && !isLoading) {
      onSubmit(prompt);
      setPrompt(''); // Clear the input after sending
    }
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: '40px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      width: '800px',
      backgroundColor: '#1E1E1E',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      display: 'flex',
      padding: '8px',
      border: '1px solid #333'
    }}>
      <input
        ref={inputRef} // 3. We attach our reference hook to the input
        autoFocus 
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Evelyn here, how can I help you?..Don't ask about Mummies though...."
        disabled={isLoading}
        style={{
          flex: 1,
          backgroundColor: 'transparent',
          border: 'none',
          color: 'white',
          padding: '8px 12px',
          outline: 'none',
          fontSize: '14px'
        }}
      />
      <button 
        onClick={() => {
          if (prompt.trim() && !isLoading) {
            onSubmit(prompt);
            setPrompt('');
          }
        }}
        disabled={isLoading || !prompt.trim()}
        style={{
          backgroundColor: isLoading ? '#444' : '#007ACC',
          color: isLoading ? '#888' : 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '8px 16px',
          cursor: isLoading || !prompt.trim() ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
          transition: 'background-color 0.2s'
        }}
      >
        {isLoading ? 'Thinking...' : 'Send'}
      </button>
    </div>
  );
}