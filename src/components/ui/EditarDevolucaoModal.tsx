import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Save } from 'lucide-react'
import api from '../../api/client'

interface Devolucao {
  id: number; mac: string; os: string; descricao: string
  data_devolucao: string; tecnico_id: number; equipamento_id: number
  tecnico_nome: string; marca: string; tipo: string
}
interface Tecnico     { id: number; nome: string }
interface Equipamento { id: number; marca: string; tipo: string }

const schema = z.object({
  mac:            z.string().max(17).optional().or(z.literal('')),
  os:             z.string().max(50).optional().or(z.literal('')),
  descricao:      z.string().max(1000).optional().or(z.literal('')),
  data_devolucao: z.string().min(1, 'Data é obrigatória'),
  tecnico_id:     z.string().min(1, 'Selecione o técnico'),
  equipamento_id: z.string().min(1, 'Selecione o equipamento'),
})
type Form = z.infer<typeof schema>

interface Props {
  devolucao: Devolucao
  onClose: () => void
  onSaved: () => void
}

export default function EditarDevolucaoModal({ devolucao, onClose, onSaved }: Props) {
  const [tecnicos,     setTecnicos]     = useState<Tecnico[]>([])
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([])
  const [apiError,     setApiError]     = useState('')

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      mac:            devolucao.mac            || '',
      os:             devolucao.os             || '',
      descricao:      devolucao.descricao      || '',
      data_devolucao: devolucao.data_devolucao,
      tecnico_id:     String(devolucao.tecnico_id),
      equipamento_id: String(devolucao.equipamento_id),
    },
  })

  useEffect(() => {
    Promise.all([
      api.get('/tecnicos/ativos'),
      api.get('/equipamentos/ativos'),
    ]).then(([t, e]) => {
      setTecnicos(t.data.tecnicos)
      setEquipamentos(e.data.equipamentos)
    })
  }, [])

  const handleUppercase = (field: 'mac' | 'os') => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(field, e.target.value.toUpperCase(), { shouldValidate: true })
  }

  const onSubmit = async (data: Form) => {
    setApiError('')
    try {
      await api.put(`/devolucoes/${devolucao.id}`, {
        ...data,
        mac:            data.mac            || null,
        os:             data.os             || null,
        descricao:      data.descricao      || null,
        tecnico_id:     Number(data.tecnico_id),
        equipamento_id: Number(data.equipamento_id),
      })
      onSaved()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { erro?: string } } })?.response?.data?.erro
      setApiError(msg || 'Erro ao atualizar devolução')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <h2 className="font-display font-semibold text-surface-900">Editar devolução #{devolucao.id}</h2>
          <button onClick={onClose} aria-label="Fechar modal" className="btn-ghost p-1.5 rounded-lg"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Técnico <span className="text-red-500">*</span></label>
              <select {...register('tecnico_id')} className={`input ${errors.tecnico_id ? 'input-error' : ''}`}>
                <option value="">Selecione...</option>
                {tecnicos.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </select>
              {errors.tecnico_id && <p className="field-error">{errors.tecnico_id.message}</p>}
            </div>
            <div>
              <label className="label">Data <span className="text-red-500">*</span></label>
              <input {...register('data_devolucao')} type="date" className={`input ${errors.data_devolucao ? 'input-error' : ''}`} />
              {errors.data_devolucao && <p className="field-error">{errors.data_devolucao.message}</p>}
            </div>
          </div>

          <div>
            <label className="label">Equipamento <span className="text-red-500">*</span></label>
            <select {...register('equipamento_id')} className={`input ${errors.equipamento_id ? 'input-error' : ''}`}>
              <option value="">Selecione...</option>
              {equipamentos.map((e) => <option key={e.id} value={e.id}>{e.marca} — {e.tipo}</option>)}
            </select>
            {errors.equipamento_id && <p className="field-error">{errors.equipamento_id.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">MAC</label>
              <input
                {...register('mac')} value={watch('mac') || ''}
                onChange={handleUppercase('mac')}
                placeholder="AA:BB:CC:DD:EE:FF"
                className="input font-mono"
              />
            </div>
            <div>
              <label className="label">OS</label>
              <input
                {...register('os')} value={watch('os') || ''}
                onChange={handleUppercase('os')}
                placeholder="OS123456"
                className="input font-mono"
              />
            </div>
          </div>

          <div>
            <label className="label">Descrição</label>
            <textarea {...register('descricao')} rows={3} className="input resize-none" placeholder="Observações..." />
          </div>

          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{apiError}</div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary gap-2">
              {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}