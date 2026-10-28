export interface Usuario {
  id: number;
  username: string;
  perfil: 'admin' | 'usuario';
}

export interface Tecnico {
  id: number;
  nome: string;
}

export interface Equipamento {
  id: number;
  marca: string;
  tipo: string;
}

export interface Devolucao {
  id: number;
  mac: string | null;
  os: string | null;
  tecnico_id: number | null;
  tecnico_nome: string;
  equipamento_id: number | null;
  equipamento_marca: string;
  equipamento_tipo: string;
  data_devolucao: string;
  descricao: string | null;
  criado_em: string;
}

export interface UsuarioAdmin {
  id: number;
  username: string;
  perfil: 'admin' | 'usuario';
  criado_em: string;
}

export type AvaliacaoTeste = 'confirmado' | 'nao_confirmado' | 'inconclusivo';

export interface DevolucaoSemTeste {
  id: number;
  tecnico_nome: string;
  equipamento_marca: string;
  equipamento_tipo: string;
  descricao: string | null;
  mac: string | null;
  os: string | null;
  data_devolucao: string;
}

export interface Teste {
  id: number;
  devolucao_id: number | null;
  tecnico_nome: string;
  equipamento_marca: string;
  equipamento_tipo: string;
  descricao_defeito: string | null;
  mac: string | null;
  os: string | null;
  data_devolucao: string;
  data_teste: string;
  avaliacao: AvaliacaoTeste;
  observacao: string | null;
  criado_em: string;
}

export interface NotaResumo {
  id: number;
  titulo: string;
  fixada: boolean;
  ordem: number;
  atualizado_em: string;
}

export interface Nota {
  id: number;
  usuario_id: number;
  titulo: string;
  conteudo: string;
  criado_em: string;
  atualizado_em: string;
}
