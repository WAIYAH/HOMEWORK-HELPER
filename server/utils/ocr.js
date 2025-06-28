import Tesseract from 'tesseract.js';

export const processImageWithOCR = async (imageFile) => {
  try {
    console.log('Starting OCR processing...');
    
    const { data } = await Tesseract.recognize(
      imageFile.data || imageFile.tempFilePath,
      'eng',
      {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      }
    );

    console.log('OCR completed successfully');
    
    return {
      text: data.text.trim(),
      confidence: data.confidence,
      words: data.words.length,
      lines: data.lines.length
    };

  } catch (error) {
    console.error('OCR processing error:', error);
    throw new Error('Failed to extract text from image');
  }
};

export const preprocessImageForOCR = (imageBuffer) => {
  // This function could be expanded to include image preprocessing
  // such as noise reduction, contrast enhancement, etc.
  // For now, we'll return the image as-is
  return imageBuffer;
};

export const validateOCRResult = (ocrResult) => {
  const { text, confidence } = ocrResult;
  
  // Basic validation rules
  if (!text || text.length < 3) {
    return {
      isValid: false,
      reason: 'Text too short or empty'
    };
  }

  if (confidence < 30) {
    return {
      isValid: false,
      reason: 'Low confidence in text recognition'
    };
  }

  // Check if text contains mostly special characters
  const alphanumericRatio = (text.match(/[a-zA-Z0-9]/g) || []).length / text.length;
  if (alphanumericRatio < 0.3) {
    return {
      isValid: false,
      reason: 'Text contains too many special characters'
    };
  }

  return {
    isValid: true,
    reason: 'Text validation passed'
  };
};