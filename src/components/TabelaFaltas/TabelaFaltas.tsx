import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Switch,
  FormControlLabel,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  GetApp as ExportIcon,
} from '@mui/icons-material';
import { faltasAPI, alunosAPI, turmasAPI } from '../../api/api';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface Aluno {
  id: number;
  matricula: string;
  nome: string;
  turma_nome: string;
}

interface Falta {
  id?: number;
  aluno_id: number;
  data_falta: string;
  justificada: boolean;
  motivo?: string;
  documento_justificativa?: string;
  aluno_nome?: string;
  matricula?: string;
  turma_nome?: string;
}

interface ResumoFalta {
  aluno_id: number;
  aluno_nome: string;
  matricula: string;
  total_faltas: number;
  faltas_justificadas: number;
  faltas_nao_justificadas: number;
}

const TabelaFaltas: React.FC = () => {
  const [faltas, setFaltas] = useState<Falta[]>([]);
  const [resumoFaltas, setResumoFaltas] = useState<ResumoFalta[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [editandoFalta, setEditandoFalta] = useState<Falta | null>(null);
  const [loading, setLoading] = useState(false);
  const [filtroTurma, setFiltroTurma] = useState<number | ''>('');
  const [dataInicio, setDataInicio] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [dataFim, setDataFim] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [modoResumo, setModoResumo] = useState(false);

  const [formData, setFormData] = useState<Omit<Falta, 'id'>>({
    aluno_id: 0,
    data_falta: format(new Date(), 'yyyy-MM-dd'),
    justificada: false,
    motivo: '',
    documento_justificativa: '',
  });

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (modoResumo) {
      carregarResumoFaltas();
    } else {
      carregarFaltas();
    }
  }, [filtroTurma, dataInicio, dataFim, modoResumo]);

  const carregarDados = async () => {
    try {
      const [alunosRes, turmasRes] = await Promise.all([
        alunosAPI.listar(),
        turmasAPI.listar(),
      ]);
      
      setAlunos(alunosRes.data);
      setTurmas(turmasRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const carregarFaltas = async () => {
    try {
      const params: any = {};
      if (filtroTurma) params.turma_id = filtroTurma;
      if (dataInicio) params.data_inicio = dataInicio;
      if (dataFim) params.data_fim = dataFim;

      const response = await faltasAPI.listar(params);
      setFaltas(response.data);
    } catch (error) {
      console.error('Erro ao carregar faltas:', error);
    }
  };

  const carregarResumoFaltas = async () => {
    if (!filtroTurma) {
      setResumoFaltas([]);
      return;
    }

    try {
      const response = await faltasAPI.resumoTurma(filtroTurma);
      setResumoFaltas(response.data);
    } catch (error) {
      console.error('Erro ao carregar resumo de faltas:', error);
    }
  };

  const abrirDialog = (falta?: Falta) => {
    if (falta) {
      setEditandoFalta(falta);
      setFormData({
        aluno_id: falta.aluno_id,
        data_falta: falta.data_falta,
        justificada: falta.justificada,
        motivo: falta.motivo || '',
        documento_justificativa: falta.documento_justificativa || '',
      });
    } else {
      setEditandoFalta(null);
      setFormData({
        aluno_id: 0,
        data_falta: format(new Date(), 'yyyy-MM-dd'),
        justificada: false,
        motivo: '',
        documento_justificativa: '',
      });
    }
    setDialogAberto(true);
  };

  const fecharDialog = () => {
    setDialogAberto(false);
    setEditandoFalta(null);
  };

  const salvarFalta = async () => {
    try {
      setLoading(true);
      
      if (editandoFalta) {
        await faltasAPI.atualizar(editandoFalta.id!, formData);
      } else {
        await faltasAPI.criar(formData);
      }
      
      await carregarFaltas();
      if (modoResumo) await carregarResumoFaltas();
      fecharDialog();
    } catch (error: any) {
      console.error('Erro ao salvar falta:', error);
      if (error.response?.data?.error?.includes('já registrada')) {
        alert('Já existe uma falta registrada para este aluno nesta data.');
      }
    } finally {
      setLoading(false);
    }
  };

  const deletarFalta = async (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar esta falta?')) {
      try {
        await faltasAPI.deletar(id);
        await carregarFaltas();
        if (modoResumo) await carregarResumoFaltas();
      } catch (error) {
        console.error('Erro ao deletar falta:', error);
      }
    }
  };

  const exportarRelatorio = () => {
    const dados = modoResumo ? resumoFaltas : faltas;
    const csv = modoResumo 
      ? `Aluno,Matrícula,Total Faltas,Justificadas,Não Justificadas\n${resumoFaltas.map(r => 
          `${r.aluno_nome},${r.matricula},${r.total_faltas},${r.faltas_justificadas},${r.faltas_nao_justificadas}`
        ).join('\n')}`
      : `Data,Aluno,Matrícula,Turma,Justificada,Motivo\n${faltas.map(f => 
          `${format(new Date(f.data_falta), 'dd/MM/yyyy')},${f.aluno_nome},${f.matricula},${f.turma_nome},${f.justificada ? 'Sim' : 'Não'},${f.motivo || ''}`
        ).join('\n')}`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `faltas_${format(new Date(), 'dd-MM-yyyy')}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h2">
            Controle de Faltas
          </Typography>
          <Box>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<ExportIcon />}
              onClick={exportarRelatorio}
              style={{ marginRight: 8 }}
            >
              Exportar
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => abrirDialog()}
            >
              Registrar Falta
            </Button>
          </Box>
        </Box>

        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={3}>
            <FormControl variant="outlined" size="small" fullWidth>
              <InputLabel>Turma</InputLabel>
              <Select
                value={filtroTurma}
                onChange={(e) => setFiltroTurma(e.target.value as number)}
                label="Turma"
              >
                <MenuItem value="">
                  <em>Todas</em>
                </MenuItem>
                {turmas.map((turma) => (
                  <MenuItem key={turma.id} value={turma.id}>
                    {turma.nome} - {turma.turno}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {!modoResumo && (
            <>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Data Início"
                  type="date"
                  size="small"
                  fullWidth
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Data Fim"
                  type="date"
                  size="small"
                  fullWidth
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12} sm={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={modoResumo}
                  onChange={(e) => setModoResumo(e.target.checked)}
                />
              }
              label="Modo Resumo"
            />
          </Grid>
        </Grid>

        {modoResumo ? (
          <>
            {!filtroTurma && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Selecione uma turma para visualizar o resumo de faltas
              </Alert>
            )}

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Aluno</TableCell>
                    <TableCell>Matrícula</TableCell>
                    <TableCell align="center">Total Faltas</TableCell>
                    <TableCell align="center">Justificadas</TableCell>
                    <TableCell align="center">Não Justificadas</TableCell>
                    <TableCell align="center">% Faltas</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resumoFaltas.map((resumo) => (
                    <TableRow key={resumo.aluno_id}>
                      <TableCell>{resumo.aluno_nome}</TableCell>
                      <TableCell>{resumo.matricula}</TableCell>
                      <TableCell align="center">{resumo.total_faltas}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={resumo.faltas_justificadas}
                          size="small"
                          color="success"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={resumo.faltas_nao_justificadas}
                          size="small"
                          color={resumo.faltas_nao_justificadas > 5 ? 'error' : 'warning'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {resumo.total_faltas > 0 ? 
                          `${Math.round((resumo.faltas_nao_justificadas / resumo.total_faltas) * 100)}%` : 
                          '0%'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Aluno</TableCell>
                  <TableCell>Matrícula</TableCell>
                  <TableCell>Turma</TableCell>
                  <TableCell>Justificada</TableCell>
                  <TableCell>Motivo</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {faltas.map((falta) => (
                  <TableRow key={falta.id}>
                    <TableCell>
                      {format(new Date(falta.data_falta), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>{falta.aluno_nome}</TableCell>
                    <TableCell>{falta.matricula}</TableCell>
                    <TableCell>{falta.turma_nome}</TableCell>
                    <TableCell>
                      <Chip
                        label={falta.justificada ? 'Sim' : 'Não'}
                        size="small"
                        color={falta.justificada ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell>{falta.motivo || '-'}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => abrirDialog(falta)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => deletarFalta(falta.id!)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {(modoResumo ? resumoFaltas : faltas).length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography color="textSecondary">
              {modoResumo ? 'Nenhum resumo disponível' : 'Nenhuma falta registrada no período'}
            </Typography>
          </Box>
        )}
      </CardContent>

      <Dialog open={dialogAberto} onClose={fecharDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editandoFalta ? 'Editar Falta' : 'Registrar Nova Falta'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Autocomplete
                options={alunos}
                getOptionLabel={(option) => `${option.nome} - ${option.matricula} (${option.turma_nome})`}
                value={alunos.find(a => a.id === formData.aluno_id) || null}
                onChange={(_, newValue) => {
                  setFormData(prev => ({
                    ...prev,
                    aluno_id: newValue?.id || 0
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Aluno *"
                    variant="outlined"
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Data da Falta *"
                type="date"
                variant="outlined"
                fullWidth
                value={formData.data_falta}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  data_falta: e.target.value
                }))}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.justificada}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      justificada: e.target.checked
                    }))}
                  />
                }
                label="Falta Justificada"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Motivo"
                multiline
                rows={3}
                variant="outlined"
                fullWidth
                value={formData.motivo}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  motivo: e.target.value
                }))}
                helperText="Descreva o motivo da falta (opcional)"
              />
            </Grid>

            {formData.justificada && (
              <Grid item xs={12}>
                <TextField
                  label="Documento de Justificativa"
                  variant="outlined"
                  fullWidth
                  value={formData.documento_justificativa}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    documento_justificativa: e.target.value
                  }))}
                  helperText="Ex: Atestado médico, declaração, etc."
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharDialog}>Cancelar</Button>
          <Button
            onClick={salvarFalta}
            variant="contained"
            color="primary"
            disabled={loading || !formData.aluno_id}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default TabelaFaltas;