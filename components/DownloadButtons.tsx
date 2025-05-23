'use client';

import React, { useState } from 'react';
import { Button, HStack, useToast, Tooltip, Text, VStack } from '@chakra-ui/react';
import { toPng } from 'html-to-image';
import { PDFDocument, rgb } from 'pdf-lib';
import { utils, write } from 'xlsx';
import { TimetableData } from '@/types/timetable';

interface DownloadButtonsProps {
  timetableRef: React.RefObject<HTMLDivElement>;
  data: TimetableData;
}

export const DownloadButtons: React.FC<DownloadButtonsProps> = ({
  timetableRef,
  data,
}) => {
  const toast = useToast();
  const [isDownloading, setIsDownloading] = useState<'png' | 'pdf' | 'excel' | 'jpg' | null>(null);

  const downloadAsPNG = async () => {
    if (!timetableRef.current) return;
    
    setIsDownloading('png');
    try {
      // Info screen dimensions (portrait mode)
      const infoScreenWidth = 1080;
      const infoScreenHeight = 1920;
      
      // Create a temporary div to hold a clone of the timetable for export
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = `${infoScreenWidth}px`;
      document.body.appendChild(tempDiv);
      
      // Clone the timetable content
      if (timetableRef.current) {
        const clone = timetableRef.current.cloneNode(true) as HTMLElement;
        
        // Apply styles for the export
        clone.style.width = `${infoScreenWidth}px`;
        clone.style.height = 'auto';
        clone.style.overflow = 'visible';
        clone.style.backgroundColor = getBackgroundColor(data.session);
        
        // Fix for logo aspect ratio preservation with increased size
        const logoImgs = clone.querySelectorAll('img');
        logoImgs.forEach(img => {
          // Target logo specifically
          if (img.src.includes('BSBI-Logo')) {
            img.style.width = '500px'; // Increased from auto
            img.style.height = '500px'; // Increased from auto
            img.style.maxHeight = '500px'; // Increased from 300px
            img.style.maxWidth = '500px'; // Increased from 300px
            img.style.minHeight = '500px'; // Added to ensure minimum size
            img.style.minWidth = '500px'; // Added to ensure minimum size
            img.style.objectFit = 'contain';
            img.style.aspectRatio = '1 / 1';
            img.style.transform = 'none';
            img.style.scale = '1';
            
            // Center the logo better
            const logoContainer = img.parentElement;
            if (logoContainer) {
              logoContainer.style.display = 'flex';
              logoContainer.style.justifyContent = 'center';
              logoContainer.style.alignItems = 'center';
              logoContainer.style.minHeight = '500px';
            }
          }
        });
        
        tempDiv.appendChild(clone);
        
        // Capture the image with exact dimensions
        const dataUrl = await toPng(clone, {
          quality: 1.0,
          pixelRatio: 2,
          width: infoScreenWidth,
          height: clone.offsetHeight > infoScreenHeight ? clone.offsetHeight : infoScreenHeight,
          cacheBust: true,
          skipAutoScale: true,
          style: {
            margin: '0',
            padding: '0',
          }
        });
        
        // Create a canvas for the final image with proper aspect ratio
        const canvas = document.createElement('canvas');
        canvas.width = infoScreenWidth;
        canvas.height = infoScreenHeight;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Fill background
          ctx.fillStyle = getBackgroundColor(data.session);
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Load the captured image
          const img = new Image();
          img.onload = () => {
            // Calculate positioning to center the content vertically
            const contentHeight = Math.min(img.height, infoScreenHeight);
            const yPos = Math.max(0, (infoScreenHeight - contentHeight) / 2);
            
            // Preserve aspect ratio when drawing the image
            const aspectRatio = img.width / img.height;
            const drawWidth = infoScreenWidth;
            const drawHeight = drawWidth / aspectRatio;
            
            // Draw the image centered on the canvas
            ctx.drawImage(img, 0, yPos, drawWidth, drawHeight);
            
            // Create download link
            const finalDataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `timetable-${data.session.toLowerCase()}-${data.date}.png`;
            link.href = finalDataUrl;
            link.click();
            
            // Cleanup
            document.body.removeChild(tempDiv);
            
            toast({
              title: 'PNG downloaded successfully',
              description: 'Image sized to 1080x1920 for info screens',
              status: 'success',
              duration: 3000,
            });
            
            setIsDownloading(null);
          };
          
          img.onerror = () => {
            document.body.removeChild(tempDiv);
            toast({
              title: 'Error creating PNG',
              description: 'Failed to process the image',
              status: 'error',
              duration: 5000,
            });
            setIsDownloading(null);
          };
          
          img.src = dataUrl;
        } else {
          throw new Error('Could not get canvas context');
        }
      }
    } catch (error) {
      toast({
        title: 'Error downloading PNG',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
      setIsDownloading(null);
    }
  };

  const downloadAsJPG = async () => {
    if (!timetableRef.current) return;
    
    setIsDownloading('jpg');
    try {
      // Info screen dimensions (portrait mode)
      const infoScreenWidth = 1080;
      const infoScreenHeight = 1920;
      
      // Create a temporary div to hold a clone of the timetable for export
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = `${infoScreenWidth}px`;
      document.body.appendChild(tempDiv);
      
      // Clone the timetable content
      if (timetableRef.current) {
        const clone = timetableRef.current.cloneNode(true) as HTMLElement;
        
        // Apply styles for the export
        clone.style.width = `${infoScreenWidth}px`;
        clone.style.height = 'auto';
        clone.style.overflow = 'visible';
        clone.style.backgroundColor = getBackgroundColor(data.session);
        
        // Fix for logo aspect ratio preservation with increased size
        const logoImgs = clone.querySelectorAll('img');
        logoImgs.forEach(img => {
          // Target logo specifically
          if (img.src.includes('BSBI-Logo')) {
            img.style.width = '500px'; // Increased from auto
            img.style.height = '500px'; // Increased from auto
            img.style.maxHeight = '500px'; // Increased from 300px
            img.style.maxWidth = '500px'; // Increased from 300px
            img.style.minHeight = '500px'; // Added to ensure minimum size
            img.style.minWidth = '500px'; // Added to ensure minimum size
            img.style.objectFit = 'contain';
            img.style.aspectRatio = '1 / 1';
            img.style.transform = 'none';
            img.style.scale = '1';
            
            // Center the logo better
            const logoContainer = img.parentElement;
            if (logoContainer) {
              logoContainer.style.display = 'flex';
              logoContainer.style.justifyContent = 'center';
              logoContainer.style.alignItems = 'center';
              logoContainer.style.minHeight = '500px';
            }
          }
        });
        
        tempDiv.appendChild(clone);
        
        // Capture the image with exact dimensions
        const dataUrl = await toPng(clone, {
          quality: 1.0,
          pixelRatio: 2,
          width: infoScreenWidth,
          height: clone.offsetHeight > infoScreenHeight ? clone.offsetHeight : infoScreenHeight,
          cacheBust: true,
          skipAutoScale: true,
          style: {
            margin: '0',
            padding: '0',
          }
        });
        
        // Create a canvas for the final image with proper aspect ratio
        const canvas = document.createElement('canvas');
        canvas.width = infoScreenWidth;
        canvas.height = infoScreenHeight;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Fill background
          ctx.fillStyle = getBackgroundColor(data.session);
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Load the captured image
          const img = new Image();
          img.onload = () => {
            // Calculate positioning to center the content vertically
            const contentHeight = Math.min(img.height, infoScreenHeight);
            const yPos = Math.max(0, (infoScreenHeight - contentHeight) / 2);
            
            // Preserve aspect ratio when drawing the image
            const aspectRatio = img.width / img.height;
            const drawWidth = infoScreenWidth;
            const drawHeight = drawWidth / aspectRatio;
            
            // Draw the image centered on the canvas
            ctx.drawImage(img, 0, yPos, drawWidth, drawHeight);
            
            // Create download link
            const finalDataUrl = canvas.toDataURL('image/jpeg', 0.95); // Increased quality to 95%
            const link = document.createElement('a');
            link.download = `timetable-${data.session.toLowerCase()}-${data.date}.jpg`;
            link.href = finalDataUrl;
            link.click();
            
            // Cleanup
            document.body.removeChild(tempDiv);
            
            toast({
              title: 'JPG downloaded successfully',
              description: 'Image sized to 1080x1920 for info screens',
              status: 'success',
              duration: 3000,
            });
            
            setIsDownloading(null);
          };
          
          img.onerror = () => {
            document.body.removeChild(tempDiv);
            toast({
              title: 'Error creating JPG',
              description: 'Failed to process the image',
              status: 'error',
              duration: 5000,
            });
            setIsDownloading(null);
          };
          
          img.src = dataUrl;
        } else {
          throw new Error('Could not get canvas context');
        }
      }
    } catch (error) {
      toast({
        title: 'Error downloading JPG',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
      setIsDownloading(null);
    }
  };

  // Helper function to get the background color based on session
  const getBackgroundColor = (session: string): string => {
    switch (session) {
      case 'Morning':
        return '#4a7fcb'; // Morning blue
      case 'Noon':
        return '#F7B32B'; // Noon yellow
      case 'Afternoon':
        return '#1A365D'; // Afternoon dark blue
      default:
        return '#4a7fcb'; // Default to morning blue
    }
  };

  const downloadAsPDF = async () => {
    if (!timetableRef.current) return;

    setIsDownloading('pdf');
    try {
      const dataUrl = await toPng(timetableRef.current, {
        quality: 1.0,
        pixelRatio: 3,
        cacheBust: true,
        canvasWidth: timetableRef.current.scrollWidth,
        canvasHeight: timetableRef.current.scrollHeight,
        imagePlaceholder: '/images/BSBI-Logo.png',
        fetchRequestInit: { cache: 'no-cache' },
      });
      
      const imageBytes = await fetch(dataUrl).then(res => res.arrayBuffer());
      
      const pdfDoc = await PDFDocument.create();
      
      const timetableWidth = timetableRef.current.scrollWidth;
      const timetableHeight = timetableRef.current.scrollHeight;
      
      const pageWidth = 842;
      const pageHeight = Math.floor((pageWidth / timetableWidth) * timetableHeight);
      
      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      const image = await pdfDoc.embedPng(imageBytes);
      
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      const maxHeight = pageHeight - (margin * 2);
      
      const scale = Math.min(
        maxWidth / image.width,
        maxHeight / image.height
      );
      
      const scaledWidth = image.width * scale;
      const scaledHeight = image.height * scale;
      
      const x = (pageWidth - scaledWidth) / 2;
      const y = (pageHeight - scaledHeight) / 2;
      
      page.drawImage(image, {
        x,
        y,
        width: scaledWidth,
        height: scaledHeight,
      });
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.download = `timetable-${data.session.toLowerCase()}-${data.date}.pdf`;
      link.href = url;
      link.click();

      toast({
        title: 'PDF downloaded successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error downloading PDF',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsDownloading(null);
    }
  };

  const downloadAsExcel = () => {
    setIsDownloading('excel');
    try {
      const worksheet = utils.json_to_sheet(data.rows);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, 'Timetable');
      
      // Create and download the file
      const excelBuffer = write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });
      
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.download = `timetable-${data.session.toLowerCase()}-${data.date}.xlsx`;
      link.href = url;
      link.click();

      toast({
        title: 'Excel file downloaded successfully',
        description: 'You can edit this file and re-upload it to the app',
        status: 'success',
        duration: 4000,
      });
    } catch (error) {
      toast({
        title: 'Error downloading Excel file',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsDownloading(null);
    }
  };

  return (
    <VStack spacing={4}>
      <HStack spacing={4}>
        <Button 
          colorScheme="blue" 
          onClick={downloadAsPNG}
          isLoading={isDownloading === 'png'}
          loadingText="Downloading"
        >
          Download PNG
        </Button>
        <Button 
          colorScheme="purple" 
          onClick={downloadAsJPG}
          isLoading={isDownloading === 'jpg'}
          loadingText="Downloading"
        >
          Download JPG
        </Button>
        <Button 
          colorScheme="green" 
          onClick={downloadAsPDF}
          isLoading={isDownloading === 'pdf'}
          loadingText="Downloading"
        >
          Download PDF
        </Button>
        <Tooltip 
          label="You can edit this Excel file and re-upload it to create new PDFs/PNGs" 
          hasArrow 
          placement="top"
        >
          <Button 
            colorScheme="teal" 
            onClick={downloadAsExcel}
            isLoading={isDownloading === 'excel'}
            loadingText="Downloading"
          >
            Download Excel
          </Button>
        </Tooltip>
      </HStack>
      <Text fontSize="sm" color="gray.600">
        Pro tip: Download Excel, make changes, then re-upload to create a new PDF or PNG
      </Text>
    </VStack>
  );
}; 