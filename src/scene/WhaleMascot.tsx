import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useLive } from '../data/live'

const SKIN = '#FBE6D6'
const HAIR = '#3C63AE'
const HAIR_LIGHT = '#5C86CE'
const SUIT = '#1D2A46'
const TRIM = '#F3F7FF'
const FIN = '#4E8AD8'
const EYE = '#2A4F94'
const INK = '#101B2E'

const HEAD = { y: 1.16, r: 0.3 }

/** 鲸鱼娘「溟」：Q 版拟人形象，蓝色长卷发、鳍状耳、深蓝潜水服、鲸尾，全部用几何体拼装 */
export function WhaleMascot({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const speaking = useLive((s) => s.speaking)

  const root = useRef<THREE.Group>(null)
  const tail = useRef<THREE.Group>(null)
  const hair = useRef<THREE.Group>(null)
  const eyeL = useRef<THREE.Group>(null)
  const eyeR = useRef<THREE.Group>(null)
  const mouth = useRef<THREE.Mesh>(null)
  const armL = useRef<THREE.Group>(null)
  const armR = useRef<THREE.Group>(null)

  const blinkAt = useRef(2)
  const blinkUntil = useRef(0)

  const strands = useMemo(() => {
    const out: THREE.CatmullRomCurve3[] = []
    const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)
    for (const side of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const x0 = side * (0.16 + i * 0.05)
        const x1 = side * (0.3 + i * 0.04)
        const x2 = side * (0.27 + i * 0.06)
        out.push(
          new THREE.CatmullRomCurve3([
            v(x0, 1.32 - i * 0.02, -0.06 - i * 0.02),
            v(x1, 1.05, -0.14),
            v(x2, 0.72 - i * 0.06, -0.02 + i * 0.05),
            v(x2 + side * 0.05, 0.55 - i * 0.05, 0.06 + i * 0.04),
          ]),
        )
      }
      for (let i = 0; i < 2; i++) {
        const x0 = side * (0.06 + i * 0.1)
        const x1 = side * (0.14 + i * 0.12)
        const x2 = side * (0.12 + i * 0.14)
        out.push(
          new THREE.CatmullRomCurve3([
            v(x0, 1.36, -0.12),
            v(x1, 1.0, -0.26),
            v(x2, 0.66, -0.2),
            v(x2 + side * 0.06, 0.5, -0.12 + i * 0.05),
          ]),
        )
      }
    }
    return out
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime

    if (root.current) {
      root.current.position.y = position[1] + Math.sin(t * 1.1) * 0.018
      root.current.rotation.z = Math.sin(t * 0.7) * 0.012
    }
    if (hair.current) hair.current.rotation.z = Math.sin(t * 1.3) * 0.018
    if (tail.current) tail.current.rotation.y = Math.sin(t * 1.4) * 0.22
    if (armL.current) armL.current.rotation.z = 0.12 + Math.sin(t * 1.2) * 0.03
    if (armR.current) armR.current.rotation.z = -0.12 - Math.sin(t * 1.2 + 0.6) * 0.03

    if (t > blinkAt.current) {
      blinkUntil.current = t + 0.1
      blinkAt.current = t + 2.2 + Math.random() * 2.8
    }
    const closed = t < blinkUntil.current
    ;[eyeL, eyeR].forEach((e) => {
      if (e.current) e.current.scale.y = closed ? 0.1 : 1
    })

    if (mouth.current) {
      const baseY = 0.014
      mouth.current.scale.y = THREE.MathUtils.lerp(
        mouth.current.scale.y,
        speaking ? baseY * (1 + Math.abs(Math.sin(t * 9)) * 1.4) : baseY,
        0.4,
      )
      mouth.current.scale.x = THREE.MathUtils.lerp(mouth.current.scale.x, speaking ? 0.048 : 0.032, 0.4)
    }
  })

  return (
    <group ref={root} position={position} scale={0.92}>
      {/* 腿 */}
      {([-0.09, 0.09] as const).map((x) => (
        <mesh key={x} position={[x, 0.22, 0]}>
          <capsuleGeometry args={[0.055, 0.3, 8, 16]} />
          <meshStandardMaterial color={SKIN} roughness={0.75} />
        </mesh>
      ))}
      {/* 鞋 */}
      {([-0.09, 0.09] as const).map((x) => (
        <mesh key={x} position={[x, 0.035, 0.03]} scale={[0.065, 0.04, 0.1]}>
          <sphereGeometry args={[1, 24, 16]} />
          <meshStandardMaterial color={SUIT} roughness={0.4} />
        </mesh>
      ))}

      {/* 躯干：深蓝潜水服 */}
      <mesh position={[0, 0.72, 0]}>
        <capsuleGeometry args={[0.16, 0.24, 12, 24]} />
        <meshStandardMaterial color={SUIT} roughness={0.45} />
      </mesh>
      {/* 白色滚边 + 中缝 */}
      <mesh position={[0, 0.72, 0.152]} scale={[0.012, 0.26, 0.006]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={TRIM} roughness={0.3} />
      </mesh>

      {/* 手臂 */}
      <group ref={armL} position={[0.17, 0.88, 0]} rotation={[0, 0, 0.12]}>
        <mesh position={[0, -0.16, 0]}>
          <capsuleGeometry args={[0.045, 0.24, 8, 16]} />
          <meshStandardMaterial color={SKIN} roughness={0.75} />
        </mesh>
      </group>
      <group ref={armR} position={[-0.17, 0.88, 0]} rotation={[0, 0, -0.12]}>
        <mesh position={[0, -0.16, 0]}>
          <capsuleGeometry args={[0.045, 0.24, 8, 16]} />
          <meshStandardMaterial color={SKIN} roughness={0.75} />
        </mesh>
      </group>

      {/* 鲸尾 */}
      <group ref={tail} position={[0, 0.6, -0.12]}>
        <mesh position={[0, -0.04, -0.08]} scale={[0.09, 0.06, 0.14]}>
          <sphereGeometry args={[1, 24, 16]} />
          <meshStandardMaterial color={HAIR} roughness={0.5} />
        </mesh>
        {([-1, 1] as const).map((s) => (
          <mesh
            key={s}
            position={[s * 0.15, -0.05, -0.16]}
            rotation={[0, s * 0.6, s * 0.3]}
            scale={[0.18, 0.03, 0.12]}
          >
            <sphereGeometry args={[1, 24, 16]} />
            <meshStandardMaterial color={FIN} roughness={0.45} />
          </mesh>
        ))}
      </group>

      {/* 头 */}
      <mesh position={[0, HEAD.y, 0]}>
        <sphereGeometry args={[HEAD.r, 48, 36]} />
        <meshStandardMaterial color={SKIN} roughness={0.72} />
      </mesh>

      {/* 后脑长发 */}
      <mesh position={[0, HEAD.y + 0.02, -0.1]} scale={[0.33, 0.34, 0.3]}>
        <sphereGeometry args={[1, 40, 28]} />
        <meshStandardMaterial color={HAIR} roughness={0.55} />
      </mesh>
      {/* 头顶发帽 */}
      <mesh position={[0, HEAD.y + 0.05, -0.02]} scale={[0.31, 0.29, 0.31]}>
        <sphereGeometry args={[1, 40, 28]} />
        <meshStandardMaterial color={HAIR} roughness={0.55} />
      </mesh>

      {/* 刘海 */}
      {([-0.19, -0.06, 0.06, 0.19] as const).map((x, i) => (
        <mesh
          key={x}
          position={[x, 1.3 - i * 0.004, 0.282]}
          rotation={[0.5, 0, x * 0.3]}
          scale={[0.075, 0.15, 0.048]}
        >
          <sphereGeometry args={[1, 24, 16]} />
          <meshStandardMaterial color={HAIR_LIGHT} roughness={0.55} />
        </mesh>
      ))}

      {/* 长发发束 */}
      <group ref={hair}>
        {strands.map((curve, i) => (
          <mesh key={i}>
            <tubeGeometry args={[curve, 28, 0.042, 8, false]} />
            <meshStandardMaterial color={i % 2 ? HAIR : HAIR_LIGHT} roughness={0.55} />
          </mesh>
        ))}
      </group>

      {/* 鳍状耳 */}
      {([-1, 1] as const).map((s) => (
        <mesh
          key={s}
          position={[s * 0.32, HEAD.y + 0.05, 0.04]}
          rotation={[0.15, 0, s * 0.75]}
          scale={[0.13, 0.055, 0.07]}
        >
          <sphereGeometry args={[1, 24, 16]} />
          <meshStandardMaterial color={FIN} roughness={0.45} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* 女仆头带 */}
      <mesh position={[0, 1.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.17, 0.02, 12, 48, Math.PI]} />
        <meshStandardMaterial color={TRIM} roughness={0.35} />
      </mesh>
      {/* 小蝴蝶结 */}
      <mesh position={[0.15, 1.43, 0.06]} rotation={[0, 0, 0.3]} scale={[0.045, 0.03, 0.02]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={INK} roughness={0.4} />
      </mesh>

      {/* 眼睛 */}
      {([-0.115, 0.115] as const).map((x, i) => (
        <group key={x} ref={i === 0 ? eyeL : eyeR} position={[x, HEAD.y + 0.015, 0.272]}>
          <mesh scale={[0.08, 0.1, 0.03]}>
            <sphereGeometry args={[1, 32, 24]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.022]} scale={[0.058, 0.078, 0.02]}>
            <sphereGeometry args={[1, 32, 24]} />
            <meshStandardMaterial color={EYE} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0, 0.034]} scale={[0.026, 0.038, 0.012]}>
            <sphereGeometry args={[1, 24, 16]} />
            <meshStandardMaterial color={INK} roughness={0.2} />
          </mesh>
          <mesh position={[0.016, 0.032, 0.042]} scale={0.016}>
            <sphereGeometry args={[1, 12, 8]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        </group>
      ))}

      {/* 腮红 */}
      {([-0.19, 0.19] as const).map((x) => (
        <mesh key={x} position={[x, HEAD.y - 0.075, 0.24]} scale={[0.05, 0.032, 0.012]}>
          <sphereGeometry args={[1, 20, 14]} />
          <meshStandardMaterial color="#F2A6A6" roughness={0.8} transparent opacity={0.7} />
        </mesh>
      ))}

      {/* 嘴 */}
      <mesh ref={mouth} position={[0, HEAD.y - 0.13, 0.268]} scale={[0.032, 0.014, 0.008]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color="#B4626B" roughness={0.5} />
      </mesh>
    </group>
  )
}
