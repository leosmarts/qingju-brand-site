import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useLive } from '../data/live'

const BODY = '#F5D79A'
const BELLY = '#FBEDC6'
const MUZZLE = '#FFF9EA'
const INK = '#3A2A1C'

type Props = {
  position?: [number, number, number]
  rotation?: [number, number, number]
}

/** 卡通小怪兽「嘟嘟」：全部由基础几何体拼成，靠 morph 式缩放做眨眼 / 说话口型 */
export function Mascot({ position = [0, 0, 0], rotation = [0, 0, 0] }: Props) {
  const speaking = useLive((s) => s.speaking)

  const body = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const eyes = useRef<THREE.Group>(null)
  const mouth = useRef<THREE.Mesh>(null)
  const armL = useRef<THREE.Group>(null)
  const armR = useRef<THREE.Group>(null)
  const blinkAt = useRef(2.4)
  const blinkUntil = useRef(0)
  const waveUntil = useRef(0)

  useFrame((state) => {
    const t = state.clock.elapsedTime

    if (body.current) {
      body.current.position.y = Math.sin(t * 1.6) * 0.018
      body.current.scale.setScalar(1 + Math.sin(t * 1.6) * 0.006)
    }

    if (head.current) {
      head.current.rotation.z = Math.sin(t * 0.9) * 0.025
      head.current.rotation.y = Math.sin(t * 0.55) * 0.08
    }

    // 眨眼
    if (t > blinkAt.current) {
      blinkUntil.current = t + 0.13
      blinkAt.current = t + 2.2 + Math.random() * 3.2
    }
    const closed = t < blinkUntil.current
    if (eyes.current) eyes.current.scale.y = closed ? 0.12 : 1

    // 口型
    if (mouth.current) {
      const open = speaking ? 0.45 + Math.abs(Math.sin(t * 11)) * 0.75 : 0.22 + Math.sin(t * 2) * 0.05
      mouth.current.scale.set(1.5, 0.55 * open, 0.5)
    }

    // 随机挥手
    if (Math.random() < 0.004) waveUntil.current = t + 1.6
    if (armR.current) {
      const waving = t < waveUntil.current
      armR.current.rotation.z = waving ? -1.15 + Math.sin(t * 12) * 0.22 : -0.12
    }
    if (armL.current) armL.current.rotation.z = 0.12 + Math.sin(t * 1.4) * 0.04
  })

  return (
    <group position={position} rotation={rotation}>
      <group ref={body}>
        {/* 身体 */}
        <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.6, 48, 48]} />
          <meshStandardMaterial color={BODY} roughness={0.88} />
        </mesh>
        {/* 肚子 */}
        <mesh position={[0, 0.62, 0.44]} scale={[0.72, 0.62, 0.4]}>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshStandardMaterial color={BELLY} roughness={0.92} />
        </mesh>

        <group ref={head} position={[0, 1.02, 0]}>
          {/* 口鼻 */}
          <mesh position={[0, -0.06, 0.4]} scale={[1.05, 0.78, 0.62]} castShadow>
            <sphereGeometry args={[0.42, 40, 40]} />
            <meshStandardMaterial color={MUZZLE} roughness={0.9} />
          </mesh>

          {/* 眼睛 */}
          <group ref={eyes}>
            <mesh position={[-0.25, 0.14, 0.585]}>
              <sphereGeometry args={[0.084, 24, 24]} />
              <meshStandardMaterial color={INK} roughness={0.4} />
            </mesh>
            <mesh position={[0.25, 0.14, 0.585]}>
              <sphereGeometry args={[0.084, 24, 24]} />
              <meshStandardMaterial color={INK} roughness={0.4} />
            </mesh>
            <mesh position={[-0.222, 0.175, 0.645]}>
              <sphereGeometry args={[0.025, 16, 16]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
            </mesh>
            <mesh position={[0.278, 0.175, 0.645]}>
              <sphereGeometry args={[0.025, 16, 16]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
            </mesh>
          </group>

          {/* 腮红 */}
          <mesh position={[-0.43, -0.04, 0.45]} scale={[1, 0.72, 0.28]}>
            <sphereGeometry args={[0.12, 20, 20]} />
            <meshStandardMaterial color="#F2A46B" roughness={0.9} />
          </mesh>
          <mesh position={[0.43, -0.04, 0.45]} scale={[1, 0.72, 0.28]}>
            <sphereGeometry args={[0.12, 20, 20]} />
            <meshStandardMaterial color="#F2A46B" roughness={0.9} />
          </mesh>

          {/* 嘴 */}
          <mesh ref={mouth} position={[0, -0.06, 0.67]} scale={[1.5, 0.55, 0.5]}>
            <sphereGeometry args={[0.1, 20, 20]} />
            <meshStandardMaterial color="#8C4A3C" roughness={0.6} />
          </mesh>

          {/* 头顶小橘子 */}
          <group position={[0, 0.46, 0.02]}>
            <mesh castShadow>
              <sphereGeometry args={[0.145, 28, 28]} />
              <meshStandardMaterial color="#E98B3F" roughness={0.65} />
            </mesh>
            <mesh position={[0, 0.14, 0]} rotation={[0.4, 0, 0.3]} scale={[0.9, 0.35, 1.4]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial color="#7BA05B" roughness={0.8} />
            </mesh>
            <mesh position={[0.09, 0.13, 0.03]} rotation={[-0.3, 0.5, -0.4]} scale={[0.8, 0.3, 1.1]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial color="#8CB36A" roughness={0.8} />
            </mesh>
          </group>
        </group>

        {/* 手臂 */}
        <group ref={armL} position={[-0.5, 0.66, 0.14]} rotation={[0, 0, 0.12]}>
          <mesh position={[-0.14, -0.26, 0.03]} rotation={[0.15, 0, 0.3]} castShadow>
            <capsuleGeometry args={[0.13, 0.3, 8, 20]} />
            <meshStandardMaterial color={BODY} roughness={0.88} />
          </mesh>
        </group>
        <group ref={armR} position={[0.5, 0.66, 0.14]} rotation={[0, 0, -0.12]}>
          <mesh position={[0.14, -0.26, 0.03]} rotation={[0.15, 0, -0.3]} castShadow>
            <capsuleGeometry args={[0.13, 0.3, 8, 20]} />
            <meshStandardMaterial color={BODY} roughness={0.88} />
          </mesh>
        </group>

        {/* 坐垫下方的软阴影 */}
        <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.62, 40]} />
          <meshBasicMaterial color="#7A5333" transparent opacity={0.22} />
        </mesh>
      </group>
    </group>
  )
}
