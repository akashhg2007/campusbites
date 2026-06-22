import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, Environment } from '@react-three/drei';
import * as THREE from 'three';

const FoodCard3D = ({ imageUrl, isVeg, onClick }) => {
    const meshRef = useRef();
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
            meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
            meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
        }
    });

    return (
        <group
            ref={meshRef}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onClick={onClick}
            scale={hovered ? 1.08 : 1}
        >
            <RoundedBox args={[2.4, 2.8, 0.15]} radius={0.15} smoothness={4}>
                <meshStandardMaterial
                    color={isVeg ? '#1a3a1a' : '#3a1a1a'}
                    metalness={0.1}
                    roughness={0.8}
                />
            </RoundedBox>
            <RoundedBox args={[2.2, 1.6, 0.05]} radius={0.12} position={[0, 0.4, 0.1]}>
                <meshStandardMaterial color="#222" metalness={0.3} roughness={0.5} />
            </RoundedBox>
            <pointLight position={[0, 0, 2]} intensity={hovered ? 1.5 : 0.8} color={isVeg ? '#22C55E' : '#E23744'} />
        </group>
    );
};

const Scene = ({ imageUrl, isVeg, onClick }) => (
    <Canvas camera={{ position: [0, 0, 4], fov: 50 }} style={{ width: '100%', height: '100%' }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <Suspense fallback={null}>
            <FoodCard3D imageUrl={imageUrl} isVeg={isVeg} onClick={onClick} />
        </Suspense>
    </Canvas>
);

const FoodCard3DPreview = ({ product, onAddToCart, style = {} }) => (
    <div style={{
        width: '100%',
        height: '200px',
        borderRadius: '24px',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        ...style
    }}>
        <Scene
            imageUrl={product.image}
            isVeg={product.isVeg !== false}
            onClick={onAddToCart}
        />
        <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            right: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pointerEvents: 'none'
        }}>
            <span style={{ fontWeight: 800, fontSize: '1rem', color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>{product.name}</span>
            <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#E23744', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>₹{product.price}</span>
        </div>
    </div>
);

export default FoodCard3DPreview;
