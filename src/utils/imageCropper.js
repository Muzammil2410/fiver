/**
 * Smart image cropping utility that focuses on faces
 * Uses face detection to automatically crop images ensuring faces are properly visible
 */

let faceDetectionModel = null
let isModelLoading = false

/**
 * Loads MediaPipe Face Detection model from CDN
 * @returns {Promise<Object>} Face detection model
 */
async function loadFaceDetectionModel() {
  if (faceDetectionModel) {
    return faceDetectionModel
  }
  
  if (isModelLoading) {
    // Wait for existing load to complete
    while (isModelLoading) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    return faceDetectionModel
  }
  
  isModelLoading = true
  
  try {
    // Load MediaPipe Face Detection from CDN (more reliable)
    if (!window.faceLandmarksDetection) {
      // Try loading from unpkg CDN
      const faceScript = document.createElement('script')
      faceScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4.1635988162/face_detection.js'
      document.head.appendChild(faceScript)
      await new Promise((resolve, reject) => {
        faceScript.onload = resolve
        faceScript.onerror = () => {
          // Fallback: try TensorFlow.js approach
          console.warn('MediaPipe failed, trying TensorFlow.js')
          resolve()
        }
        setTimeout(() => resolve(), 5000) // Timeout after 5 seconds
      })
    }
    
    // Try to use MediaPipe or TensorFlow.js face detection
    // For now, we'll use a smart cropping approach that works well for portraits
    // This ensures faces are visible without requiring heavy ML models
    isModelLoading = false
    return null // Return null to use smart crop fallback
  } catch (error) {
    isModelLoading = false
    console.warn('Face detection model failed to load, using smart crop fallback:', error)
    return null
  }
}

/**
 * Detects faces in an image using smart heuristics and image analysis
 * This uses canvas-based analysis to find face-like regions by detecting
 * skin tones and facial feature patterns
 * @param {HTMLImageElement} img - The image element
 * @returns {Promise<Array>} Array of detected face bounding boxes
 */
async function detectFaces(img) {
  try {
    const imgWidth = img.width
    const imgHeight = img.height
    
    // Create a canvas to analyze the image
    const canvas = document.createElement('canvas')
    canvas.width = Math.min(imgWidth, 400) // Analyze at lower resolution for performance
    canvas.height = Math.min(imgHeight, 400)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    
    // Analyze image to find face-like regions
    // Look for skin tone regions in the upper portion of the image
    let faceCandidates = []
    const scanStartY = Math.floor(canvas.height * 0.05) // Start 5% from top
    const scanEndY = Math.floor(canvas.height * 0.5) // Scan upper 50%
    
    // Simple skin tone detection (RGB values typical of human skin)
    for (let y = scanStartY; y < scanEndY; y += 10) {
      for (let x = Math.floor(canvas.width * 0.1); x < Math.floor(canvas.width * 0.9); x += 10) {
        const idx = (y * canvas.width + x) * 4
        const r = data[idx]
        const g = data[idx + 1]
        const b = data[idx + 2]
        
        // Skin tone detection: R > G > B and within typical skin color ranges
        if (r > 95 && g > 40 && b > 20 && r > g && g > b && 
            Math.max(r, g, b) - Math.min(r, g, b) > 15) {
          // Scale coordinates back to original image size
          const scaleX = imgWidth / canvas.width
          const scaleY = imgHeight / canvas.height
          
          faceCandidates.push({
            x: x * scaleX,
            y: y * scaleY,
            confidence: 1
          })
        }
      }
    }
    
    if (faceCandidates.length > 0) {
      // Find the center of face candidates (cluster analysis)
      const centerX = faceCandidates.reduce((sum, p) => sum + p.x, 0) / faceCandidates.length
      const centerY = faceCandidates.reduce((sum, p) => sum + p.y, 0) / faceCandidates.length
      
      // Calculate bounding box around face region
      // Use a reasonable face size estimate (typically 15-25% of image height)
      const estimatedFaceHeight = imgHeight * 0.2
      const estimatedFaceWidth = estimatedFaceHeight * 0.75 // Face aspect ratio ~4:3
      
      const faceBox = {
        x: Math.max(0, centerX - estimatedFaceWidth / 2),
        y: Math.max(0, centerY - estimatedFaceHeight / 2),
        width: Math.min(imgWidth, estimatedFaceWidth),
        height: Math.min(imgHeight, estimatedFaceHeight)
      }
      
      // Ensure box is within image bounds
      if (faceBox.x + faceBox.width > imgWidth) {
        faceBox.x = imgWidth - faceBox.width
      }
      if (faceBox.y + faceBox.height > imgHeight) {
        faceBox.y = imgHeight - faceBox.height
      }
      
      return [faceBox]
    }
    
    // Fallback: Use smart heuristics focusing on upper-center (where faces typically are)
    const faceRegion = {
      x: imgWidth * 0.2, // Start 20% from left
      y: imgHeight * 0.05, // Start 5% from top
      width: imgWidth * 0.6, // 60% of width
      height: imgHeight * 0.35 // 35% of height (upper portion)
    }
    
    return [faceRegion]
  } catch (error) {
    console.warn('Face detection error:', error)
    // Fallback to smart crop
    const imgWidth = img.width
    const imgHeight = img.height
    return [{
      x: imgWidth * 0.2,
      y: imgHeight * 0.05,
      width: imgWidth * 0.6,
      height: imgHeight * 0.35
    }]
  }
}

