import cv2
import numpy as np

def remove_right_bar(image_path):
    """
    Automatically remove the right-side temperature scale bar from thermal images.
    
    Args:
        image_path (str): Path to input image.
        output_path (str): Path to save cropped image.
    """
    # Load image
    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Normalize and threshold to highlight bright vertical bar
    _, thresh = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY)

    # Find contours
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Assume the bar is the largest vertical contour near the right edge
    max_area = 0
    bar_x = None
    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        if x > gray.shape[1] * 0.7:  # ensure it's near right edge
            area = w * h
            if area > max_area:
                max_area = area
                bar_x = x

    if bar_x is not None:
        cropped = img[:, :bar_x]  # crop everything left of bar
    else:
        cropped = img  # fallback: no crop if no bar detected

    return cropped
