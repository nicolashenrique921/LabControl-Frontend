import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Users, Plus, Pencil, Trash2, Save, X } from 'lucide-react'
import api from '../api/client'
import { useToast } from '../hooks/UseToast.ts'
import ToastContainer from '../components/ui/Toastcontainer.tsx'
import ConfirmDialog from '../components/ui/Confirmdialog.tsx'

interface Tecnico { id: number; nome: string; ativo: boolean; criado_em: string }

const schema = z.object({
    nome: z.string().min(1, 'Nome é obrigatório').max(100),
})
type Form = z.infer<typeof schema>

export default function CadastroTecnicos() {
    const [tecnicos, setTecnicos] = useState<Tecnico[]>([])
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
            const r = await api.get('/tecnicos')
            setTecnicos(r.data.tecnicos)
        } finally { setLoading(false) }
    }

    useEffect(() => { carregar() }, [])

    const onSubmit = async (data: Form) => {
        try {
            if (editId) {
                await api.put(`/tecnicos/${editId}`, data)
                success('Técnico atualizado!')
            } else {
                await api.post('/tecnicos', data)
                success('Técnico criado!')
            }
            reset(); setEditId(null); carregar()
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { erro?: string } } })?.response?.data?.erro
            error(msg || 'Erro ao salvar técnico')
        }
    }

    const startEdit = (t: Tecnico) => {
        setEditId(t.id)
        setValue('nome', t.nome)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const cancelEdit = () => { setEditId(null); reset() }

    const handleDelete = async () => {
        if (!delId) return
        setDelLoading(true)
        try {
            await api.delete(`/tecnicos/${delId}`)
            success('Técnico excluído!')
            setDelId(null); carregar()
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { erro?: string } } })?.response?.data?.erro
            error(msg || 'Erro ao excluir técnico')
        } finally { setDelLoading(false) }
    }

    const toggleAtivo = async (t: Tecnico) => {
        try {
            await api.put(`/tecnicos/${t.id}`, { ativo: !t.ativo })
            success(`Técnico ${!t.ativo ? 'ativado' : 'inativado'}`)
            carregar()
        } catch { error('Erro ao atualizar status') }
    }

    const ativos = tecnicos.filter((t) => t.ativo)
    const inativos = tecnicos.filter((t) => !t.ativo)

    return (
        <>
            <ToastContainer toasts={toasts} />
            <ConfirmDialog
                open={!!delId}
                title="Excluir técnico"
                message="Esta ação não pode ser desfeita. Se o técnico tiver devoluções, não poderá ser excluído."
                onConfirm={handleDelete}
                onCancel={() => setDelId(null)}
                loading={delLoading}
            />

            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center shadow-sm shadow-brand-200">
                        <Users size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="page-title">Técnicos</h1>
                        <p className="page-subtitle">Gerencie a lista de técnicos do laboratório</p>
                    </div>
                </div>

                {/* Estatísticas rápidas */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="card p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                            <span className="text-green-600 font-display font-bold text-lg">{ativos.length}</span>
                        </div>
                        <div>
                            <p className="text-xs text-surface-500">Técnicos ativos</p>
                            <p className="text-sm font-medium text-surface-800">disponíveis para registro</p>
                        </div>
                    </div>
                    <div className="card p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-surface-100 rounded-xl flex items-center justify-center">
                            <span className="text-surface-500 font-display font-bold text-lg">{inativos.length}</span>
                        </div>
                        <div>
                            <p className="text-xs text-surface-500">Técnicos inativos</p>
                            <p className="text-sm font-medium text-surface-800">não aparecem nos selects</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="card">
                    <div className="card-header">
                        <h2 className="font-display font-semibold text-sm text-surface-700">
                            {editId ? 'Editar técnico' : 'Novo técnico'}
                        </h2>
                        {editId && (
                            <button type="button" onClick={cancelEdit} className="btn-ghost btn-sm gap-1">
                                <X size={13} /> Cancelar
                            </button>
                        )}
                    </div>
                    <div className="card-body">
                        <div className="flex gap-3 items-end">
                            <div className="flex-1">
                                <label className="label">Nome do técnico <span className="text-red-500">*</span></label>
                                <input
                                    {...register('nome')}
                                    placeholder="Ex: João Silva"
                                    className={`input ${errors.nome ? 'input-error' : ''}`}
                                    autoComplete="off"
                                />
                                {errors.nome && <p className="field-error">{errors.nome.message}</p>}
                            </div>
                            <button type="submit" disabled={isSubmitting} className="btn-primary gap-2 mb-[1px]">
                                {isSubmitting
                                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    : editId ? <Save size={15} /> : <Plus size={15} />}
                                {editId ? 'Salvar' : 'Adicionar'}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Lista */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="font-display font-semibold text-sm text-surface-700">
                            Técnicos cadastrados ({tecnicos.length})
                        </h2>
                    </div>
                    {loading ? (
                        <div className="py-12 flex justify-center">
                            <div className="w-7 h-7 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
                        </div>
                    ) : tecnicos.length === 0 ? (
                        <div className="py-12 text-center text-surface-400">
                            <Users size={32} className="mx-auto mb-2 opacity-30" />
                            <p className="text-sm">Nenhum técnico cadastrado ainda</p>
                        </div>
                    ) : (
                        <div className="table-wrap">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Nome</th>
                                        <th>Status</th>
                                        <th className="text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tecnicos.map((t) => (
                                        <tr key={t.id} className={!t.ativo ? 'opacity-50' : ''}>
                                            <td className="font-medium">{t.nome}</td>
                                            <td>
                                                <button
                                                    onClick={() => toggleAtivo(t)}
                                                    title={t.ativo ? 'Clique para inativar' : 'Clique para ativar'}
                                                    className={`badge cursor-pointer transition-opacity hover:opacity-80 ${t.ativo ? 'badge-green' : 'badge-gray'}`}
                                                >
                                                    {t.ativo ? 'Ativo' : 'Inativo'}
                                                </button>
                                            </td>
                                            <td>
                                                <div className="flex gap-1 justify-end">
                                                    <button onClick={() => startEdit(t)} className="btn-ghost btn-sm p-1.5 rounded-lg" title="Editar">
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button onClick={() => setDelId(t.id)} className="btn-ghost btn-sm p-1.5 rounded-lg text-red-500 hover:bg-red-50" title="Excluir">
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