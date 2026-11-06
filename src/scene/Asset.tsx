import { useEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

type AssetProps = {
  url: string
  /** 目标尺寸（米），按 axis 指定的轴缩放 */
  fit?: number
  axis?: 'x' | 'y' | 'z' | 'max'
  position?: [number, number, number]
  rotation?: [number, number, number]
  /** 材质名（或节点名）包含该关键字时替换颜色 */
  recolor?: { match: string; color: string }
  hide?: string[]
}

/**
 * 载入外部 glTF 资源，自动按包围盒缩放到目标尺寸，
 * 并把底面贴到 y=0、水平方向居中，避免模型原点不一致导致摆歪。
 */
export function Asset({ url, fit = 1, axis = 'max', position = [0, 0, 0], rotation = [0, 0, 0], recolor, hide }: AssetProps) {
  const { scene } = useGLTF(url)

  const { scale, offset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)

    const source = axis === 'max' ? Math.max(size.x, size.y, size.z) : size[axis]
    const scale = source > 0 ? fit / source : 1

    return {
      scale,
      offset: [-center.x, -box.min.y, -center.z] as [number, number, number],
    }
  }, [scene, fit, axis])

  useEffect(() => {
    scene.traverse((obj) => {
      if (hide?.some((key) => obj.name.includes(key))) obj.visible = false
      if (!recolor) return
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh) return
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      if (obj.name.includes(recolor.match)) {
        materials.forEach((mat) => {
          const standard = mat as THREE.MeshStandardMaterial
          if (standard.color) standard.color.set(recolor.color)
          standard.roughness = 0.85
          const sheen = standard as unknown as { sheenColor?: THREE.Color }
          if (sheen.sheenColor) sheen.sheenColor.set(recolor.color)
        })
      }
    })
  }, [scene, recolor, hide])

  return (
    <group position={position} rotation={rotation}>
      <group scale={scale}>
        <primitive object={scene} position={offset} />
      </group>
    </group>
  )
}
