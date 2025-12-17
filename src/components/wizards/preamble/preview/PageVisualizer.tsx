import React, { useMemo } from 'react';
import { Box } from '@mantine/core';
import { 
  PAGE_WIDTH_PX, PAGE_HEIGHT_PX, CM_TO_PX 
} from '../LanguageDb';
import { PreambleConfig } from '../generators/preambleGenerators';

interface PageVisualizerProps {
  config: PreambleConfig;
}

export const PageVisualizer: React.FC<PageVisualizerProps> = ({ config }) => {
  
  const styles = useMemo(() => {
    // If geometry is off, use defaults (approx 1 inch margins ~ 2.54cm)
    const marginTop = config.pkgGeometry ? config.marginTop : 2.54;
    const marginBottom = config.pkgGeometry ? config.marginBottom : 2.54;
    const marginLeft = config.pkgGeometry ? config.marginLeft : 2.54;
    const marginRight = config.pkgGeometry ? config.marginRight : 2.54;

    const headerHeightPx = config.pkgGeometry ? config.headHeight * CM_TO_PX : 0;
    const headerSepPx = config.pkgGeometry ? config.headSep * CM_TO_PX : 0;
    
    const vOffsetPx = config.pkgGeometry ? config.vOffset * CM_TO_PX : 0;
    const hOffsetPx = config.pkgGeometry ? config.hOffset * CM_TO_PX : 0;

    // Body Top starts after margin top + header stuff (if included in layout logic)
    // Simplified model: Top Margin pushes body down. If includehead is true, header is inside margin area.
    // Standard geometry: top margin is from edge to body top. Header sits inside that space if not includehead.
    // For visualizer, we'll keep it simple relative to edge.
    
    const bodyTopPx = (marginTop * CM_TO_PX) + vOffsetPx;
    const bodyBottomPx = PAGE_HEIGHT_PX - (marginBottom * CM_TO_PX) + vOffsetPx;
    
    // Header Position
    const headerTopPx = bodyTopPx - headerSepPx - headerHeightPx;

    const bodyLeftPx = (marginLeft * CM_TO_PX) + hOffsetPx;
    const bodyRightPx = PAGE_WIDTH_PX - (marginRight * CM_TO_PX) + hOffsetPx;
    const bodyWidthPx = bodyRightPx - bodyLeftPx;

    const marginNotesStartPx = bodyRightPx + (config.marginSep * CM_TO_PX);
    const marginNotesWidthCapPx = config.marginWidth * CM_TO_PX;

    // Footer Position (Simplified)
    const footerTopPx = bodyBottomPx + (config.footSkip * CM_TO_PX);

    return { 
        bodyTopPx, bodyBottomPx, bodyLeftPx, bodyWidthPx, 
        headerTopPx, headerHeightPx, 
        footerTopPx,
        marginNotesStartPx, marginNotesWidthCapPx 
    };
  }, [config]);

  return (
    <Box h="100%" bg="dark.9" style={{ display: 'flex', justifyContent: 'center', overflow: 'auto', padding: 20 }}>
        {/* Paper Canvas */}
        <div style={{
            width: PAGE_WIDTH_PX,
            height: PAGE_HEIGHT_PX,
            backgroundColor: 'white',
            position: 'relative',
            boxShadow: '0 0 20px rgba(0,0,0,0.5)',
            color: 'black',
            fontSize: 10,
            overflow: 'hidden',
            fontFamily: 'serif'
        }}>
            
            {/* Header Area */}
            {config.pkgGeometry && config.headHeight > 0 && (
                <div style={{
                    position: 'absolute',
                    top: styles.headerTopPx,
                    left: styles.bodyLeftPx,
                    width: styles.bodyWidthPx,
                    height: styles.headerHeightPx,
                    background: 'rgba(255, 165, 0, 0.15)',
                    borderBottom: '1px dashed orange',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'orange', fontSize: 9
                }}>
                    HEADER
                </div>
            )}

            {/* Main Body Text Area */}
            <div style={{
                position: 'absolute',
                top: styles.bodyTopPx,
                height: styles.bodyBottomPx - styles.bodyTopPx,
                left: styles.bodyLeftPx,
                width: styles.bodyWidthPx,
                border: '1px solid #339af0',
                background: 'rgba(51, 154, 240, 0.05)',
                display: 'flex',
                gap: config.columns === 'two' ? config.columnSep * CM_TO_PX : 0
            }}>
                    {config.columns === 'two' ? (
                    <>
                        <div style={{ flex: 1, borderRight: '1px dotted #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#339af0' }}>Column 1</div>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#339af0' }}>Column 2</div>
                    </>
                    ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: 10, color: '#339af0' }}>
                        <div>Body Text Area</div>
                        <div style={{fontSize: 8, color: '#999', marginTop: 5}}>{(styles.bodyWidthPx / CM_TO_PX).toFixed(1)}cm width</div>
                    </div>
                    )}
            </div>

            {/* Margin Notes */}
            {config.pkgGeometry && config.marginNotes && (
                <div style={{
                    position: 'absolute',
                    top: styles.bodyTopPx,
                    height: styles.bodyBottomPx - styles.bodyTopPx,
                    left: styles.marginNotesStartPx,
                    width: styles.marginNotesWidthCapPx,
                    background: 'rgba(40, 167, 69, 0.15)',
                    border: '1px dotted green',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    writingMode: 'vertical-rl',
                    color: 'green', fontSize: 9
                }}>
                    Margin Notes
                </div>
            )}

            {/* Footer Area */}
            {config.pkgGeometry && config.footSkip > 0 && (
                <div style={{
                    position: 'absolute',
                    top: styles.footerTopPx,
                    left: styles.bodyLeftPx,
                    width: styles.bodyWidthPx,
                    height: 20, // Arbitrary visual height for footer line
                    borderTop: '1px dashed blue',
                    display: 'flex', justifyContent: 'center', alignItems: 'start',
                    color: 'blue', fontSize: 9
                }}>
                    <span style={{ background: 'rgba(0,0,255,0.05)', padding: '2px 8px', marginTop: 2 }}>Page 1</span>
                </div>
            )}
            
            {/* Dimensions Labels (Optional Visual Aid) */}
            <div style={{ position: 'absolute', top: 5, left: 5, fontSize: 9, color: '#ccc' }}>
                {config.paperSize}
            </div>

        </div>
    </Box>
  );
};