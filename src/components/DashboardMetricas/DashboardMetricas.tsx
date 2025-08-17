import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import { metricasAPI, turmasAPI } from '../../api/api';

interface MetricaGeral {
  total_alunos: number;
  total_ocorrencias: number;
  total_faltas: number;
  ocorrencias_ultimo_mes: number;
  faltas_ultimo_mes: number;
}

interface MetricaTurma {
  turma_id: number;
  turma_nome: string;
  ano: string;
  turno: string;
  total_alunos: number;
  total_ocorrencias: number;
  total_faltas: number;
  faltas_nao_justificadas: number;
  media_pontos_ocorrencia: number;
  ocorrencias_graves: number;
  ocorrencias_medias: number;
  ocorrencias_leves: number;
}

interface MetricaTurmaDetalhada {
  metricas: MetricaTurma;
  alunosComMaisOcorrencias: Array<{
    id: number;
    nome: string;
    matricula: string;
    total_ocorrencias: number;
    pontos_totais: number;
  }>;
  ocorrenciasPorTipo: Array<{
    tipo: string;
    gravidade: string;
    quantidade: number;
  }>;
}

const DashboardMetricas: React.FC = () => {
  const [metricasGerais, setMetricasGerais] = useState<MetricaGeral | null>(null);
  const [metricasTurmas, setMetricasTurmas] = useState<MetricaTurma[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState<number | ''>('');
  const [metricaTurmaDetalhada, setMetricaTurmaDetalhada] = useState<MetricaTurmaDetalhada | null>(null);
  const [evolucaoMensal, setEvolucaoMensal] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (turmaSelecionada) {
      carregarMetricasTurma(turmaSelecionada);
    }
  }, [turmaSelecionada]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [geraisRes, turmasRes, turmasListaRes, evolucaoRes] = await Promise.all([
        metricasAPI.geral(),
        metricasAPI.porTurma(),
        turmasAPI.listar(),
        metricasAPI.evolucaoMensal(),
      ]);
      
      setMetricasGerais(geraisRes.data);
      setMetricasTurmas(turmasRes.data);
      setTurmas(turmasListaRes.data);
      setEvolucaoMensal(evolucaoRes.data);
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarMetricasTurma = async (turmaId: number) => {
    try {
      const response = await metricasAPI.turma(turmaId);
      setMetricaTurmaDetalhada(response.data);
    } catch (error) {
      console.error('Erro ao carregar métricas da turma:', error);
    }
  };

  const formatarMes = (mesStr: string) => {
    const [ano, mes] = mesStr.split('-');
    const meses = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    return `${meses[parseInt(mes) - 1]}/${ano.slice(-2)}`;
  };

  const dadosGraficoTurmas = metricasTurmas.map(turma => ({
    turma: turma.turma_nome,
    ocorrencias: turma.total_ocorrencias,
    faltas: turma.total_faltas,
    alunos: turma.total_alunos,
    'Faltas N.J.': turma.faltas_nao_justificadas,
  }));

  const dadosGravidade = metricasTurmas.reduce((acc, turma) => {
    acc.leves += turma.ocorrencias_leves;
    acc.medias += turma.ocorrencias_medias;
    acc.graves += turma.ocorrencias_graves;
    return acc;
  }, { leves: 0, medias: 0, graves: 0 });

  const dadosPieGravidade = [
    { name: 'Leves', value: dadosGravidade.leves, color: '#82ca9d' },
    { name: 'Médias', value: dadosGravidade.medias, color: '#ffc658' },
    { name: 'Graves', value: dadosGravidade.graves, color: '#ff7300' },
  ].filter(item => item.value > 0);

  const dadosEvolucao = evolucaoMensal.map(item => ({
    mes: formatarMes(item.mes),
    ocorrencias: parseInt(item.ocorrencias),
    faltas: parseInt(item.faltas),
  }));

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard de Métricas - Escola Cívico Militar Jupiara
      </Typography>

      {/* Métricas Gerais */}
      {metricasGerais && (
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent style={{ textAlign: 'center' }}>
                <Typography color="textSecondary" gutterBottom>
                  Total de Alunos
                </Typography>
                <Typography variant="h4" component="h2" color="primary">
                  {metricasGerais.total_alunos}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent style={{ textAlign: 'center' }}>
                <Typography color="textSecondary" gutterBottom>
                  Ocorrências Total
                </Typography>
                <Typography variant="h4" component="h2" color="warning.main">
                  {metricasGerais.total_ocorrencias}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent style={{ textAlign: 'center' }}>
                <Typography color="textSecondary" gutterBottom>
                  Faltas Total
                </Typography>
                <Typography variant="h4" component="h2" color="error.main">
                  {metricasGerais.total_faltas}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent style={{ textAlign: 'center' }}>
                <Typography color="textSecondary" gutterBottom>
                  Ocorrências (30d)
                </Typography>
                <Typography variant="h4" component="h2" color="info.main">
                  {metricasGerais.ocorrencias_ultimo_mes}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent style={{ textAlign: 'center' }}>
                <Typography color="textSecondary" gutterBottom>
                  Faltas (30d)
                </Typography>
                <Typography variant="h4" component="h2" color="secondary.main">
                  {metricasGerais.faltas_ultimo_mes}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Grid container spacing={3}>
        {/* Gráfico de Barras por Turma */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Métricas por Turma
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosGraficoTurmas}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="turma" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="ocorrencias" fill="#ffc658" name="Ocorrências" />
                  <Bar dataKey="faltas" fill="#ff7300" name="Faltas" />
                  <Bar dataKey="Faltas N.J." fill="#d32f2f" name="Faltas Não Just." />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de Pizza - Gravidade das Ocorrências */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ocorrências por Gravidade
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosPieGravidade}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dadosPieGravidade.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Evolução Mensal */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Evolução Mensal - Últimos 12 Meses
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dadosEvolucao}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="ocorrencias"
                    stackId="1"
                    stroke="#ffc658"
                    fill="#ffc658"
                    name="Ocorrências"
                  />
                  <Area
                    type="monotone"
                    dataKey="faltas"
                    stackId="1"
                    stroke="#ff7300"
                    fill="#ff7300"
                    name="Faltas"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Seletor de Turma para Análise Detalhada */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Análise Detalhada por Turma
              </Typography>
              
              <FormControl variant="outlined" size="small" style={{ minWidth: 200, marginBottom: 16 }}>
                <InputLabel>Selecionar Turma</InputLabel>
                <Select
                  value={turmaSelecionada}
                  onChange={(e) => setTurmaSelecionada(e.target.value as number)}
                  label="Selecionar Turma"
                >
                  <MenuItem value="">
                    <em>Selecione uma turma</em>
                  </MenuItem>
                  {turmas.map((turma) => (
                    <MenuItem key={turma.id} value={turma.id}>
                      {turma.nome} - {turma.turno}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {metricaTurmaDetalhada && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Top 5 Alunos com Mais Ocorrências
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Aluno</TableCell>
                            <TableCell align="center">Ocorrências</TableCell>
                            <TableCell align="center">Pontos</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {metricaTurmaDetalhada.alunosComMaisOcorrencias.map((aluno) => (
                            <TableRow key={aluno.id}>
                              <TableCell>
                                {aluno.nome}
                                <br />
                                <small>{aluno.matricula}</small>
                              </TableCell>
                              <TableCell align="center">
                                <Chip 
                                  label={aluno.total_ocorrencias} 
                                  size="small" 
                                  color={aluno.total_ocorrencias > 3 ? 'error' : 'warning'}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Chip 
                                  label={aluno.pontos_totais} 
                                  size="small"
                                  color={aluno.pontos_totais > 10 ? 'error' : aluno.pontos_totais > 5 ? 'warning' : 'success'}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Ocorrências por Tipo
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Tipo</TableCell>
                            <TableCell>Gravidade</TableCell>
                            <TableCell align="center">Quantidade</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {metricaTurmaDetalhada.ocorrenciasPorTipo.map((ocorrencia, index) => (
                            <TableRow key={index}>
                              <TableCell>{ocorrencia.tipo}</TableCell>
                              <TableCell>
                                <Chip
                                  label={ocorrencia.gravidade}
                                  size="small"
                                  color={
                                    ocorrencia.gravidade === 'grave' ? 'error' :
                                    ocorrencia.gravidade === 'media' ? 'warning' : 'success'
                                  }
                                />
                              </TableCell>
                              <TableCell align="center">
                                {ocorrencia.quantidade}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Tabela Resumo de Turmas */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resumo Geral por Turma
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Turma</TableCell>
                      <TableCell>Turno</TableCell>
                      <TableCell align="center">Alunos</TableCell>
                      <TableCell align="center">Ocorrências</TableCell>
                      <TableCell align="center">Faltas</TableCell>
                      <TableCell align="center">F. Não Just.</TableCell>
                      <TableCell align="center">Média Pontos</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {metricasTurmas.map((turma) => {
                      const taxaOcorrencia = turma.total_alunos > 0 ? 
                        (turma.total_ocorrencias / turma.total_alunos) : 0;
                      const statusColor = 
                        taxaOcorrencia > 2 ? 'error' :
                        taxaOcorrencia > 1 ? 'warning' : 'success';
                      const statusLabel = 
                        taxaOcorrencia > 2 ? 'Crítico' :
                        taxaOcorrencia > 1 ? 'Atenção' : 'Normal';

                      return (
                        <TableRow key={turma.turma_id}>
                          <TableCell>{turma.turma_nome}</TableCell>
                          <TableCell>{turma.turno}</TableCell>
                          <TableCell align="center">{turma.total_alunos}</TableCell>
                          <TableCell align="center">{turma.total_ocorrencias}</TableCell>
                          <TableCell align="center">{turma.total_faltas}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={turma.faltas_nao_justificadas}
                              size="small"
                              color={turma.faltas_nao_justificadas > 10 ? 'error' : 'default'}
                            />
                          </TableCell>
                          <TableCell align="center">
                            {turma.media_pontos_ocorrencia.toFixed(1)}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={statusLabel}
                              size="small"
                              color={statusColor as any}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardMetricas;