import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

export interface SignaturePadHandle {
  getDataUrl: () => string | null
  isEmpty: () => boolean
}

const SignaturePad = forwardRef<SignaturePadHandle>((_props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawingRef = useRef(false)
  const [hasSignature, setHasSignature] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    // 고해상도 화면에서도 선명하게 보이도록 실제 픽셀 해상도를 늘려준다.
    const ratio = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * ratio
    canvas.height = rect.height * ratio
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(ratio, ratio)
      ctx.lineWidth = 2.5
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = '#1e293b'
    }
  }, [])

  useImperativeHandle(ref, () => ({
    getDataUrl: () => (hasSignature ? (canvasRef.current?.toDataURL('image/png') ?? null) : null),
    isEmpty: () => !hasSignature,
  }))

  function getPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return
    canvas!.setPointerCapture(e.pointerId)
    drawingRef.current = true
    const { x, y } = getPos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
    setHasSignature(true)
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const { x, y } = getPos(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  function handlePointerUp() {
    drawingRef.current = false
  }

  function handleClear() {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="h-40 w-full touch-none"
        />
        {!hasSignature && (
          <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-slate-400">
            마우스로 서명해주세요
          </p>
        )}
      </div>
      <div className="mt-2 flex justify-end">
        <button
          onClick={handleClear}
          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-50"
        >
          다시 작성
        </button>
      </div>
    </div>
  )
})

SignaturePad.displayName = 'SignaturePad'

export default SignaturePad
