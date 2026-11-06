import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { Scene } from './scene/Scene'
import { Overlay } from './ui/Overlay'
import { useLive } from './data/live'

function detectWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export default function App() {
  const tick = useLive((s) => s.tick)
  const [webgl] = useState(detectWebGL)

  useEffect(() => {
    const id = window.setInterval(tick, 1200)
    return () => window.clearInterval(id)
  }, [tick])

  return (
    <div className="stage">
      {webgl ? (
        <Canvas
          shadows="soft"
          dpr={[1, 2]}
          camera={{ position: [0, 2.2, 7.2], fov: 44, near: 0.1, far: 60 }}
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 0.98,
          }}
        >
          <Scene />
        </Canvas>
      ) : (
        <div className="noWebGL">
          <p>当前浏览器没有启用 WebGL，3D 场景无法渲染</p>
          <p className="hint">请在浏览器设置里开启硬件加速 / WebGL 后刷新</p>
        </div>
      )}
      <Overlay />
    </div>
  )
}
