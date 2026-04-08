export const formatBoldText = (text) => {
  if (!text) return text;
  
  // Split the text by anything wrapped in ** **
  const parts = text.split(/(\*\*.*?\*\*)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      // Remove the ** and wrap the text in a strong tag
      return (
        <strong key={index} className="font-bold text-text-primary">
          {part.slice(2, -2)}
        </strong>
      );
    }
    // Return standard text normally
    return <span key={index}>{part}</span>;
  });
};