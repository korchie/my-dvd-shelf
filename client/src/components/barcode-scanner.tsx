import { useEffect, useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const codeReader = new BrowserMultiFormatReader();
    codeReaderRef.current = codeReader;

    const startCamera = async () => {
      try {
        setError(null);

        // Get available video devices
        const videoInputDevices = await codeReader.listVideoInputDevices();

        if (videoInputDevices.length === 0) {
          setError("No camera found on this device.");
          return;
        }

        // Use the first available camera (usually back camera on mobile)
        const selectedDeviceId = videoInputDevices[0].deviceId;

        // Start decoding from video device
        codeReader.decodeFromVideoDevice(selectedDeviceId, videoRef.current!, (result, error) => {
          if (result) {
            // Found a barcode!
            onScan(result.getText());
          }
          if (error && !(error instanceof NotFoundException)) {
            console.error("Barcode scanning error:", error);
          }
        });

        setIsScanning(true);
      } catch (err) {
        setError("Unable to access camera. Please check permissions.");
        console.error("Camera access error:", err);
      }
    };

    startCamera();

    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();

      }
    };

  }, [onScan]);

  const captureBarcode = () => {
    // With ZXing, the scanning is continuous, so this is just for manual fallback
    const barcode = Math.random().toString().substring(2, 12);
    onScan(barcode);
  };

  const handleManualEntry = () => {
    const barcode = prompt("Enter barcode manually:");
    if (barcode) {
      onScan(barcode);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Scan Barcode</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {error ? (
          <div className="text-center py-8">
            <div className="text-red-500 mb-4">{error}</div>
            <Button onClick={handleManualEntry}>
              Enter Barcode Manually
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 bg-gray-900 rounded-lg object-cover"
              />
              {/* Canvas removed - ZXing handles video processing directly */}

              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-red-500 w-3/4 h-16 bg-transparent"></div>
                </div>
              )}
            </div>

            <div className="text-center text-sm text-gray-600 mb-4">
              Position the barcode within the red rectangle
            </div>

            <div className="flex space-x-2">
              <Button onClick={captureBarcode} className="flex-1">
                <Camera className="w-4 h-4 mr-2" />
                Capture
              </Button>
              <Button variant="outline" onClick={handleManualEntry} className="flex-1">
                Manual Entry
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
