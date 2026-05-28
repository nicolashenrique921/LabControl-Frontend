import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PackageOpen, Save } from 'lucide-react'
import api from '../api/client'
import { useToast } from '../hooks/UseToast'
import ToastContainer from '../components/ui/Toastcontainer'

interface Tecnico { id: number; nome: string }
interface Equipamento { id: number; marca: string; tipo: string }

const schema = z.object({
    mac: z.string().max(17).optional().or(z.literal('')),
    os: z.string().max(50).optional().or(z.literal('')),
    descricao: z.string().max(1000).optional().or(z.literal('')),
    data_devolucao: z.string().min(1, 'Data é obrigatória'),
    tecnico_id: z.string().min(1, 'Selecione o técnico'),
    equipamento_id: z.string().min(1, 'Selecione o equipamento'),
})
type Form = z.infer<typeof schema>

export default function RegistroDevolucao() {
    const [tecnicos, setTecnicos] = useState<Tecnico[]>([])
    const [equipamentos, setEquipamentos] = useState<Equipamento[]>([])
    const { toasts, success, error } = useToast()

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<Form>({
        resolver: zodResolver(schema),
        defaultValues: { data_devolucao: new Date().toISOString().split('T')[0] },
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

    // Força maiúsculo em MAC e OS enquanto digita
    const handleUppercase = (field: 'mac' | 'os') => (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(field, e.target.value.toUpperCase(), { shouldValidate: true })
    }

    const onSubmit = async (data: Form) => {
        try {
            await api.post('/devolucoes', {
                ...data,
                mac: data.mac || null,
                os: data.os || null,
                descricao: data.descricao || null,
                tecnico_id: Number(data.tecnico_id),
                equipamento_id: Number(data.equipamento_id),
            })
            success('Devolução registrada com sucesso!')
            // Mantém na página, apenas limpa MAC, OS e descrição
            reset({
                mac: '',
                os: '',
                descricao: '',
                data_devolucao: data.data_devolucao,
                tecnico_id: data.tecnico_id,
                equipamento_id: data.equipamento_id,
            })
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { erro?: string } } })
                ?.response?.data?.erro
            error(msg || 'Erro ao registrar devolução')
        }
    }

    return (
        <>
            <ToastContainer toasts={toasts} />

            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center shadow-sm shadow-brand-200">
                            <PackageOpen size={18} className="text-white" />
                        </div>
                        <h1 className="page-title">Registrar Devolução</h1>
                    </div>
                    <p className="page-subtitle ml-12">Preencha os dados do equipamento devolvido</p>
                </div>

                {/* Form card */}
                <form onSubmit={handleSubmit(onSubmit)} className="card">
                    <div className="card-body space-y-5">

                        {/* Linha: Técnico + Data */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="label">
                                    Técnico <span className="text-red-500">*</span>
                                </label>
                                <select {...register('tecnico_id')} className={`input ${errors.tecnico_id ? 'input-error' : ''}`}>
                                    <option value="">Selecione o técnico...</option>
                                    {tecnicos.map((t) => (
                                        <option key={t.id} value={t.id}>{t.nome}</option>
                                    ))}
                                </select>
                                {errors.tecnico_id && <p className="field-error">{errors.tecnico_id.message}</p>}
                            </div>

                            <div>
                                <label className="label">
                                    Data da devolução <span className="text-red-500">*</span>
                                </label>
                                <input
                                    {...register('data_devolucao')}
                                    type="date"
                                    className={`input ${errors.data_devolucao ? 'input-error' : ''}`}
                                />
                                {errors.data_devolucao && <p className="field-error">{errors.data_devolucao.message}</p>}
                            </div>
                        </div>

                        {/* Equipamento */}
                        <div>
                            <label className="label">
                                Equipamento <span className="text-red-500">*</span>
                            </label>
                            <select {...register('equipamento_id')} className={`input ${errors.equipamento_id ? 'input-error' : ''}`}>
                                <option value="">Selecione o equipamento...</option>
                                {equipamentos.map((e) => (
                                    <option key={e.id} value={e.id}>{e.marca} — {e.tipo}</option>
                                ))}
                            </select>
                            {errors.equipamento_id && <p className="field-error">{errors.equipamento_id.message}</p>}
                        </div>

                        {/* Linha: MAC + OS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="label">
                                    MAC <span className="text-surface-400 font-normal text-xs">(opcional)</span>
                                </label>
                                <input
                                    {...register('mac')}
                                    value={watch('mac') || ''}
                                    onChange={handleUppercase('mac')}
                                    type="text"
                                    placeholder="AA:BB:CC:DD:EE:FF"
                                    className={`input font-mono ${errors.mac ? 'input-error' : ''}`}
                                />
                                {errors.mac && <p className="field-error">{errors.mac.message}</p>}
                            </div>

                            <div>
                                <label className="label">
                                    OS <span className="text-surface-400 font-normal text-xs">(opcional)</span>
                                </label>
                                <input
                                    {...register('os')}
                                    value={watch('os') || ''}
                                    onChange={handleUppercase('os')}
                                    type="text"
                                    placeholder="OS123456"
                                    className={`input font-mono ${errors.os ? 'input-error' : ''}`}
                                />
                                {errors.os && <p className="field-error">{errors.os.message}</p>}
                            </div>
                        </div>

                        {/* Descrição */}
                        <div>
                            <label className="label">
                                Descrição <span className="text-surface-400 font-normal text-xs">(opcional)</span>
                            </label>
                            <textarea
                                {...register('descricao')}
                                rows={3}
                                placeholder="Observações sobre o equipamento..."
                                className={`input resize-none ${errors.descricao ? 'input-error' : ''}`}
                            />
                            {errors.descricao && <p className="field-error">{errors.descricao.message}</p>}
                        </div>

                        {/* Submit */}
                        <div className="pt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-primary gap-2 px-6"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        Salvar devolução
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Legenda */}
                <p className="text-xs text-surface-400 mt-4 text-center">
                    Campos marcados com <span className="text-red-500">*</span> são obrigatórios. MAC e OS são convertidos automaticamente para maiúsculas.
                </p>
            </div>
        </>
    )
}