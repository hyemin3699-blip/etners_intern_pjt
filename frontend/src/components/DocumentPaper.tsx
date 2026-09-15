import type { AutoFieldKey, DocumentTemplate } from '../data/documentTemplates'
import type { Employee } from '../types'

function resolveAuto(field: AutoFieldKey, employee: Employee | null): string {
  if (!employee) return ''
  switch (field) {
    case 'name':
      return employee.name
    case 'company':
      return employee.company
    case 'department':
      return employee.department ?? ''
    case 'employeeNo':
      return employee.employeeNo ?? ''
  }
}

export default function DocumentPaper({
  template,
  employee,
  values,
  onChange,
  editable = false,
  children,
}: {
  template: DocumentTemplate
  employee: Employee | null
  values: Record<string, string>
  onChange?: (key: string, value: string) => void
  editable?: boolean
  children?: React.ReactNode
}) {
  return (
    <div className="mx-auto max-w-lg border border-slate-300 bg-white p-8 shadow-sm">
      <p className="text-xs text-slate-400">[{template.formNumber}]</p>
      <h1 className="mb-6 mt-3 text-center text-xl font-bold text-slate-900">{template.title}</h1>

      <table className="w-full table-fixed border-collapse border border-slate-800 text-sm">
        <colgroup>
          <col style={{ width: '20%' }} />
          <col style={{ width: '30%' }} />
          <col style={{ width: '20%' }} />
          <col style={{ width: '30%' }} />
        </colgroup>
        <tbody>
          {template.rows.map((row, i) =>
            'section' in row ? (
              <tr key={i}>
                <td colSpan={4} className="border border-slate-800 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                  {row.section}
                </td>
              </tr>
            ) : (
              <tr key={i}>
                {row.map((cell, j) => {
                  if (cell.kind === 'label') {
                    return (
                      <td
                        key={j}
                        className="border border-slate-800 bg-slate-50 px-2 py-2.5 text-center text-xs font-medium text-slate-600"
                      >
                        {cell.text}
                      </td>
                    )
                  }
                  if (cell.kind === 'auto') {
                    const value = resolveAuto(cell.field, employee)
                    return (
                      <td
                        key={j}
                        colSpan={cell.span}
                        className="border border-slate-800 bg-white px-2 py-2.5 text-center text-sm font-semibold text-slate-900"
                      >
                        {value || '-'}
                      </td>
                    )
                  }
                  const value = values[cell.key] ?? ''
                  const filled = value.trim().length > 0
                  if (editable) {
                    return (
                      <td key={j} colSpan={cell.span} className="border border-slate-800 p-0">
                        <input
                          value={value}
                          onChange={(e) => onChange?.(cell.key, e.target.value)}
                          placeholder={cell.placeholder ?? '직접 입력해주세요'}
                          className={`w-full bg-white px-2 py-2.5 text-center text-sm outline-none transition-colors ${
                            filled ? 'font-semibold text-sky-700' : 'text-rose-400 placeholder:text-rose-400'
                          }`}
                        />
                      </td>
                    )
                  }
                  // 완성된(읽기 전용) 문서는 진행 중 표시(빨강/파랑) 없이 검은 글씨로 통일한다.
                  return (
                    <td
                      key={j}
                      colSpan={cell.span}
                      className="border border-slate-800 bg-white px-2 py-2.5 text-center text-sm font-semibold text-slate-900"
                    >
                      {value || '-'}
                    </td>
                  )
                })}
              </tr>
            ),
          )}
        </tbody>
      </table>

      {template.noteLines && (
        <ul className="mt-3 space-y-0.5">
          {template.noteLines.map((line, i) => (
            <li key={i} className="text-[11px] text-slate-400">
              {line}
            </li>
          ))}
        </ul>
      )}

      {children}
    </div>
  )
}
