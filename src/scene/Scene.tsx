import { Suspense, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { Asset } from './Asset'
import { Fox } from './Fox'
import { WhaleMascot } from './WhaleMascot'

const WOOD = '#C89768'
const WALL = '#EFE0CC'
const GREEN = '#7C9B6A'
const ORANGE = '#E08A46'

function Slab({
  size,
  position,
  color,
  radius = 0.06,
  rotation,
  roughness = 0.9,
}: {
  size: [number, number, number]
  position: [number, number, number]
  color: string
  radius?: number
  rotation?: [number, number, number]
  roughness?: number
}) {
  return (
    <RoundedBox
      args={size}
      radius={Math.min(radius, Math.min(...size) / 2.02)}
      smoothness={4}
      position={position}
      rotation={rotation}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color={color} roughness={roughness} />
    </RoundedBox>
  )
}

function Picture({ x, y, tone }: { x: number; y: number; tone: string }) {
  return (
    <group position={[x, y, -4.42]}>
      <mesh castShadow>
        <boxGeometry args={[0.86, 1.12, 0.06]} />
        <meshStandardMaterial color="#7A5638" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0, 0.04]}>
        <boxGeometry args={[0.74, 1.0, 0.02]} />
        <meshStandardMaterial color="#FBF3E4" roughness={1} />
      </mesh>
      <mesh position={[0, -0.12, 0.055]}>
        <circleGeometry args={[0.19, 24]} />
        <meshStandardMaterial color={tone} roughness={1} />
      </mesh>
      <mesh position={[0, -0.32, 0.055]}>
        <boxGeometry args={[0.42, 0.16, 0.01]} />
        <meshStandardMaterial color="#C9B394" roughness={1} />
      </mesh>
    </group>
  )
}

function Shelf() {
  return (
    <group position={[-4.95, 0, -0.6]} rotation={[0, Math.PI / 2, 0]}>
      <Slab size={[2.6, 0.08, 0.42]} position={[0, 2.0, 0]} color="#B98A5E" />
      <Slab size={[2.6, 0.08, 0.42]} position={[0, 1.42, 0]} color="#B98A5E" />
      <Slab size={[2.6, 0.08, 0.42]} position={[0, 0.82, 0]} color="#B98A5E" />
      {/* 书 */}
      <Slab size={[0.16, 0.42, 0.26]} position={[-0.85, 2.24, 0]} color="#8E6B4A" radius={0.02} />
      <Slab size={[0.14, 0.38, 0.24]} position={[-0.66, 2.2, 0.02]} color="#A6503C" radius={0.02} />
      <Slab size={[0.18, 0.34, 0.22]} position={[-0.46, 2.18, -0.01]} color="#6C7F5C" radius={0.02} />
      <Slab size={[0.16, 0.4, 0.28]} position={[-0.26, 2.22, 0.03]} color="#C9A15D" radius={0.02} rotation={[0, 0, -0.16]} />
      {/* 小盆 */}
      <Slab size={[0.24, 0.22, 0.24]} position={[0.8, 2.15, 0]} color={ORANGE} radius={0.08} />
      <mesh position={[0.8, 2.34, 0]} castShadow>
        <sphereGeometry args={[0.16, 18, 18]} />
        <meshStandardMaterial color={GREEN} roughness={0.9} />
      </mesh>
    </group>
  )
}

function SofaDecor() {
  return (
    <group>
      {/* 抱枕：花朵 + 小熊 */}
      <group position={[-1.25, 0.84, -0.85]} rotation={[0.3, -0.15, 0.18]}>
        <Slab size={[0.5, 0.5, 0.16]} position={[0, 0, 0]} color="#F2E6D3" radius={0.14} />
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh
            key={i}
            position={[Math.cos((i / 5) * Math.PI * 2) * 0.1, Math.sin((i / 5) * Math.PI * 2) * 0.1, 0.1]}
            rotation={[0, 0, (i / 5) * Math.PI * 2]}
          >
            <circleGeometry args={[0.075, 12]} />
            <meshStandardMaterial color="#D2BB98" roughness={1} />
          </mesh>
        ))}
      </group>

      <group position={[1.3, 0.86, -0.85]} rotation={[0.3, 0.18, -0.1]}>
        <Slab size={[0.52, 0.54, 0.16]} position={[0, 0, 0]} color="#E3A25F" radius={0.16} />
        <mesh position={[-0.12, 0.1, 0.09]}>
          <circleGeometry args={[0.045, 16]} />
          <meshStandardMaterial color="#5C3B24" />
        </mesh>
        <mesh position={[0.12, 0.1, 0.09]}>
          <circleGeometry args={[0.045, 16]} />
          <meshStandardMaterial color="#5C3B24" />
        </mesh>
        <mesh position={[0, -0.05, 0.09]}>
          <circleGeometry args={[0.058, 16]} />
          <meshStandardMaterial color="#D3874A" />
        </mesh>
      </group>
    </group>
  )
}

