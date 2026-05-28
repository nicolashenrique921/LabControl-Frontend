import { useEffect, useState, useCallback } from 'react'
import { Search, Download, Trash2, Pencil, BarChart2, X, FileText, Sheet } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import api from '../api/client'
import { useToast } from '../hooks/UseToast'
import ToastContainer from '../components/ui/Toastcontainer'
import ConfirmDialog from '../components/ui/Confirmdialog'
import EditarDevolucaoModal from '../components/ui/Editardevolucaomodal'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Devolucao {
  id: number; mac: string; os: string; descricao: string
  data_devolucao: string; tecnico_nome: string; marca: string; tipo: string
  tecnico_id: number; equipamento_id: number
}
interface Resumo {
  porTecnico: { tecnico: string; total: string }[]
  porTipo:    { tipo:    string; total: string }[]
  porMarca:   { marca:   string; total: string }[]
  porMes:     { mes:     string; total: string }[]
}
interface Filters {
  tecnico: string; marca: string; tipo: string
  data_inicio: string; data_fim: string
}

const COLORS = ['#3366ff','#22c55e','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899']

export default function ConsultaDevolucoes() {
  const [devolucoes,   setDevolucoes]   = useState<Devolucao[]>([])
  const [resumo,       setResumo]       = useState<Resumo | null>(null)
  const [marcas,       setMarcas]       = useState<string[]>([])
  const [tipos,        setTipos]        = useState<string[]>([])
  const [total,        setTotal]        = useState(0)
  const [page,         setPage]         = useState(1)
  const [totalPages,   setTotalPages]   = useState(1)
  const [loading,      setLoading]      = useState(false)
  const [showCharts,   setShowCharts]   = useState(false)
  const [delId,        setDelId]        = useState<number | null>(null)
  const [delLoading,   setDelLoading]   = useState(false)
  const [editItem,     setEditItem]     = useState<Devolucao | null>(null)
  const { toasts, success, error } = useToast()

  const [filters, setFilters] = useState<Filters>({
    tecnico: '', marca: '', tipo: '', data_inicio: '', data_fim: '',
  })

  // Carrega marcas/tipos para selects
  useEffect(() => {
    api.get('/equipamentos/marcas').then((r) => setMarcas(r.data.marcas))
    api.get('/equipamentos/tipos').then((r)  => setTipos(r.data.tipos))
  }, [])

  const buildParams = useCallback((pg = page) => {
    const p: Record<string, string> = { page: String(pg), limit: '20' }
    if (filters.tecnico)     p.tecnico     = filters.tecnico
    if (filters.marca)       p.marca       = filters.marca
    if (filters.tipo)        p.tipo        = filters.tipo
    if (filters.data_inicio) p.data_inicio = filters.data_inicio
    if (filters.data_fim)    p.data_fim    = filters.data_fim
    return p
  }, [filters, page])

  const buscar = useCallback(async (pg = 1) => {
    setLoading(true)
    try {
      const params = buildParams(pg)
      const [devRes, resRes] = await Promise.all([
        api.get('/devolucoes',        { params }),
        api.get('/devolucoes/resumo', { params }),
      ])
      setDevolucoes(devRes.data.devolucoes)
      setTotal(devRes.data.paginacao.total)
      setTotalPages(devRes.data.paginacao.totalPages)
      setPage(pg)
      setResumo(resRes.data)
    } catch {
      error('Erro ao buscar devoluções')
    } finally {
      setLoading(false)
    }
  }, [buildParams, error])

  useEffect(() => { buscar(1) }, []) // busca inicial

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); buscar(1) }

  const clearFilters = () => {
    setFilters({ tecnico: '', marca: '', tipo: '', data_inicio: '', data_fim: '' })
    setTimeout(() => buscar(1), 0)
  }

  // ── Delete ─────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!delId) return
    setDelLoading(true)
    try {
      await api.delete(`/devolucoes/${delId}`)
      success('Devolução excluída com sucesso')
      setDelId(null)
      buscar(page)
    } catch {
      error('Erro ao excluir devolução')
    } finally {
      setDelLoading(false)
    }
  }

  // ── Export Excel ───────────────────────────────────────────
  const exportExcel = () => {
    const rows = devolucoes.map((d) => ({
      'Data':        format(new Date(d.data_devolucao), 'dd/MM/yyyy'),
      'Técnico':     d.tecnico_nome,
      'Marca':       d.marca,
      'Tipo':        d.tipo,
      'MAC':         d.mac || '',
      'OS':          d.os  || '',
      'Descrição':   d.descricao || '',
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Devoluções')
    XLSX.writeFile(wb, `labcontrol-devolucoes-${Date.now()}.xlsx`)
  }

  // ── Export PDF ─────────────────────────────────────────────
  const exportPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(14)
    doc.text('Lab Control — Devoluções', 14, 16)
    doc.setFontSize(9)
    doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}`, 14, 22)
    autoTable(doc, {
      startY: 28,
      head: [['Data', 'Técnico', 'Marca', 'Tipo', 'MAC', 'OS', 'Descrição']],
      body: devolucoes.map((d) => [
        format(new Date(d.data_devolucao), 'dd/MM/yyyy'),
        d.tecnico_nome, d.marca, d.tipo,
        d.mac || '', d.os || '', d.descricao || '',
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [51, 102, 255] },
    })
    doc.save(`labcontrol-devolucoes-${Date.now()}.pdf`)
  }

  const fmtData = (s: string) => {
    try { return format(new Date(s + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR }) }
    catch { return s }
  }

  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <>
      <ToastContainer toasts={toasts} />
      <ConfirmDialog
        open={!!delId}
        title="Excluir devolução"
        message="Esta ação não pode ser desfeita. Deseja excluir este registro?"
        onConfirm={handleDelete}
        onCancel={() => setDelId(null)}
        loading={delLoading}
      />
      {editItem && (
        <EditarDevolucaoModal
          devolucao={editItem}
          onClose={() => setEditItem(null)}
          onSaved={() => { setEditItem(null); buscar(page) }}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="page-title">Consulta de Devoluções</h1>
            <p className="page-subtitle">{total} registro{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowCharts(!showCharts)} className="btn-secondary btn-sm gap-1.5">
              <BarChart2 size={14} />
              {showCharts ? 'Ocultar' : 'Gráficos'}
            </button>
            <button onClick={exportExcel} className="btn-secondary btn-sm gap-1.5">
              <Sheet size={14} /> Excel
            </button>
            <button onClick={exportPDF} className="btn-secondary btn-sm gap-1.5">
              <FileText size={14} /> PDF
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="label">Técnico</label>
                  <input
                    value={filters.tecnico}
                    onChange={(e) => setFilters({ ...filters, tecnico: e.target.value })}
                    placeholder="Buscar por nome..."
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Marca</label>
                  <select aria-label="Filtrar por marca" value={filters.marca} onChange={(e) => setFilters({ ...filters, marca: e.target.value })} className="input">
                    <option value="">Todas as marcas</option>
                    {marcas.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Tipo</label>
                  <select aria-label="Filtrar por tipo" value={filters.tipo} onChange={(e) => setFilters({ ...filters, tipo: e.target.value })} className="input">
                    <option value="">Todos os tipos</option>
                    {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Data início</label>
                  <input
                    aria-label="Data início"
                    type="date"
                    value={filters.data_inicio}
                    onChange={(e) => setFilters({ ...filters, data_inicio: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Data fim</label>
                  <input
                    aria-label="Data fim"
                    type="date"
                    value={filters.data_fim}
                    onChange={(e) => setFilters({ ...filters, data_fim: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary gap-2">
                  <Search size={15} /> Buscar
                </button>
                {hasFilters && (
                  <button type="button" onClick={clearFilters} className="btn-ghost gap-1.5">
                    <X size={14} /> Limpar filtros
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Gráficos */}
        {showCharts && resumo && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-slide-up">
            <ChartCard title="Por técnico" data={resumo.porTecnico.map((d) => ({ name: d.tecnico, total: Number(d.total) }))} />
            <ChartCard title="Por tipo"    data={resumo.porTipo.map((d)    => ({ name: d.tipo,    total: Number(d.total) }))} />
            <ChartCard title="Por marca"   data={resumo.porMarca.map((d)   => ({ name: d.marca,   total: Number(d.total) }))} />
            <ChartCard title="Por mês"     data={resumo.porMes.map((d)     => ({ name: d.mes,     total: Number(d.total) }))} />
          </div>
        )}

        {/* Tabela */}
        <div className="card">
          {loading ? (
            <div className="py-16 flex justify-center">
              <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
            </div>
          ) : devolucoes.length === 0 ? (
            <div className="py-16 text-center text-surface-400">
              <Download size={36} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">Nenhuma devolução encontrada</p>
              <p className="text-xs mt-1">Ajuste os filtros ou registre uma nova devolução</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Técnico</th>
                    <th>Equipamento</th>
                    <th>MAC</th>
                    <th>OS</th>
                    <th>Descrição</th>
                    <th className="text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {devolucoes.map((d) => (
                    <tr key={d.id}>
                      <td className="whitespace-nowrap font-medium">{fmtData(d.data_devolucao)}</td>
                      <td>{d.tecnico_nome}</td>
                      <td>
                        <span className="badge-blue mr-1">{d.tipo}</span>
                        <span className="text-surface-500 text-xs">{d.marca}</span>
                      </td>
                      <td className="font-mono text-xs">{d.mac || <span className="text-surface-300">—</span>}</td>
                      <td className="font-mono text-xs">{d.os  || <span className="text-surface-300">—</span>}</td>
                      <td className="max-w-xs truncate text-surface-500 text-xs">{d.descricao || <span className="text-surface-300">—</span>}</td>
                      <td>
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => setEditItem(d)} className="btn-ghost btn-sm p-1.5 rounded-lg" title="Editar">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => setDelId(d.id)} className="btn-ghost btn-sm p-1.5 rounded-lg text-red-500 hover:bg-red-50" title="Excluir">
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

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-surface-100 flex items-center justify-between">
              <p className="text-xs text-surface-500">Página {page} de {totalPages}</p>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => buscar(page - 1)} className="btn-secondary btn-sm">Anterior</button>
                <button disabled={page >= totalPages} onClick={() => buscar(page + 1)} className="btn-secondary btn-sm">Próxima</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ── Chart Card ──────────────────────────────────────────────
function ChartCard({ title, data }: { title: string; data: { name: string; total: number }[] }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="font-display font-semibold text-sm text-surface-700">{title}</h3>
      </div>
      <div className="p-4 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
              formatter={(v: number) => [v, 'Devoluções']}
            />
            <Bar dataKey="total" radius={[6, 6, 0, 0]}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}