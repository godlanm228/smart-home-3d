import type { ReactNode } from 'react'

const floorColors = ['#293242', '#303b4d', '#364358', '#3b4a61', '#43516a']

function WarmWindow({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[1.1, 0.55, 0.05]} />
      <meshStandardMaterial color="#ffd28a" emissive="#f3b43f" emissiveIntensity={1.6} />
    </mesh>
  )
}

function FloorBlock({ children, color, y }: { children?: ReactNode; color: string; y: number }) {
  return (
    <group position={[0, y, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[9.6, 1.45, 7.2]} />
        <meshStandardMaterial color={color} roughness={0.82} metalness={0.04} />
      </mesh>
      <mesh position={[0, 0.78, 0]} receiveShadow>
        <boxGeometry args={[10.2, 0.12, 7.8]} />
        <meshStandardMaterial color="#0f1d2e" roughness={0.7} />
      </mesh>
      {children}
    </group>
  )
}

export function PlaceholderHouse() {
  return (
    <group position={[0, 0.72, 0]}>
      <mesh receiveShadow position={[0, -0.48, 0]}>
        <boxGeometry args={[22, 0.24, 17]} />
        <meshStandardMaterial color="#142030" roughness={0.92} />
      </mesh>

      {floorColors.map((color, index) => (
        <FloorBlock color={color} key={color} y={index * 1.5}>
          <WarmWindow position={[-3.1, 0.12, 3.63]} />
          <WarmWindow position={[0, 0.12, 3.63]} />
          <WarmWindow position={[3.1, 0.12, 3.63]} />
        </FloorBlock>
      ))}

      <mesh castShadow position={[0, 8.08, -0.15]} rotation={[0, 0.785, 0]}>
        <coneGeometry args={[6.7, 1.85, 4]} />
        <meshStandardMaterial color="#0b1523" roughness={0.64} metalness={0.08} />
      </mesh>

      <group position={[8.3, 1.1, -0.7]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[5.6, 2.1, 5.8]} />
          <meshStandardMaterial color="#2d394a" roughness={0.82} />
        </mesh>
        <mesh position={[0, 1.16, 0]} receiveShadow>
          <boxGeometry args={[6, 0.18, 6.2]} />
          <meshStandardMaterial color="#101927" roughness={0.74} />
        </mesh>
        <mesh position={[0, -0.05, 2.94]}>
          <boxGeometry args={[3.8, 1.2, 0.08]} />
          <meshStandardMaterial color="#1a2738" roughness={0.7} metalness={0.12} />
        </mesh>
      </group>

      <mesh position={[1.4, 8.4, -2.4]}>
        <boxGeometry args={[2.4, 0.08, 1.2]} />
        <meshStandardMaterial color="#182d43" emissive="#f3b43f" emissiveIntensity={0.2} />
      </mesh>
    </group>
  )
}
