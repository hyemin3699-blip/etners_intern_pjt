// 실제로 그려진 서명 데이터가 없는 완료 사례(mock)에서, 손으로 직접 쓴 것처럼
// 보이도록 이름을 손글씨 폰트로 렌더링한다. 실제 서명 인증이 아닌 시연용 표현이다.
export default function HandwrittenSignature({ name }: { name: string }) {
  return (
    <span
      className="font-signature inline-block text-3xl leading-none text-slate-800"
      style={{ transform: 'rotate(-3deg)' }}
    >
      {name}
    </span>
  )
}