function CoffeeTable() {
  return (
    <group position={[0, 0, 1.15]}>
      <Slab size={[2.1, 0.12, 0.95]} position={[0, 0.44, 0]} color="#C99A6B" radius={0.05} />
      <Slab size={[1.96, 0.06, 0.8]} position={[0, 0.2, 0]} color="#B4855A" radius={0.03} />
      {(
        [
          [-0.78, 0.44, -0.3],
          [0.78, 0.44, -0.3],
          [-0.78, 0.44, 0.3],
          [0.78, 0.44, 0.3],
        ] as [number, number, number][]
      ).map((p, i) => (
        <Slab key={i} size={[0.1, 0.44, 0.1]} position={p} color="#B4855A" radius={0.02} />
      ))}

      {/* 抽纸盒 */}
      <Slab size={[0.42, 0.16, 0.26]} position={[-0.42, 0.57, 0.06]} color="#DCE6D6" radius={0.05} />
      <mesh position={[-0.42, 0.66, 0.06]} rotation={[0.2, 0, 0.3]}>
        <boxGeometry args={[0.12, 0.1, 0.1]} />
        <meshStandardMaterial color="#FBF7EC" roughness={1} />
      </mesh>

      {/* 马克杯 */}
      <mesh position={[0.5, 0.58, 0.12]} castShadow>
        <cylinderGeometry args={[0.11, 0.095, 0.16, 24]} />
        <meshStandardMaterial color="#F2EBDF" roughness={0.6} />
      </mesh>
      <mesh position={[0.63, 0.58, 0.12]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.06, 0.016, 12, 24, Math.PI]} />
        <meshStandardMaterial color="#F2EBDF" roughness={0.6} />
      </mesh>

      {/* 遥控器 */}
      <Slab size={[0.09, 0.035, 0.26]} position={[0.12, 0.5, 0.36]} color="#4A4038" radius={0.015} />

      {/* 小盆栽 */}
      <mesh position={[-0.85, 0.56, -0.2]} castShadow>
        <cylinderGeometry args={[0.09, 0.07, 0.16, 20]} />
        <meshStandardMaterial color="#D8C7AE" roughness={0.9} />
      </mesh>
      <mesh position={[-0.85, 0.72, -0.2]} castShadow>
        <sphereGeometry args={[0.13, 18, 18]} />
        <meshStandardMaterial color={GREEN} roughness={0.9} />
      </mesh>
    </group>
  )
}

function Rug() {
  return (
    <RoundedBox args={[5.9, 0.05, 3.9]} radius={0.02} smoothness={2} position={[0, 0.03, 1.2]} receiveShadow>
      <meshStandardMaterial color="#DCC09B" roughness={1} />
    </RoundedBox>
  )
}

function Kitchen() {
  return (
    <group position={[0, 0, -3.9]}>
      {/* 灶台 */}
      <Slab size={[2.1, 0.9, 1.0]} position={[4.3, 0.45, 0]} color="#C9A579" />
      <Slab size={[2.2, 0.08, 1.06]} position={[4.3, 0.92, 0]} color="#F5EEE2" radius={0.02} />
      <Slab size={[2.1, 0.1, 0.06]} position={[4.3, 0.5, 0.5]} color="#D9CBB4" radius={0.01} />
      {/* 吊柜 */}
      <Slab size={[2.1, 0.9, 0.62]} position={[4.3, 2.25, -0.18]} color="#EFE3D2" />
      {/* 台面杂物 */}
      <Slab size={[0.34, 0.26, 0.3]} position={[3.6, 1.09, 0.0]} color="#DCD3C4" radius={0.05} />
      <mesh position={[4.95, 1.16, 0]} castShadow>
        <sphereGeometry args={[0.16, 18, 18]} />
        <meshStandardMaterial color={ORANGE} roughness={0.8} />
      </mesh>
      <mesh position={[4.4, 1.1, 0.05]} castShadow>
        <cylinderGeometry args={[0.13, 0.13, 0.3, 20]} />
        <meshStandardMaterial color="#E6DECF" roughness={0.7} />
      </mesh>
      {/* 一块暖色玻璃窗 */}
      <mesh position={[4.3, 1.7, 0.34]}>
        <planeGeometry args={[1.3, 0.95]} />
        <meshBasicMaterial color="#FFE6BF" transparent opacity={0.55} />
      </mesh>
    </group>
  )
}

