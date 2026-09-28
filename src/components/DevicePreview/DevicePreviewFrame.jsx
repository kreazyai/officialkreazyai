import React, { useRef, useState, useEffect } from 'react';

export function DevicePreviewFrame({
  device,
  orientation,
  scale,
  customDimensions,
  showFrameBezel = true,
  currentRoute = 'home'
}) {
  const containerRef = useRef(null);
  const [computedFitScale, setComputedFitScale] = useState(1);
  const [iframeKey, setIframeKey] = useState(1);

  // Compute effective width and height based on orientation and custom overrides
  let effectiveWidth = device?.width || 393;
  let effectiveHeight = device?.height || 852;

  if (customDimensions) {
    effectiveWidth = customDimensions.width;
    effectiveHeight = customDimensions.height;
  } else if (orientation === 'landscape' && device?.category !== 'desktop') {
    effectiveWidth = device?.height || 852;
    effectiveHeight = device?.width || 393;
  }

  // Calculate "Fit to Screen" scale dynamically based on preview container size
  useEffect(() => {
    const calculateFit = () => {
      if (!containerRef.current) return;
      const stage = containerRef.current.parentElement;
      if (!stage) return;

      const availWidth = stage.clientWidth - 48;
      const availHeight = stage.clientHeight - 130;

      const scaleX = availWidth / (effectiveWidth + (showFrameBezel && device?.category === 'mobile' ? 32 : 0));
      const scaleY = availHeight / (effectiveHeight + (showFrameBezel && device?.category === 'mobile' ? 32 : 0));

      const fit = Math.min(1, Math.min(scaleX, scaleY));
      setComputedFitScale(Math.max(0.25, Number(fit.toFixed(2))));
    };

    calculateFit();
    window.addEventListener('resize', calculateFit);
    return () => window.removeEventListener('resize', calculateFit);
  }, [effectiveWidth, effectiveHeight, showFrameBezel, device]);

  // Determine active scale multiplier
  const activeScale = scale === 'fit' 
    ? computedFitScale 
    : parseFloat(scale) || 1;

  // Build target URL for preview iframe
  const previewUrl = `${window.location.origin}/?embedded=true&preview_route=${currentRoute}`;

  const isApple = device?.manufacturer === 'Apple';
  const isAndroid = device?.manufacturer === 'Google' || device?.manufacturer === 'Samsung';
  const isPhone = device?.category === 'mobile';
  const isMinimalFrame = !showFrameBezel || device?.category === 'desktop' || device?.category === 'smart-displays';

  return (
    <div className="preview-stage-container" ref={containerRef}>
      {/* Top Viewport Telemetry Info Bar */}
      <div className="viewport-info-bar">
        <div className="viewport-info-tag">
          <span className="status-dot active"></span>
          <span>{device?.name || 'Custom Viewport'}</span>
        </div>
        <span>•</span>
        <div className="viewport-info-tag">
          <span>Dimensions:</span>
          <span className="viewport-dimensions-readout">
            {effectiveWidth} × {effectiveHeight} px
          </span>
        </div>
        <span>•</span>
        <div className="viewport-info-tag">
          <span>Scale:</span>
          <span style={{ fontWeight: 700, color: 'var(--olive-800)' }}>
            {Math.round(activeScale * 100)}%
          </span>
        </div>
        <span>•</span>
        <div className="viewport-info-tag">
          <span>DPR:</span>
          <span>@{device?.pixelRatio || 1}x</span>
        </div>
      </div>

      {/* Scalable Container */}
      <div 
        className="device-frame-scalable-wrap"
        style={{
          transform: `scale(${activeScale})`,
          width: effectiveWidth + (isPhone && showFrameBezel ? 24 : 0),
          height: effectiveHeight + (isPhone && showFrameBezel ? 24 : 0)
        }}
      >
        <div 
          className={`device-hardware-frame ${isMinimalFrame ? 'frame-minimal' : ''}`}
          style={{
            width: isMinimalFrame ? effectiveWidth : effectiveWidth + 24,
            height: isMinimalFrame ? effectiveHeight : effectiveHeight + 24
          }}
        >
          {/* Dynamic Island / iPhone Notch Simulation */}
          {showFrameBezel && isPhone && isApple && orientation === 'portrait' && (
            <div className="device-top-notch-bar">
              <div className="notch-sensor-dot"></div>
              <div className="notch-camera-lens"></div>
            </div>
          )}

          {/* Android Pinhole Camera Simulation */}
          {showFrameBezel && isPhone && isAndroid && orientation === 'portrait' && (
            <div 
              style={{
                position: 'absolute',
                top: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#0c120e',
                border: '1px solid rgba(255,255,255,0.2)',
                zIndex: 10
              }}
            />
          )}

          {/* Device Screen Glass Container */}
          <div 
            className="device-screen-canvas"
            style={{
              width: effectiveWidth,
              height: effectiveHeight
            }}
          >
            <iframe
              key={iframeKey}
              src={previewUrl}
              title={`Preview of Kreazy AI on ${device?.name || 'custom device'}`}
              className="preview-iframe-element"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>

          {/* iOS Home Bar Indicator */}
          {showFrameBezel && isPhone && isApple && (
            <div className="device-bottom-home-bar" />
          )}
        </div>
      </div>
    </div>
  );
}
