import { useEffect, useMemo, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'

type FoxProps = {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
}

/** 开源低模狐狸（Khronos glTF Sample Assets, CC BY 4.0），带 Survey / Walk / Run 动画 */
export function Fox({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }: FoxProps) {
  const root = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF('/models/Fox.glb')
  const { actions } = useAnimations(animations, root)

  const factor = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const size = new THREE.Vector3()
    box.getSize(size)
    return 0.95 / (size.z || 1)
  }, [scene])

  const offset = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const center = new THREE.Vector3()
    box.getCenter(center)
    return [-center.x, -box.min.y, -center.z] as [number, number, number]
  }, [scene])

  useEffect(() => {
    actions.Survey?.reset().fadeIn(0.5).play()
  }, [actions])

  return (
    <group ref={root} position={position} rotation={rotation} scale={scale}>
      <group scale={factor}>
        <primitive object={scene} position={offset} />
      </group>
    </group>
  )
}

useGLTF.preload('/models/Fox.glb')
