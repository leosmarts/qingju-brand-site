import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useLive } from '../data/live'

type Props = {
  position?: [number, number, number]
  rotation?: [number, number, number]
}

const CREAM = '#F2C784'
const BASE = 4.3

/** 把透射的果冻材质换掉：省掉一遍全场景渲染，颜色也更暖 */
function replaceJelly(material: THREE.Material): THREE.Material {
  if (material.name !== 'jellyCocoa') return material
  const m = new THREE.MeshStandardMaterial({
    color: new THREE.Color(CREAM),
    roughness: 0.62,
    metalness: 0,
  })
  m.name = 'jellyCocoaOpaque'
  return m
}

/** 直播间主播「嘟嘟」：CC0 果冻小怪兽模型，眨眼 / 口型 / 说话时的挤压感都是运行时加的 */
export function Mascot({ position = [0, 0, 0], rotation = [0, 0, 0] }: Props) {
  const speaking = useLive((s) => s.speaking)

  const gltf = useGLTF('/models/CocoaJelly.glb')
  const root = useRef<THREE.Group>(null)

  // 每个实例单独 clone，避免 useGLTF 缓存被多个组件共享后被污染
  const scene = useMemo(() => {
    const cloned = gltf.scene.clone(true)
    cloned.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.castShadow = true
      mesh.receiveShadow = true

      // 原模型用的是透射材质，会额外渲染一遍全场景，移动端开销大且在部分环境下发灰。
      // 这里换成不透明的暖奶油色，视觉上更接近参考图里的实体毛绒感。
      const src = mesh.material as THREE.Material | THREE.Material[]
      const list = Array.isArray(src) ? src : [src]
      mesh.material = Array.isArray(src)
        ? list.map(replaceJelly)
        : replaceJelly(src)
    })
    return cloned
  }, [gltf.scene])

  const { actions, mixer } = useAnimations(gltf.animations, root)

  const eyes = useMemo(
    () => [scene.getObjectByName('eye-left'), scene.getObjectByName('eye-right')].filter(Boolean) as THREE.Object3D[],
    [scene],
  )
  const mouth = useMemo(() => scene.getObjectByName('mouth'), [scene])

  // 眼睛和嘴巴是独立节点，自带 0.02 左右的基准缩放，缩放时必须乘上基准值，
  // 直接赋值会把它们放大几十倍，变成穿透角色的尖刺。
  const eyeBase = useMemo(() => eyes.map((e) => e.scale.y), [eyes])
  const mouthBase = useMemo(() => mouth?.scale.y ?? 1, [mouth])

  const blinkAt = useRef(2.4)
  const blinkUntil = useRef(0)

  useEffect(() => {
    const bob = actions.bob ?? Object.values(actions)[0]
    bob?.reset().play()
    return () => {
      mixer.stopAllAction()
    }
  }, [actions, mixer])

  useFrame((state) => {
    const t = state.clock.elapsedTime

    // 说话时的整体挤压 / 拉伸，替代没有骨骼的口型
    if (root.current) {
      const amp = speaking ? 0.045 : 0.012
      root.current.scale.y = BASE * (1 + Math.sin(t * (speaking ? 9 : 1.6)) * amp)
      root.current.scale.x = root.current.scale.z = BASE * (1 - Math.sin(t * (speaking ? 9 : 1.6)) * amp * 0.6)
    }

    if (t > blinkAt.current) {
      blinkUntil.current = t + 0.12
      blinkAt.current = t + 2.2 + Math.random() * 3
    }
    const closed = t < blinkUntil.current
    eyes.forEach((e, i) => {
      e.scale.y = eyeBase[i] * (closed ? 0.12 : 1)
    })

    if (mouth) {
      const open = speaking ? 1 + Math.abs(Math.sin(t * 10)) * 0.9 : 1
      mouth.scale.y = THREE.MathUtils.lerp(mouth.scale.y, mouthBase * open, 0.35)
    }
  })

  return (
    <group ref={root} position={position} rotation={rotation} scale={BASE}>
      <primitive object={scene} />
      {/* 落在沙发上的接触阴影，让角色不至于看起来悬空 */}
      <mesh position={[0, 0.004, 0.01]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.15, 32]} />
        <meshBasicMaterial color="#6B4526" transparent opacity={0.2} depthWrite={false} />
      </mesh>
    </group>
  )
}

useGLTF.preload('/models/CocoaJelly.glb')
