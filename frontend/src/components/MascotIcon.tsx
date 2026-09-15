// 회사 캐릭터 이미지 (frontend/public/image.png)
export default function MascotIcon({ className }: { className?: string }) {
  return <img src="/image.png" alt="AI 업무처리 Assistant" className={`${className ?? ''} object-contain`} />
}
