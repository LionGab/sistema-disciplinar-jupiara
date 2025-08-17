import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Tipos para exportação
interface AlunoExport {
  matricula: string;
  nome: string;
  turma: string;
  dataNascimento: string;
  telefoneResponsavel: string;
  emailResponsavel: string;
  endereco: string;
  totalOcorrencias: number;
  totalFaltas: number;
  faltasNaoJustificadas: number;
  indiceDisciplinar: number;
  classificacao: string;
  status: string;
}

interface OcorrenciaExport {
  data: string;
  hora: string;
  aluno: string;
  matricula: string;
  turma: string;
  tipo: string;
  gravidade: string;
  pontos: number;
  descricao: string;
  medidasTomadas: string;
  responsavel: string;
  status: string;
}

interface FaltaExport {
  data: string;
  aluno: string;
  matricula: string;
  turma: string;
  justificada: string;
  motivo: string;
  documento: string;
}

// Função principal de exportação de alunos
export const exportarAlunosExcel = (dados: any[], incluirMetricas: boolean = true) => {
  try {
    // Processar dados dos alunos
    const alunosProcessados: AlunoExport[] = dados.map((aluno) => ({
      matricula: aluno.matricula || '',
      nome: aluno.nome || '',
      turma: aluno.turma_nome || '',
      dataNascimento: aluno.data_nascimento ? new Date(aluno.data_nascimento).toLocaleDateString('pt-BR') : '',
      telefoneResponsavel: aluno.telefone_responsavel || '',
      emailResponsavel: aluno.email_responsavel || '',
      endereco: aluno.endereco || '',
      totalOcorrencias: aluno.total_ocorrencias || 0,
      totalFaltas: aluno.total_faltas || 0,
      faltasNaoJustificadas: aluno.faltas_nao_justificadas || 0,
      indiceDisciplinar: aluno.indice_disciplinar || 0,
      classificacao: getClassificacaoTexto(aluno.indice_disciplinar || 0),
      status: aluno.ativo ? 'Ativo' : 'Inativo'
    }));

    // Criar workbook
    const workbook = XLSX.utils.book_new();

    // Aba principal - Lista de Alunos
    const worksheet = XLSX.utils.json_to_sheet(alunosProcessados, {
      header: [
        'matricula', 'nome', 'turma', 'dataNascimento', 'telefoneResponsavel', 
        'emailResponsavel', 'endereco', 'totalOcorrencias', 'totalFaltas', 
        'faltasNaoJustificadas', 'indiceDisciplinar', 'classificacao', 'status'
      ]
    });

    // Definir cabeçalhos em português
    const headers = {
      A1: { v: 'Matrícula' },
      B1: { v: 'Nome Completo' },
      C1: { v: 'Turma' },
      D1: { v: 'Data de Nascimento' },
      E1: { v: 'Telefone Responsável' },
      F1: { v: 'Email Responsável' },
      G1: { v: 'Endereço' },
      H1: { v: 'Total Ocorrências' },
      I1: { v: 'Total Faltas' },
      J1: { v: 'Faltas Não Justificadas' },
      K1: { v: 'Índice Disciplinar' },
      L1: { v: 'Classificação' },
      M1: { v: 'Status' }
    };

    Object.keys(headers).forEach(key => {
      if (worksheet[key]) {
        worksheet[key].v = (headers as any)[key].v;
      }
    });

    // Ajustar largura das colunas
    const colWidths = [
      { wch: 12 }, // Matrícula
      { wch: 25 }, // Nome
      { wch: 10 }, // Turma
      { wch: 15 }, // Data Nascimento
      { wch: 18 }, // Telefone
      { wch: 25 }, // Email
      { wch: 30 }, // Endereço
      { wch: 12 }, // Ocorrências
      { wch: 12 }, // Faltas
      { wch: 15 }, // Faltas N/J
      { wch: 15 }, // Índice
      { wch: 15 }, // Classificação
      { wch: 10 }  // Status
    ];
    worksheet['!cols'] = colWidths;

    // Adicionar formatação condicional para classificação
    if (incluirMetricas) {
      adicionarFormatacaoCondicional(worksheet, alunosProcessados.length);
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista de Alunos');

    // Aba de resumo por turma
    if (incluirMetricas) {
      const resumoPorTurma = gerarResumoPorTurma(alunosProcessados);
      const worksheetResumo = XLSX.utils.json_to_sheet(resumoPorTurma);
      XLSX.utils.book_append_sheet(workbook, worksheetResumo, 'Resumo por Turma');
    }

    // Gerar arquivo
    const nomeArquivo = `alunos_escola_jupiara_${new Date().toISOString().split('T')[0]}.xlsx`;
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    
    saveAs(blob, nomeArquivo);
    
    return { success: true, filename: nomeArquivo };
  } catch (error) {
    console.error('Erro ao exportar alunos:', error);
    return { success: false, error: error };
  }
};

// Exportação de ocorrências
export const exportarOcorrenciasExcel = (dados: any[]) => {
  try {
    const ocorrenciasProcessadas: OcorrenciaExport[] = dados.map((ocorrencia) => ({
      data: new Date(ocorrencia.data_ocorrencia).toLocaleDateString('pt-BR'),
      hora: ocorrencia.hora_ocorrencia || '',
      aluno: ocorrencia.aluno_nome || '',
      matricula: ocorrencia.matricula || '',
      turma: ocorrencia.turma_nome || '',
      tipo: ocorrencia.tipo_nome || '',
      gravidade: ocorrencia.gravidade || '',
      pontos: ocorrencia.pontos || 0,
      descricao: ocorrencia.descricao || '',
      medidasTomadas: ocorrencia.medidas_tomadas || '',
      responsavel: ocorrencia.responsavel_registro || '',
      status: ocorrencia.status || ''
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(ocorrenciasProcessadas);
    
    // Ajustar largura das colunas
    worksheet['!cols'] = [
      { wch: 12 }, { wch: 8 }, { wch: 25 }, { wch: 12 }, { wch: 10 },
      { wch: 20 }, { wch: 12 }, { wch: 8 }, { wch: 40 }, { wch: 30 },
      { wch: 20 }, { wch: 12 }
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ocorrências');

    const nomeArquivo = `ocorrencias_${new Date().toISOString().split('T')[0]}.xlsx`;
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    
    saveAs(blob, nomeArquivo);
    
    return { success: true, filename: nomeArquivo };
  } catch (error) {
    console.error('Erro ao exportar ocorrências:', error);
    return { success: false, error: error };
  }
};

// Exportação de faltas
export const exportarFaltasExcel = (dados: any[]) => {
  try {
    const faltasProcessadas: FaltaExport[] = dados.map((falta) => ({
      data: new Date(falta.data_falta).toLocaleDateString('pt-BR'),
      aluno: falta.aluno_nome || '',
      matricula: falta.matricula || '',
      turma: falta.turma_nome || '',
      justificada: falta.justificada ? 'Sim' : 'Não',
      motivo: falta.motivo || '',
      documento: falta.documento_justificativa || ''
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(faltasProcessadas);
    
    worksheet['!cols'] = [
      { wch: 12 }, { wch: 25 }, { wch: 12 }, { wch: 10 },
      { wch: 12 }, { wch: 30 }, { wch: 25 }
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Faltas');

    const nomeArquivo = `faltas_${new Date().toISOString().split('T')[0]}.xlsx`;
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    
    saveAs(blob, nomeArquivo);
    
    return { success: true, filename: nomeArquivo };
  } catch (error) {
    console.error('Erro ao exportar faltas:', error);
    return { success: false, error: error };
  }
};

// Exportação de relatório completo
export const exportarRelatorioCompleto = async (alunosData: any[], ocorrenciasData: any[], faltasData: any[]) => {
  try {
    const workbook = XLSX.utils.book_new();

    // Aba 1: Alunos
    const alunosProcessados = alunosData.map((aluno) => ({
      matricula: aluno.matricula || '',
      nome: aluno.nome || '',
      turma: aluno.turma_nome || '',
      dataNascimento: aluno.data_nascimento ? new Date(aluno.data_nascimento).toLocaleDateString('pt-BR') : '',
      telefoneResponsavel: aluno.telefone_responsavel || '',
      emailResponsavel: aluno.email_responsavel || '',
      totalOcorrencias: aluno.total_ocorrencias || 0,
      totalFaltas: aluno.total_faltas || 0,
      indiceDisciplinar: aluno.indice_disciplinar || 0,
      classificacao: getClassificacaoTexto(aluno.indice_disciplinar || 0)
    }));

    const wsAlunos = XLSX.utils.json_to_sheet(alunosProcessados);
    XLSX.utils.book_append_sheet(workbook, wsAlunos, 'Alunos');

    // Aba 2: Ocorrências
    const ocorrenciasProcessadas = ocorrenciasData.map((ocorrencia) => ({
      data: new Date(ocorrencia.data_ocorrencia).toLocaleDateString('pt-BR'),
      aluno: ocorrencia.aluno_nome || '',
      turma: ocorrencia.turma_nome || '',
      tipo: ocorrencia.tipo_nome || '',
      gravidade: ocorrencia.gravidade || '',
      pontos: ocorrencia.pontos || 0,
      descricao: ocorrencia.descricao || '',
      responsavel: ocorrencia.responsavel_registro || ''
    }));

    const wsOcorrencias = XLSX.utils.json_to_sheet(ocorrenciasProcessadas);
    XLSX.utils.book_append_sheet(workbook, wsOcorrencias, 'Ocorrências');

    // Aba 3: Faltas
    const faltasProcessadas = faltasData.map((falta) => ({
      data: new Date(falta.data_falta).toLocaleDateString('pt-BR'),
      aluno: falta.aluno_nome || '',
      turma: falta.turma_nome || '',
      justificada: falta.justificada ? 'Sim' : 'Não',
      motivo: falta.motivo || ''
    }));

    const wsFaltas = XLSX.utils.json_to_sheet(faltasProcessadas);
    XLSX.utils.book_append_sheet(workbook, wsFaltas, 'Faltas');

    // Aba 4: Resumo Geral
    const resumoGeral = [
      { Indicador: 'Total de Alunos', Valor: alunosData.length },
      { Indicador: 'Total de Ocorrências', Valor: ocorrenciasData.length },
      { Indicador: 'Total de Faltas', Valor: faltasData.length },
      { Indicador: 'Alunos Exemplares', Valor: alunosProcessados.filter(a => a.classificacao === 'Exemplar').length },
      { Indicador: 'Alunos em Atenção', Valor: alunosProcessados.filter(a => a.classificacao === 'Atenção').length },
      { Indicador: 'Alunos Críticos', Valor: alunosProcessados.filter(a => a.classificacao === 'Crítico').length }
    ];

    const wsResumo = XLSX.utils.json_to_sheet(resumoGeral);
    XLSX.utils.book_append_sheet(workbook, wsResumo, 'Resumo Geral');

    const nomeArquivo = `relatorio_completo_escola_jupiara_${new Date().toISOString().split('T')[0]}.xlsx`;
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    
    saveAs(blob, nomeArquivo);
    
    return { success: true, filename: nomeArquivo };
  } catch (error) {
    console.error('Erro ao exportar relatório completo:', error);
    return { success: false, error: error };
  }
};

// Funções auxiliares
const getClassificacaoTexto = (indice: number): string => {
  if (indice === 0) return 'Exemplar';
  if (indice <= 1.0) return 'Bom';
  if (indice <= 2.0) return 'Atenção';
  return 'Crítico';
};

const gerarResumoPorTurma = (alunos: AlunoExport[]) => {
  const turmas = [...new Set(alunos.map(a => a.turma))];
  
  return turmas.map(turma => {
    const alunosTurma = alunos.filter(a => a.turma === turma);
    const totalOcorrencias = alunosTurma.reduce((sum, a) => sum + a.totalOcorrencias, 0);
    const totalFaltas = alunosTurma.reduce((sum, a) => sum + a.totalFaltas, 0);
    const indiceMedia = alunosTurma.reduce((sum, a) => sum + a.indiceDisciplinar, 0) / alunosTurma.length;
    
    return {
      turma: turma,
      totalAlunos: alunosTurma.length,
      totalOcorrencias: totalOcorrencias,
      totalFaltas: totalFaltas,
      indiceDisisciplinarMedio: Number(indiceMedia.toFixed(2)),
      alunosExemplares: alunosTurma.filter(a => a.classificacao === 'Exemplar').length,
      alunosAtencao: alunosTurma.filter(a => a.classificacao === 'Atenção').length,
      alunosCriticos: alunosTurma.filter(a => a.classificacao === 'Crítico').length
    };
  });
};

const adicionarFormatacaoCondicional = (worksheet: any, numRows: number) => {
  // Adicionar cores de fundo baseadas na classificação
  for (let i = 2; i <= numRows + 1; i++) {
    const cellClassificacao = `L${i}`;
    if (worksheet[cellClassificacao]) {
      const valor = worksheet[cellClassificacao].v;
      let cor = '';
      
      switch (valor) {
        case 'Exemplar':
          cor = '92D050'; // Verde
          break;
        case 'Bom':
          cor = 'FFC000'; // Amarelo
          break;
        case 'Atenção':
          cor = 'FF9900'; // Laranja
          break;
        case 'Crítico':
          cor = 'FF0000'; // Vermelho
          break;
      }
      
      if (cor) {
        worksheet[cellClassificacao].s = {
          fill: { fgColor: { rgb: cor } },
          font: { bold: true }
        };
      }
    }
  }
};