import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';

// Estender o tipo jsPDF para incluir autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

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

// ===== FUNÇÕES DE EXPORTAÇÃO EXCEL =====

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

// ===== FUNÇÕES DE EXPORTAÇÃO PDF =====

export const exportarAlunosPDF = (dados: any[]) => {
  try {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(16);
    doc.text('Escola Cívico Militar Jupiara', 14, 15);
    doc.setFontSize(12);
    doc.text('Relatório de Alunos', 14, 22);
    doc.setFontSize(10);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 28);
    
    // Preparar dados para a tabela
    const tableData = dados.map((aluno) => [
      aluno.matricula || '',
      aluno.nome || '',
      aluno.turma_nome || '',
      aluno.total_ocorrencias || 0,
      aluno.total_faltas || 0,
      getClassificacaoTexto(aluno.indice_disciplinar || 0)
    ]);
    
    // Criar tabela
    doc.autoTable({
      head: [['Matrícula', 'Nome', 'Turma', 'Ocorrências', 'Faltas', 'Classificação']],
      body: tableData,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    // Salvar PDF
    doc.save(`alunos_${new Date().toISOString().split('T')[0]}.pdf`);
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    return { success: false, error };
  }
};

export const exportarOcorrenciasPDF = (dados: any[]) => {
  try {
    const doc = new jsPDF('l'); // Landscape
    
    // Título
    doc.setFontSize(16);
    doc.text('Escola Cívico Militar Jupiara', 14, 15);
    doc.setFontSize(12);
    doc.text('Relatório de Ocorrências Disciplinares', 14, 22);
    doc.setFontSize(10);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 28);
    
    // Preparar dados para a tabela
    const tableData = dados.map((ocorrencia) => [
      new Date(ocorrencia.data_ocorrencia).toLocaleDateString('pt-BR'),
      ocorrencia.aluno_nome || '',
      ocorrencia.turma_nome || '',
      ocorrencia.tipo_nome || '',
      ocorrencia.gravidade || '',
      ocorrencia.pontos || 0,
      (ocorrencia.descricao || '').substring(0, 50) + '...'
    ]);
    
    // Criar tabela
    doc.autoTable({
      head: [['Data', 'Aluno', 'Turma', 'Tipo', 'Gravidade', 'Pontos', 'Descrição']],
      body: tableData,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [192, 57, 43] }
    });
    
    // Salvar PDF
    doc.save(`ocorrencias_${new Date().toISOString().split('T')[0]}.pdf`);
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    return { success: false, error };
  }
};

export const exportarFaltasPDF = (dados: any[]) => {
  try {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(16);
    doc.text('Escola Cívico Militar Jupiara', 14, 15);
    doc.setFontSize(12);
    doc.text('Relatório de Faltas', 14, 22);
    doc.setFontSize(10);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 28);
    
    // Preparar dados para a tabela
    const tableData = dados.map((falta) => [
      new Date(falta.data_falta).toLocaleDateString('pt-BR'),
      falta.aluno_nome || '',
      falta.turma_nome || '',
      falta.justificada ? 'Sim' : 'Não',
      falta.motivo || ''
    ]);
    
    // Criar tabela
    doc.autoTable({
      head: [['Data', 'Aluno', 'Turma', 'Justificada', 'Motivo']],
      body: tableData,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [243, 156, 18] }
    });
    
    // Salvar PDF
    doc.save(`faltas_${new Date().toISOString().split('T')[0]}.pdf`);
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    return { success: false, error };
  }
};

// ===== FUNÇÕES DE EXPORTAÇÃO CSV =====

export const exportarAlunosCSV = (dados: any[]) => {
  try {
    const csvData = dados.map((aluno) => ({
      'Matrícula': aluno.matricula || '',
      'Nome': aluno.nome || '',
      'Turma': aluno.turma_nome || '',
      'Data de Nascimento': aluno.data_nascimento ? new Date(aluno.data_nascimento).toLocaleDateString('pt-BR') : '',
      'Telefone Responsável': aluno.telefone_responsavel || '',
      'Email Responsável': aluno.email_responsavel || '',
      'Total Ocorrências': aluno.total_ocorrencias || 0,
      'Total Faltas': aluno.total_faltas || 0,
      'Índice Disciplinar': aluno.indice_disciplinar || 0,
      'Classificação': getClassificacaoTexto(aluno.indice_disciplinar || 0)
    }));
    
    const csv = Papa.unparse(csvData);
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `alunos_${new Date().toISOString().split('T')[0]}.csv`);
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao exportar CSV:', error);
    return { success: false, error };
  }
};

export const exportarOcorrenciasCSV = (dados: any[]) => {
  try {
    const csvData = dados.map((ocorrencia) => ({
      'Data': new Date(ocorrencia.data_ocorrencia).toLocaleDateString('pt-BR'),
      'Hora': ocorrencia.hora_ocorrencia || '',
      'Aluno': ocorrencia.aluno_nome || '',
      'Matrícula': ocorrencia.matricula || '',
      'Turma': ocorrencia.turma_nome || '',
      'Tipo': ocorrencia.tipo_nome || '',
      'Gravidade': ocorrencia.gravidade || '',
      'Pontos': ocorrencia.pontos || 0,
      'Descrição': ocorrencia.descricao || '',
      'Medidas Tomadas': ocorrencia.medidas_tomadas || '',
      'Responsável': ocorrencia.responsavel_registro || ''
    }));
    
    const csv = Papa.unparse(csvData);
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `ocorrencias_${new Date().toISOString().split('T')[0]}.csv`);
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao exportar CSV:', error);
    return { success: false, error };
  }
};

export const exportarFaltasCSV = (dados: any[]) => {
  try {
    const csvData = dados.map((falta) => ({
      'Data': new Date(falta.data_falta).toLocaleDateString('pt-BR'),
      'Aluno': falta.aluno_nome || '',
      'Matrícula': falta.matricula || '',
      'Turma': falta.turma_nome || '',
      'Justificada': falta.justificada ? 'Sim' : 'Não',
      'Motivo': falta.motivo || '',
      'Documento': falta.documento_justificativa || ''
    }));
    
    const csv = Papa.unparse(csvData);
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `faltas_${new Date().toISOString().split('T')[0]}.csv`);
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao exportar CSV:', error);
    return { success: false, error };
  }
};

// ===== FUNÇÃO DE EXPORTAÇÃO COMPLETA (EXCEL) =====

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

// ===== FUNÇÕES AUXILIARES =====

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