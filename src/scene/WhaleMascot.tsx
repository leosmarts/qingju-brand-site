import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useLive } from '../data/live'

const BLUE = '#4C7FC4'
const BLUE_DARK = '#3A679F'
const BELLY = '#E3F0FA'
const INK = '#16263D'
const PINK = '#F2A6A6'

/** 鲸鱼娘「溟」：纯几何体拼的卡通形象，漂浮在客厅中央，呼吸 / 摆尾 / 眨眼 / 说话全部实时驱动 */
export function WhaleMascot({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const speaking = useLive((s) => s.speaking)

  const root = useRef<THREE.Group>(null)
  const tail = useRef<THREE.Group>(null)
  const eyeL = useRef<THREE.Group>(null)
  const eyeR = useRef<THREE.Group>(null)
  const mouth = useRef<THREE.Mesh>(null)
  const fins = useRef<THREE.Group>(null)

  const blinkAt = useRef(2)
  const blinkUntil = useRef(0)

  const bubbles = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        x: (Math.sin(i * 2.1) * 0.5 - 0.15) * 0.7,
        z: (Math.cos(i * 1.7) * 0.5 - 0.1) * 0.4,
        offset: i * 0.9,
        scale: 0.022 + Math.random() * 0.028,
      })),
    [],
  )

  useFrame((state) => {
    const t = state.clock.elapsedTime

    if (root.current) {
      root.current.position.y = position[1] + Math.sin(t * 0.9) * 0.055
      root.current.rotation.z = Math.sin(t * 0.6) * 0.035
      root.current.rotation.y = Math.sin(t * 0.35) * 0.08
      // 说话时整只鲸上下轻微挤压，代替没有骨骼的呼吸感
      const squash = speaking ? 1 + Math.sin(t * 9) * 0.018 : 1
      root.current.scale.set(0.85, 0.85 * squash, 0.85)
    }

    if (tail.current) tail.current.rotation.y = Math.sin(t * 1.5) * 0.28
    if (fins.current) fins.current.rotation.x = Math.sin(t * 1.3) * 0.12

    if (t > blinkAt.current) {
      blinkUntil.current = t + 0.1
      blinkAt.current = t + 2 + Math.random() * 3
    }
    const closed = t < blinkUntil.current
    ;[eyeL, eyeR].forEach((e) => {
      if (e.current) e.current.scale.y = closed ? 0.08 : 1
    })

    if (mouth.current) {
      const target = speaking ? 0.055 : 0.028
      mouth.current.scale.set(
        speaking ? 0.09 + Math.sin(t * 10) * 0.02 : 0.085,
        THREE.MathUtils.lerp(mouth.current.scale.y, target, 0.3),
        0.02,
      )
      mouth.current.position.y = -0.15 - (mouth.current.scale.y - 0.028) * 0.6
    }
  })

  return (
    <group ref={root} position={position} scale={0.85}>
      {/* 身体 */}
      <mesh castShadow scale={[0.62, 0.52, 0.55]}>
        <sphereGeometry args={[1, 64, 48]} />
        <meshStandardMaterial color={BLUE} roughness={0.52} metalness={0} />
      </mesh>

      {/* 白色肚皮 */}
      <mesh position={[0, -0.08, 0.03]} scale={[0.52, 0.44, 0.52]}>
        <sphereGeometry args={[1, 48, 32]} />
        <meshStandardMaterial color={BELLY} roughness={0.6} />
      </mesh>

      {/* 眼睛 */}
      {([-0.19, 0.19] as const).map((x, i) => (
        <group key={x} ref={i === 0 ? eyeL : eyeR} position={[x, 0.1, 0.5]}>
          <mesh scale={[0.125, 0.15, 0.055]}>
            <sphereGeometry args={[1, 32, 24]} />
            <meshStandardMaterial color="#FBFCFF" roughness={0.25} />
          </mesh>
          <mesh position={[0, 0, 0.05]} scale={[0.078, 0.09, 0.045]}>
            <sphereGeometry args={[1, 32, 24]} />
            <meshStandardMaterial color={INK} roughness={0.15} />
          </mesh>
          <mesh position={[0.026, 0.034, 0.08]} scale={0.03}>
            <sphereGeometry args={[1, 16, 12]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        </group>
      ))}

      {/* 腮红 */}
      {([-0.36, 0.36] as const).map((x) => (
        <mesh key={x} position={[x, -0.06, 0.4]} scale={[0.085, 0.05, 0.02]}>
          <sphereGeometry args={[1, 24, 16]} />
          <meshStandardMaterial color={PINK} roughness={0.8} transparent opacity={0.75} />
        </mesh>
      ))}

      {/* 嘴 */}
      <mesh ref={mouth} position={[0, -0.15, 0.53]} scale={[0.085, 0.028, 0.02]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color={INK} roughness={0.3} />
      </mesh>

      {/* 胸鳍 */}
      <group ref={fins}>
        {([-1, 1] as const).map((s) => (
          <mesh
            key={s}
            position={[s * 0.52, -0.12, 0.08]}
            rotation={[0.2, 0, s * 0.55]}
            scale={[0.22, 0.07, 0.34]}
          >
            <sphereGeometry args={[1, 32, 24]} />
            <meshStandardMaterial color={BLUE_DARK} roughness={0.55} />
          </mesh>
        ))}
      </group>

      {/* 尾巴 */}
      <group ref={tail} position={[0, -0.18, -0.5]}>
        <mesh scale={[0.16, 0.1, 0.3]}>
          <sphereGeometry args={[1, 24, 16]} />
          <meshStandardMaterial color={BLUE_DARK} roughness={0.55} />
        </mesh>
        {([-1, 1] as const).map((s) => (
          <mesh
            key={s}
            position={[s * 0.26, 0.02, -0.2]}
            rotation={[0, s * 0.5, s * 0.35]}
            scale={[0.26, 0.04, 0.16]}
          >
            <sphereGeometry args={[1, 24, 16]} />
            <meshStandardMaterial color={BLUE_DARK} roughness={0.55} />
          </mesh>
        ))}
      </group>

      {/* 头顶的小喷气孔 */}
      <mesh position={[0, 0.5, 0.02]} scale={[0.1, 0.05, 0.1]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color={BLUE_DARK} roughness={0.5} />
      </mesh>

      {/* 吐泡泡 */}
      {bubbles.map((b, i) => (
        <Bubble key={i} {...b} />
      ))}
    </group>
  )
}

function Bubble({ x, z, offset, scale }: { x: number; z: number; offset: number; scale: number }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (!ref.current) return
    const t = (state.clock.elapsedTime + offset) % 4
    const p = t / 4
    ref.current.position.set(x + Math.sin(t * 2 + offset) * 0.05, 0.85 + p * 0.75, z)
    ref.current.scale.setScalar(scale * (0.6 + p * 0.8))
    ;(ref.current.material as THREE.MeshBasicMaterial).opacity = 0.35 * (1 - p)
  })
  return (
    <mesh ref={ref} scale={scale}>
      <sphereGeometry args={[1, 16, 12]} />
      <meshBasicMaterial color="#FFFFFF" transparent opacity={0.35} />
    </mesh>
  )
}
