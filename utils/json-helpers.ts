/**
 * Safely parses JSON strings, handling common escaping issues
 * 
 * @param jsonString - The JSON string to parse
 * @returns The parsed JSON object or null if parsing fails
 */
export const safeJsonParse = (jsonString: string) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    // Try unescaping common issues
    try {
      // For cases like: "chartData": \[ with unexpected token '\'
      if (typeof jsonString === 'string' && jsonString.includes('\\[')) {
        console.log('Detected escaped brackets, attempting to fix');
        
        // More aggressive approach for severely escaped strings
        const cleanedJson = jsonString.replace(/\\+(?=["[{\\])/g, '');
        try {
          return JSON.parse(cleanedJson);
        } catch (cleaningError) {
          // If that didn't work, try a different approach
        }
      }
      
      // Handle double escaped brackets and quotes
      let fixedString = jsonString;
      
      // Common JSON escaping issues
      const replacements: [RegExp, string][] = [
        [/\\"/g, '"'],          // Replace \" with "
        [/\\{/g, '{'],          // Replace \{ with {
        [/\\}/g, '}'],          // Replace \} with }
        [/\\\[/g, '['],         // Replace \[ with [
        [/\\\]/g, ']'],         // Replace \] with ]
        [/\\\\/g, '\\'],        // Replace \\ with \
        [/\\n/g, '\n'],         // Replace \n with newline
        [/\\r/g, '\r'],         // Replace \r with carriage return
        [/\\t/g, '\t'],         // Replace \t with tab
      ];
      
      // Apply all replacements
      for (const [pattern, replacement] of replacements) {
        fixedString = fixedString.replace(pattern, replacement);
      }
      
      // Try to parse the fixed string
      return JSON.parse(fixedString);
    } catch (secondError) {
      console.error('Failed to parse chart data JSON after fixing:', secondError);
      
      // Last resort: try to sanitize the JSON more aggressively
      try {
        // This is a more aggressive approach that might work in some cases
        const sanitized = jsonString
          .replace(/\\/g, '') // Remove all backslashes
          .replace(/"\[/g, '[') // Fix "[ to [
          .replace(/\]"/g, ']'); // Fix ]" to ]
          
        return JSON.parse(sanitized);
      } catch (lastError) {
        console.error('All JSON parsing attempts failed:', lastError);
        return null;
      }
    }
  }
}; 