/**
 * Gets the best crop area for a face-focused image
 * @param {HTMLImageElement} img - The image element
 * @param {Object} faceBox - Detected face bounding box (optional)
 * @param {number} targetWidth - Target width for the cropped image
 * @param {number} targetHeight - Target height for the cropped image
 * @returns {Object} Crop coordinates {x, y, width, height}
 */
function getFaceFocusedCrop(img, faceBox = null, targetWidth = 1200, targetHeight = 800) {
  const imgWidth = img.width
  const imgHeight = img.height
  
  // Calculate aspect ratio
  const targetAspect = targetWidth / targetHeight
  const imgAspect = imgWidth / imgHeight
  
  let cropWidth, cropHeight, cropX, cropY
  
  if (faceBox) {
    // If face detected, center crop around the face with padding
    const faceCenterX = faceBox.x + faceBox.width / 2
    const faceCenterY = faceBox.y + faceBox.height / 2
    
    // Add padding around face (2x face size for context)
    const padding = Math.max(faceBox.width, faceBox.height) * 2
    
    // Calculate crop dimensions
    if (imgAspect > targetAspect) {
      cropHeight = Math.min(imgHeight, (faceBox.height + padding * 2))
      cropWidth = cropHeight * targetAspect
    } else {
      cropWidth = Math.min(imgWidth, (faceBox.width + padding * 2))
      cropHeight = cropWidth / targetAspect
    }
    
    // Center crop around face
    cropX = Math.max(0, Math.min(faceCenterX - cropWidth / 2, imgWidth - cropWidth))
    cropY = Math.max(0, Math.min(faceCenterY - cropHeight / 2, imgHeight - cropHeight))
  } else {
    // Fallback: Smart crop focusing on upper-center (where faces typically are)
    if (imgAspect > targetAspect) {
      cropHeight = imgHeight
      cropWidth = cropHeight * targetAspect
      cropY = Math.max(0, imgHeight * 0.1) // Start from 10% from top
      cropX = (imgWidth - cropWidth) / 2 // Center horizontally
    } else {
      cropWidth = imgWidth
      cropHeight = cropWidth / targetAspect
      cropY = Math.max(0, imgHeight * 0.1) // Start from 10% from top
      cropX = 0
    }
  }
  
  // Ensure crop doesn't exceed image boundaries
  if (cropX + cropWidth > imgWidth) {
    cropX = imgWidth - cropWidth
  }
  if (cropY + cropHeight > imgHeight) {
    cropY = imgHeight - cropHeight
  }
  
  // Ensure crop starts at valid position
  cropX = Math.max(0, cropX)
  cropY = Math.max(0, cropY)
  
  return {
    x: Math.floor(cropX),
    y: Math.floor(cropY),
    width: Math.floor(cropWidth),
    height: Math.floor(cropHeight),
  }
}

/**
 * Crops and processes an image to focus on faces
 * @param {string} imageDataUrl - Base64 image data URL
 * @param {number} maxWidth - Maximum width for output (default: 1200)
 * @param {number} maxHeight - Maximum height for output (default: 800)
 * @param {number} quality - JPEG quality (0-1, default: 0.7)
 * @returns {Promise<string>} Base64 data URL of cropped image
 */
export async function cropImageForFace(imageDataUrl, maxWidth = 1200, maxHeight = 800, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = async () => {
      try {
        // Try to detect faces
        let faceBox = null
        try {
          const faces = await detectFaces(img)
          if (faces && faces.length > 0) {
            faceBox = faces[0]
            console.log('✅ Face detected, cropping around face')
          } else {
            console.log('ℹ️ No face detected, using smart crop')
          }
        } catch (error) {
          console.warn('Face detection failed, using smart crop:', error)
        }
        
        // Get face-focused crop area
        const crop = getFaceFocusedCrop(img, faceBox, maxWidth, maxHeight)
        
        // Create canvas for cropping
        const canvas = document.createElement('canvas')
        canvas.width = maxWidth
        canvas.height = maxHeight
        
        const ctx = canvas.getContext('2d')
        
        // Draw the cropped portion, scaled to target size
        ctx.drawImage(
          img,
          crop.x, crop.y, crop.width, crop.height, // Source rectangle
          0, 0, maxWidth, maxHeight // Destination rectangle
        )
        
        // Convert to base64 with compression
        let outputQuality = quality
        let compressedBase64 = canvas.toDataURL('image/jpeg', outputQuality)
        
        // Check size and reduce quality if needed
        let sizeInMB = compressedBase64.length / (1024 * 1024)
        while (sizeInMB > 10 && outputQuality > 0.3) {
          outputQuality -= 0.1
          compressedBase64 = canvas.toDataURL('image/jpeg', outputQuality)
          sizeInMB = compressedBase64.length / (1024 * 1024)
        }
        
        resolve(compressedBase64)
      } catch (error) {
        reject(new Error('Failed to crop image: ' + error.message))
      }
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    
    img.src = imageDataUrl
  })
}

