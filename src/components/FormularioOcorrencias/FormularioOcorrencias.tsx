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
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { alunosAPI, ocorrenciasAPI, turmasAPI } from '../../api/api';
import { format } from 'date-fns';

interface Aluno {
  id: number;
  matricula: string;
  nome: string;
  turma_nome: string;
}

interface TipoOcorrencia {
  id: number;
  nome: string;
  gravidade: string;
  pontos: number;
}

interface Ocorrencia {
  id?: number;
  aluno_id: number;
  tipo_ocorrencia_id: number;
  data_ocorrencia: string;
  hora_ocorrencia?: string;
  descricao: string;
  medidas_tomadas?: string;
  responsavel_registro: string;
  status: string;
  aluno_nome?: string;
  tipo_nome?: string;
  gravidade?: string;
  pontos?: number;
}

const FormularioOcorrencias: React.FC = () => {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [tiposOcorrencia, setTiposOcorrencia] = useState<TipoOcorrencia[]>([]);
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [editandoOcorrencia, setEditandoOcorrencia] = useState<Ocorrencia | null>(null);
  const [loading, setLoading] = useState(false);
  const [filtroTurma, setFiltroTurma] = useState<number | ''>('');
  const [turmas, setTurmas] = useState<any[]>([]);

  const [formData, setFormData] = useState<Omit<Ocorrencia, 'id'>>({
    aluno_id: 0,
    tipo_ocorrencia_id: 0,
    data_ocorrencia: format(new Date(), 'yyyy-MM-dd'),
    hora_ocorrencia: format(new Date(), 'HH:mm'),
    descricao: '',
    medidas_tomadas: '',
    responsavel_registro: 'Tenente Silva',
    status: 'pendente',
  });

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    carregarOcorrencias();
  }, [filtroTurma]);

  const carregarDados = async () => {
    try {
      const [alunosRes, tiposRes, turmasRes] = await Promise.all([
        alunosAPI.listar(),
        ocorrenciasAPI.tipos(),
        turmasAPI.listar(),
      ]);
      
      setAlunos(alunosRes.data);
      setTiposOcorrencia(tiposRes.data);
      setTurmas(turmasRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const carregarOcorrencias = async () => {
    try {
      const params = filtroTurma ? { turma_id: filtroTurma } : {};
      const response = await ocorrenciasAPI.listar(params);
      setOcorrencias(response.data);
    } catch (error) {
      console.error('Erro ao carregar ocorrências:', error);
    }
  };

  const abrirDialog = (ocorrencia?: Ocorrencia) => {
    if (ocorrencia) {
      setEditandoOcorrencia(ocorrencia);
      setFormData({
        aluno_id: ocorrencia.aluno_id,
        tipo_ocorrencia_id: ocorrencia.tipo_ocorrencia_id,
        data_ocorrencia: ocorrencia.data_ocorrencia,
        hora_ocorrencia: ocorrencia.hora_ocorrencia || '',
        descricao: ocorrencia.descricao,
        medidas_tomadas: ocorrencia.medidas_tomadas || '',
        responsavel_registro: ocorrencia.responsavel_registro,
        status: ocorrencia.status,
      });
    } else {
      setEditandoOcorrencia(null);
      setFormData({
        aluno_id: 0,
        tipo_ocorrencia_id: 0,
        data_ocorrencia: format(new Date(), 'yyyy-MM-dd'),
        hora_ocorrencia: format(new Date(), 'HH:mm'),
        descricao: '',
        medidas_tomadas: '',
        responsavel_registro: 'Tenente Silva',
        status: 'pendente',
      });
    }
    setDialogAberto(true);
  };

  const fecharDialog = () => {
    setDialogAberto(false);
    setEditandoOcorrencia(null);
  };

  const salvarOcorrencia = async () => {
    try {
      setLoading(true);
      
      if (editandoOcorrencia) {
        await ocorrenciasAPI.atualizar(editandoOcorrencia.id!, formData);
      } else {
        await ocorrenciasAPI.criar(formData);
      }
      
      await carregarOcorrencias();
      fecharDialog();
    } catch (error) {
      console.error('Erro ao salvar ocorrência:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletarOcorrencia = async (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar esta ocorrência?')) {
      try {
        await ocorrenciasAPI.deletar(id);
        await carregarOcorrencias();
      } catch (error) {
        console.error('Erro ao deletar ocorrência:', error);
      }
    }
  };

  const getGravidadeColor = (gravidade: string) => {
    switch(gravidade) {
      case 'leve': return 'success';
      case 'media': return 'warning';
      case 'grave': return 'error';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pendente': return 'warning';
      case 'em_andamento': return 'info';
      case 'resolvida': return 'success';
      default: return 'default';
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h2">
            Ocorrências Disciplinares
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => abrirDialog()}
          >
            Nova Ocorrência
          </Button>
        </Box>

        <Box display="flex" gap={2} mb={3}>
          <FormControl variant="outlined" size="small" style={{ minWidth: 200 }}>
            <InputLabel>Filtrar por Turma</InputLabel>
            <Select
              value={filtroTurma}
              onChange={(e) => setFiltroTurma(e.target.value as number)}
              label="Filtrar por Turma"
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
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data/Hora</TableCell>
                <TableCell>Aluno</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Gravidade</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Responsável</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ocorrencias.map((ocorrencia) => (
                <TableRow key={ocorrencia.id}>
                  <TableCell>
                    {format(new Date(ocorrencia.data_ocorrencia), 'dd/MM/yyyy')}
                    {ocorrencia.hora_ocorrencia && (
                      <><br /><small>{ocorrencia.hora_ocorrencia}</small></>
                    )}
                  </TableCell>
                  <TableCell>
                    {ocorrencia.aluno_nome}
                    <br />
                    <small>Turma: {ocorrencia.turma_nome || 'N/A'}</small>
                  </TableCell>
                  <TableCell>{ocorrencia.tipo_nome}</TableCell>
                  <TableCell>
                    <Chip
                      label={ocorrencia.gravidade}
                      size="small"
                      color={getGravidadeColor(ocorrencia.gravidade!) as any}
                    />
                    <br />
                    <small>{ocorrencia.pontos} pts</small>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ocorrencia.status}
                      size="small"
                      color={getStatusColor(ocorrencia.status) as any}
                    />
                  </TableCell>
                  <TableCell>{ocorrencia.responsavel_registro}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => abrirDialog(ocorrencia)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => deletarOcorrencia(ocorrencia.id!)}
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

        {ocorrencias.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography color="textSecondary">
              Nenhuma ocorrência registrada
            </Typography>
          </Box>
        )}
      </CardContent>

      <Dialog open={dialogAberto} onClose={fecharDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editandoOcorrencia ? 'Editar Ocorrência' : 'Nova Ocorrência'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
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

            <Grid item xs={12} sm={6}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel>Tipo de Ocorrência *</InputLabel>
                <Select
                  value={formData.tipo_ocorrencia_id}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    tipo_ocorrencia_id: e.target.value as number
                  }))}
                  label="Tipo de Ocorrência *"
                >
                  {tiposOcorrencia.map((tipo) => (
                    <MenuItem key={tipo.id} value={tipo.id}>
                      {tipo.nome} ({tipo.gravidade} - {tipo.pontos} pts)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Data da Ocorrência *"
                type="date"
                variant="outlined"
                fullWidth
                value={formData.data_ocorrencia}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  data_ocorrencia: e.target.value
                }))}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Hora da Ocorrência"
                type="time"
                variant="outlined"
                fullWidth
                value={formData.hora_ocorrencia}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  hora_ocorrencia: e.target.value
                }))}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Descrição da Ocorrência *"
                multiline
                rows={4}
                variant="outlined"
                fullWidth
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  descricao: e.target.value
                }))}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Medidas Tomadas"
                multiline
                rows={3}
                variant="outlined"
                fullWidth
                value={formData.medidas_tomadas}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  medidas_tomadas: e.target.value
                }))}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Responsável pelo Registro *"
                variant="outlined"
                fullWidth
                value={formData.responsavel_registro}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  responsavel_registro: e.target.value
                }))}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    status: e.target.value as string
                  }))}
                  label="Status"
                >
                  <MenuItem value="pendente">Pendente</MenuItem>
                  <MenuItem value="em_andamento">Em Andamento</MenuItem>
                  <MenuItem value="resolvida">Resolvida</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharDialog}>Cancelar</Button>
          <Button
            onClick={salvarOcorrencia}
            variant="contained"
            color="primary"
            disabled={loading || !formData.aluno_id || !formData.tipo_ocorrencia_id || !formData.descricao.trim()}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default FormularioOcorrencias;