function Room() {
  return (
    <group>
      {/* 地板 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial color={WOOD} roughness={0.95} />
      </mesh>
      {/* 地板拼缝 */}
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, -4 + i * 1.2]}>
          <planeGeometry args={[24, 0.012]} />
          <meshBasicMaterial color="#B1845A" transparent opacity={0.55} />
        </mesh>
      ))}

      {/* 背墙 */}
      <Slab size={[11, 5.4, 0.28]} position={[0, 2.7, -4.6]} color={WALL} radius={0.02} />
      {/* 左侧墙 */}
      <Slab size={[0.28, 5.4, 9.6]} position={[-5.4, 2.7, -0.2]} color={WALL} radius={0.02} />
      {/* 右侧半墙 + 门洞 */}
      <Slab size={[0.28, 5.4, 3.2]} position={[5.4, 2.7, -3.1]} color={WALL} radius={0.02} />
      <Slab size={[0.28, 5.4, 4.4]} position={[5.4, 2.7, 2.6]} color={WALL} radius={0.02} />

      {/* 木门 */}
      <group position={[1.55, 0, -4.5]}>
        <Slab size={[1.25, 2.7, 0.1]} position={[0, 1.35, 0]} color="#8A5C3B" radius={0.02} />
        <mesh position={[0.44, 1.3, 0.07]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#E3C888" metalness={0.4} roughness={0.4} />
        </mesh>
      </group>

      <Picture x={-1.9} y={2.55} tone="#E1A96F" />
      <Picture x={-0.95} y={2.62} tone="#9DB37E" />
      <Picture x={0.0} y={2.55} tone="#D98C69" />

      <Shelf />
      <Kitchen />

      {/* 落地灯 */}
      <group position={[-3.1, 0, 0.4]}>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.22, 0.24, 0.05, 20]} />
          <meshStandardMaterial color="#6E5340" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.85, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 1.7, 10]} />
          <meshStandardMaterial color="#6E5340" roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.75, 0]} castShadow>
          <coneGeometry args={[0.32, 0.38, 24, 1, true]} />
          <meshStandardMaterial color="#F6E7CC" roughness={0.6} side={THREE.DoubleSide} emissive="#FFD9A0" emissiveIntensity={0.35} />
        </mesh>
        <pointLight position={[0, 1.6, 0]} intensity={1.4} color="#FFCE8A" distance={4} decay={2} />
      </group>

      {/* 垃圾桶 */}
      <mesh position={[-2.55, 0.22, 1.85]} castShadow>
        <cylinderGeometry args={[0.27, 0.23, 0.44, 24, 1, true]} />
        <meshStandardMaterial color="#CFD6C4" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-2.55, 0.46, 1.85]}>
        <torusGeometry args={[0.26, 0.026, 10, 28]} />
        <meshStandardMaterial color="#C3CBB6" roughness={0.9} />
      </mesh>
    </group>
  )
}

function CameraRig() {
  const target = useRef(new THREE.Vector3(0, 0, 0))
  useFrame(({ camera, pointer }) => {
    target.current.set(pointer.x * 0.5, 1.35 + pointer.y * 0.22, 0)
    camera.position.x += (pointer.x * 0.7 - camera.position.x) * 0.03
    camera.position.y += (2.2 - camera.position.y) * 0.03
    camera.lookAt(target.current)
  })
  return null
}

export function Scene() {
  return (
    <>
      <color attach="background" args={['#E8D8C3']} />
      <fog attach="fog" args={['#E8D8C3', 14, 30]} />

      <ambientLight intensity={0.32} color="#FFF0DA" />
      <hemisphereLight args={['#FFF6E8', '#A87850', 0.45]} />
      <directionalLight
        position={[5, 6.5, 4]}
        intensity={1.35}
        color="#FFD9A6"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
      >
        <orthographicCamera attach="shadow-camera" args={[-7, 7, 7, -7, 0.1, 30]} />
      </directionalLight>
      <directionalLight position={[-4, 3, 3]} intensity={0.5} color="#FFF3E2" />

      <Environment resolution={128}>
        <Lightformer intensity={0.7} position={[0, 4, 3]} scale={[10, 5, 1]} color="#FFF3DE" />
        <Lightformer intensity={0.35} position={[4, 2, 0]} scale={[6, 4, 1]} color="#FFE0B8" />
      </Environment>

      <CameraRig />
      <Room />
      <Rug />
      <CoffeeTable />

      <Suspense fallback={null}>
        <Asset url="/models/Sofa.glb" axis="x" fit={3.3} position={[0, 0, -0.55]} recolor={{ match: 'fabric', color: '#CDB294' }} hide={['Key Light']} />
        <Asset url="/models/Plant.glb" axis="y" fit={1.55} position={[-2.75, 0, -1.5]} hide={['firefly', 'pointlight']} />
        <Fox position={[2.1, 0.03, 1.55]} rotation={[0, 0.35, 0]} />
      </Suspense>

      <SofaDecor />
      <WhaleMascot position={[0, 0, 1.9]} />

      <ContactShadows position={[0, 0.02, 0.6]} opacity={0.35} scale={9} blur={2.6} far={3} color="#6B4526" />
    </>
  )
}
