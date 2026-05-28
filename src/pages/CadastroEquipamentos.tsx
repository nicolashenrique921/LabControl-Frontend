import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Cpu, Plus, Pencil, Trash2, Save, X } from 'lucide-react'
import api from '../api/client'
import { useToast } from '../hooks/UseToast'
import ToastContainer from '../components/ui/Toastcontainer'
import ConfirmDialog from '../components/ui/Confirmdialog'

interface Equipamento { id: number; marca: string; tipo: string; ativo: boolean }

const schema = z.object({
    marca: z.string().min(1, 'Marca é obrigatória').max(100),
    tipo: z.string().min(1, 'Tipo é obrigatório').max(100),
    ativo: z.boolean().optional(),
})
type Form = z.infer<typeof schema>

export default function CadastroEquipamentos() {
    const [equipamentos, setEquipamentos] = useState<Equipamento[]>([])
    const [loading, setLoading] = useState(false)
    const [editId, setEditId] = useState<number | null>(null)
    const [delId, setDelId] = useState<number | null>(null)
    const [delLoading, setDelLoading] = useState(false)
    const { toasts, success, error } = useToast()

    const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<Form>({
        resolver: zodResolver(schema),
    })

    const carregar = async () => {
        setLoading(true)
        try {
            const r = await api.get('/equipamentos')
            setEquipamentos(r.data.equipamentos)
        } finally { setLoading(false) }
    }

    useEffect(() => { carregar() }, [])

    const onSubmit = async (data: Form) => {
        try {
            if (editId) {
                await api.put(`/equipamentos/${editId}`, data)
                success('Equipamento atualizado!')
            } else {
                await api.post('/equipamentos', data)
                success('Equipamento criado!')
            }
            reset(); setEditId(null); carregar()
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { erro?: string } } })?.response?.data?.erro
            error(msg || 'Erro ao salvar equipamento')
        }
    }

    const startEdit = (e: Equipamento) => {
        setEditId(e.id)
        setValue('marca', e.marca)
        setValue('tipo', e.tipo)
        setValue('ativo', e.ativo)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const cancelEdit = () => { setEditId(null); reset() }

    const handleDelete = async () => {
        if (!delId) return
        setDelLoading(true)
        try {
            await api.delete(`/equipamentos/${delId}`)
            success('Equipamento excluído!')
            setDelId(null); carregar()
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { erro?: string } } })?.response?.data?.erro
            error(msg || 'Erro ao excluir equipamento')
        } finally { setDelLoading(false) }
    }

    const toggleAtivo = async (e: Equipamento) => {
        try {
            await api.put(`/equipamentos/${e.id}`, { ativo: !e.ativo })
            success(`Equipamento ${!e.ativo ? 'ativado' : 'inativado'}`)
            carregar()
        } catch { error('Erro ao atualizar status') }
    }

    return (
        <>
            <ToastContainer toasts={toasts} />
            <ConfirmDialog
                open={!!delId}
                title="Excluir equipamento"
                message="Esta ação não pode ser desfeita. Se o equipamento tiver devoluções, não poderá ser excluído."
                onConfirm={handleDelete}
                onCancel={() => setDelId(null)}
                loading={delLoading}
            />

            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center shadow-sm shadow-brand-200">
                        <Cpu size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="page-title">Equipamentos</h1>
                        <p className="page-subtitle">Cadastre marcas e tipos de equipamentos</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="card">
                    <div className="card-header">
                        <h2 className="font-display font-semibold text-sm text-surface-700">
                            {editId ? 'Editar equipamento' : 'Novo equipamento'}
                        </h2>
                        {editId && (
                            <button type="button" onClick={cancelEdit} className="btn-ghost btn-sm gap-1">
                                <X size={13} /> Cancelar
                            </button>
                        )}
                    </div>
                    <div className="card-body">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="label">Marca <span className="text-red-500">*</span></label>
                                <input
                                    {...register('marca')}
                                    placeholder="Ex: Huawei, TP-Link, Intelbras"
                                    className={`input ${errors.marca ? 'input-error' : ''}`}
                                />
                                {errors.marca && <p className="field-error">{errors.marca.message}</p>}
                            </div>
                            <div>
                                <label className="label">Tipo <span className="text-red-500">*</span></label>
                                <input
                                    {...register('tipo')}
                                    placeholder="Ex: ONT, ONU, ROTEADOR"
                                    className={`input ${errors.tipo ? 'input-error' : ''}`}
                                />
                                {errors.tipo && <p className="field-error">{errors.tipo.message}</p>}
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button type="submit" disabled={isSubmitting} className="btn-primary gap-2">
                                {isSubmitting
                                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    : editId ? <Save size={15} /> : <Plus size={15} />}
                                {editId ? 'Salvar alterações' : 'Adicionar equipamento'}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Lista */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="font-display font-semibold text-sm text-surface-700">
                            Equipamentos cadastrados ({equipamentos.length})
                        </h2>
                    </div>
                    {loading ? (
                        <div className="py-12 flex justify-center">
                            <div className="w-7 h-7 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
                        </div>
                    ) : equipamentos.length === 0 ? (
                        <div className="py-12 text-center text-surface-400">
                            <Cpu size={32} className="mx-auto mb-2 opacity-30" />
                            <p className="text-sm">Nenhum equipamento cadastrado ainda</p>
                        </div>
                    ) : (
                        <div className="table-wrap">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Marca</th>
                                        <th>Tipo</th>
                                        <th>Status</th>
                                        <th className="text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {equipamentos.map((e) => (
                                        <tr key={e.id} className={!e.ativo ? 'opacity-50' : ''}>
                                            <td className="font-medium">{e.marca}</td>
                                            <td><span className="badge-blue">{e.tipo}</span></td>
                                            <td>
                                                <button
                                                    onClick={() => toggleAtivo(e)}
                                                    className={`badge cursor-pointer transition-opacity hover:opacity-80 ${e.ativo ? 'badge-green' : 'badge-gray'}`}
                                                >
                                                    {e.ativo ? 'Ativo' : 'Inativo'}
                                                </button>
                                            </td>
                                            <td>
                                                <div className="flex gap-1 justify-end">
                                                    <button onClick={() => startEdit(e)} className="btn-ghost btn-sm p-1.5 rounded-lg" title="Editar">
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button onClick={() => setDelId(e.id)} className="btn-ghost btn-sm p-1.5 rounded-lg text-red-500 hover:bg-red-50" title="Excluir">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}