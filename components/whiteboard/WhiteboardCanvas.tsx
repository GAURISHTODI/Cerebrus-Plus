import { Canvas, Path, SkPath } from '@shopify/react-native-skia';
import React from 'react';
import { GestureResponderEvent, StyleSheet, View } from 'react-native';

interface WhiteboardCanvasProps {
    paths: any[];
    currentPath: SkPath;
    // Add these props
    currentColor: string;
    currentThickness: number;
    onTouchStart: (event: GestureResponderEvent) => void;
    onTouchMove: (event: GestureResponderEvent) => void;
    onTouchEnd: () => void;
}

export const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
    paths,
    currentPath,
    // Destructure new props
    currentColor,
    currentThickness,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
}) => {
    return (
        <View
            style={styles.canvasContainer}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            <Canvas style={{ flex: 1 }}>
                
                {paths.map((p, index) => (
                    <Path 
                    
                    key={`path_${index}`}
                        path={p.path}
                        color={p.color}
                        strokeWidth={p.thickness}
                        style="stroke"
                        strokeCap="round"
                        strokeJoin="round"
                        
                        />
                ))}
                
                <Path
                    path={currentPath}
                    // --- FIX: Use the currently selected color and thickness ---
                    color={currentColor}
                    strokeWidth={currentThickness}
                    style="stroke"
                    strokeCap="round"
                    strokeJoin="round"
                />
            </Canvas>
        </View>
    );
};


const styles = StyleSheet.create({
    canvasContainer: {
        flex: 1,
        backgroundColor: '#111317',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#333',
    },
});