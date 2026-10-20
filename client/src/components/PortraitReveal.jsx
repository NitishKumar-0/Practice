import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '../hooks/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

export default function PortraitReveal() {
  const sectionRef = useRef(null)
  const mountRef = useRef(null)
  const [fallback, setFallback] = useState(false)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return undefined
    const mount = mountRef.current
    let cancel = () => {}

    try {
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
      camera.position.set(0, 0, 8)
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
      mount.appendChild(renderer.domElement)

      const photo = new Image()
      photo.src = '/images/nitish-portrait.jpg'
      photo.onload = () => {
        const samplingCanvas = document.createElement('canvas')
        const context = samplingCanvas.getContext('2d', { willReadFrequently: true })
        // Face-focused crop from the supplied tall selfie.
        const cropX = photo.width * 0.18, cropY = photo.height * 0.075
        const cropWidth = photo.width * 0.64, cropHeight = photo.height * 0.50
        const resolution = window.innerWidth < 700 ? 0.40 : 0.60
        samplingCanvas.width = Math.floor(cropWidth * resolution)
        samplingCanvas.height = Math.floor(cropHeight * resolution)
        context.drawImage(photo, cropX, cropY, cropWidth, cropHeight, 0, 0, samplingCanvas.width, samplingCanvas.height)

        const imageData = context.getImageData(0, 0, samplingCanvas.width, samplingCanvas.height).data
        const interval = window.innerWidth < 700 ? 3 : 2
        const destination = []
        const colour = []
        for (let y = 0; y < samplingCanvas.height; y += interval) {
          for (let x = 0; x < samplingCanvas.width; x += interval) {
            const pixel = (y * samplingCanvas.width + x) * 4
            const brightness = (imageData[pixel] + imageData[pixel + 1] + imageData[pixel + 2]) / 3
            if (imageData[pixel + 3] < 180 || brightness < 24) continue
            destination.push((x / samplingCanvas.width - 0.5) * 5.25, -(y / samplingCanvas.height - 0.5) * 7, (Math.random() - 0.5) * 0.22)
            colour.push(Math.min(1, imageData[pixel] / 255 * 1.18 + 0.025), Math.min(1, imageData[pixel + 1] / 255 * 1.12 + 0.015), Math.min(1, imageData[pixel + 2] / 255 * 1.08 + 0.015))
          }
        }
        if (!destination.length) return setFallback(true)

        const scattered = new Float32Array(destination.length)
        const aligned = new Float32Array(destination)
        for (let i = 0; i < scattered.length; i += 3) {
          scattered[i] = (Math.random() - 0.5) * 14
          scattered[i + 1] = (Math.random() - 0.5) * 10
          scattered[i + 2] = (Math.random() - 0.5) * 8
        }
        const geometry = new THREE.BufferGeometry()
        const position = new THREE.BufferAttribute(scattered.slice(), 3)
        geometry.setAttribute('position', position)
        geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colour), 3))
        const material = new THREE.PointsMaterial({ size: window.innerWidth < 700 ? 0.045 : 0.04, vertexColors: true, transparent: true, opacity: 0.98, depthWrite: false })
        const cloud = new THREE.Points(geometry, material)
        scene.add(cloud)

        // ScrollTrigger writes the progress directly: 0 = scattered, 1 = face.
        // Therefore every upward scroll reliably interpolates back to scattered positions.
        let progress = 0
        const trigger = ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=260%',
          pin: true,
          scrub: 0.15,
          onUpdate: self => { progress = self.progress },
        })
        const resize = () => {
          const width = mount.clientWidth, height = mount.clientHeight
          camera.aspect = width / height
          camera.updateProjectionMatrix()
          renderer.setSize(width, height)
        }
        resize()
        addEventListener('resize', resize)
        let frameId
        const draw = (time) => {
          const points = position.array
          for (let i = 0; i < points.length; i++) points[i] = scattered[i] + (aligned[i] - scattered[i]) * progress
          position.needsUpdate = true
          cloud.rotation.y = Math.sin(time * 0.00022) * 0.025
          renderer.render(scene, camera)
          frameId = requestAnimationFrame(draw)
        }
        draw(0)
        cancel = () => { cancelAnimationFrame(frameId); removeEventListener('resize', resize); trigger.kill(); geometry.dispose(); material.dispose(); renderer.dispose(); mount.replaceChildren() }
      }
      photo.onerror = () => setFallback(true)
    } catch { setFallback(true) }
    return () => cancel()
  }, [reducedMotion])

  return <section ref={sectionRef} className="portrait-stage" aria-label="Scroll-controlled particle portrait"><div ref={mountRef} className="portrait-canvas">{(fallback || reducedMotion) && <img src="/images/nitish-portrait.jpg" alt="Nitish Kumar" />}</div><div className="portrait-copy"><span>01 / ORIGIN</span><p>Every line of code is a way of turning an idea into something real.</p></div></section>
}
