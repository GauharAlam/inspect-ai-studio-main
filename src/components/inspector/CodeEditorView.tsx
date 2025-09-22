import React from 'react';

const codeEditorStyle: React.CSSProperties = {
  backgroundColor: '#1e1e1e',
  color: '#d4d4d4',
  fontFamily: 'monospace',
  border: '1px solid #333',
  padding: '10px',
  width: '100%',
  height: 'calc(100vh - 100px)',
  boxSizing: 'border-box',
  outline: 'none',
};

const dummyCssCode = `
.button-primary {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
}

.button-primary:hover {
  background-color: #0056b3;
}
`;

export function CodeEditorView() {
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">Code Editor</h2>
      <textarea style={codeEditorStyle} defaultValue={dummyCssCode} />
    </div>
  );
}