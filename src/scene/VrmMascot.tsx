import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { VRM, VRMExpressionPresetName, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm'
import * as THREE from 'three'
import { useLive } from '../data/live'

type Props = {
  position?: [number, number, number]
  rotation?: [number, number, number]
}

/**
 * 直播间主播：CC0 的 VRM 人形角色（Polygonal Mind · 100 Avatars）。
 * 骨骼是标准 VRM Humanoid，待机、挥手、眨眼、口型全部在运行时用骨骼和表情驱动。
 */
export function VrmMascot({ position = [0, 0, 0], rotation = [0, 0, 0] }: Props) {
  const speaking = useLive((s) => s.speaking)

  const gltf = useLoader(GLTFLoader, '/models/TwoTails.vrm', (loader) => {
    loader.register((parser) => new VRMLoaderPlugin(parser))
  })

  const vrm = gltf.userData.vrm as VRM

  useMemo(() => {
    if (!vrm) return
    // VRM 0.x 的模型朝向 -Z，这个工具函数把它转成 +Z，和场景其他模型一致
    VRMUtils.rotateVRM0(vrm)
    vrm.scene.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (mesh.isMesh) {
        mesh.castShadow = true
        mesh.receiveShadow = true
        mesh.frustumCulled = false
      }
    })
  }, [vrm])

  useEffect(() => {
    return () => {
      if (vrm) VRMUtils.deepDispose(vrm.scene)
    }
  }, [vrm])

  const bones = useMemo(() => {
    const h = vrm?.humanoid
    return {
      head: h?.getNormalizedBoneNode('head') ?? null,
      spine: h?.getNormalizedBoneNode('spine') ?? null,
      armR: h?.getNormalizedBoneNode('rightUpperArm') ?? null,
      forearmR: h?.getNormalizedBoneNode('rightLowerArm') ?? null,
      armL: h?.getNormalizedBoneNode('leftUpperArm') ?? null,
      chest: h?.getNormalizedBoneNode('chest') ?? null,
    }
  }, [vrm])

  // 有的 VRM 导出时不是 1:1 米制，这里按包围盒统一缩放到 1.5m 并把脚底对齐地面
  const fit = useMemo(() => {
    if (!vrm) return { scale: 1, footY: 0 }
    const box = new THREE.Box3().setFromObject(vrm.scene)
    const height = Math.max(box.max.y - box.min.y, 0.001)
    return { scale: 1.5 / height, footY: -box.min.y }
  }, [vrm])

  const blinkAt = useRef(1.8)
  const blinkUntil = useRef(0)
  const waveUntil = useRef(0)
  const spokenAt = useRef(0)

  useFrame((state, delta) => {
    if (!vrm) return
    const t = state.clock.elapsedTime

    // 眨眼
    if (t > blinkAt.current) {
      blinkUntil.current = t + 0.14
      blinkAt.current = t + 2.4 + Math.random() * 3.4
    }
    vrm.expressionManager?.setValue(
      VRMExpressionPresetName.Blink,
      t < blinkUntil.current ? 1 : 0,
    )

    // 说话：嘴型 + 轻微点头
    if (speaking) {
      spokenAt.current = t
      const open = 0.35 + Math.abs(Math.sin(t * 9)) * 0.55
      vrm.expressionManager?.setValue(VRMExpressionPresetName.Aa, open)
    } else {
      vrm.expressionManager?.setValue(VRMExpressionPresetName.Aa, 0)
    }

    // 呼吸 / 待机摇摆
    if (bones.spine) {
      bones.spine.rotation.x = Math.sin(t * 1.5) * 0.015
      bones.spine.rotation.z = Math.sin(t * 0.7) * 0.02
    }
    if (bones.head) {
      bones.head.rotation.y = Math.sin(t * 0.6) * 0.09
      bones.head.rotation.z = Math.sin(t * 0.9) * 0.035
      bones.head.rotation.x = speaking ? Math.sin(t * 5) * 0.035 : Math.sin(t * 1.5) * 0.02
    }
    if (bones.chest) bones.chest.rotation.x = Math.sin(t * 1.5) * 0.012

    // 随机挥手
    if (Math.random() < 0.003) waveUntil.current = t + 1.8
    const waving = t < waveUntil.current
    if (bones.armR) {
      // VRM 归一化骨骼的静止姿势是 T-pose，手臂水平伸展，要绕 Z 轴压到身体两侧
      const target = waving ? 0.15 + Math.sin(t * 11) * 0.12 : -1.32
      bones.armR.rotation.z = THREE.MathUtils.lerp(bones.armR.rotation.z, target, 0.15)
      bones.armR.rotation.x = THREE.MathUtils.lerp(bones.armR.rotation.x, waving ? -0.2 : 0.08, 0.15)
    }
    if (bones.armL) {
      bones.armL.rotation.z = THREE.MathUtils.lerp(bones.armL.rotation.z, 1.32, 0.15)
      bones.armL.rotation.x = THREE.MathUtils.lerp(bones.armL.rotation.x, 0.08, 0.15)
    }
    if (bones.forearmR) {
      bones.forearmR.rotation.x = THREE.MathUtils.lerp(
        bones.forearmR.rotation.x,
        waving ? -0.45 : -0.12,
        0.15,
      )
    }

    // 看向镜头
    if (vrm.lookAt) vrm.lookAt.target = state.camera

    // 更新表情 / 骨骼 / 头发裙摆的 spring bone 物理
    vrm.update(delta)
  })

  return (
    <group position={position} rotation={rotation} scale={fit.scale}>
      <primitive object={vrm.scene} position={[0, fit.footY, 0]} />
    </group>
  )
}
