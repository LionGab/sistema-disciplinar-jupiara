import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Grid,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { alunosAPI, turmasAPI } from '../../api/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Aluno {
  id: number;
  matricula: string;
  nome: string;
  data_nascimento: string;
  turma_id: number;
  turma_nome: string;
  telefone_responsavel?: string;
  email_responsavel?: string;
  endereco?: string;
  observacoes?: string;
}

interface Turma {
  id: number;
  nome: string;
  ano: string;
  turno: string;
}

interface FichaCompleta {
  aluno: Aluno;
  ocorrencias: any[];
  faltas: any[];
}

const ListaAlunos: React.FC = () => {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [turmaFiltro, setTurmaFiltro] = useState<number | ''>('');
  const [busca, setBusca] = useState('');
  const [fichaAberta, setFichaAberta] = useState(false);
  const [fichaCompleta, setFichaCompleta] = useState<FichaCompleta | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarTurmas();
    carregarAlunos();
  }, []);

  useEffect(() => {
    carregarAlunos();
  }, [turmaFiltro]);

  const carregarTurmas = async () => {
    try {
      const response = await turmasAPI.listar();
      setTurmas(response.data);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    }
  };

  const carregarAlunos = async () => {
    try {
      setLoading(true);
      const response = await alunosAPI.listar(turmaFiltro || undefined);
      setAlunos(response.data);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
    } finally {
      setLoading(false);
    }
  };

  const abrirFicha = async (alunoId: number) => {
    try {
      setLoading(true);
      const response = await alunosAPI.fichaCompleta(alunoId);
      setFichaCompleta(response.data);
      setFichaAberta(true);
    } catch (error) {
      console.error('Erro ao carregar ficha:', error);
    } finally {
      setLoading(false);
    }
  };

  const fecharFicha = () => {
    setFichaAberta(false);
    setFichaCompleta(null);
  };

  const alunosFiltrados = alunos.filter(aluno =>
    aluno.nome.toLowerCase().includes(busca.toLowerCase()) ||
    aluno.matricula.includes(busca)
  );

  const getGravidadeColor = (gravidade: string) => {
    switch(gravidade) {
      case 'leve': return 'success';
      case 'media': return 'warning';
      case 'grave': return 'error';
      default: return 'default';
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h2">
            Lista de Alunos
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddIcon />}
          >
            Novo Aluno
          </Button>
        </Box>

        <Box display="flex" gap={2} mb={3}>
          <TextField
            label="Buscar aluno"
            variant="outlined"
            size="small"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon color="action" style={{ marginRight: 8 }} />,
            }}
            style={{ flex: 1 }}
          />
          <FormControl variant="outlined" size="small" style={{ minWidth: 200 }}>
            <InputLabel>Turma</InputLabel>
            <Select
              value={turmaFiltro}
              onChange={(e) => setTurmaFiltro(e.target.value as number)}
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
        </Box>

        <List>
          {alunosFiltrados.map((aluno) => (
            <ListItem key={aluno.id} divider>
              <ListItemText
                primary={`${aluno.nome} - Matrícula: ${aluno.matricula}`}
                secondary={`Turma: ${aluno.turma_nome} | Responsável: ${aluno.telefone_responsavel || 'Não informado'}`}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="ver ficha"
                  onClick={() => abrirFicha(aluno.id)}
                  color="primary"
                >
                  <VisibilityIcon />
                </IconButton>
                <IconButton edge="end" aria-label="editar" color="default">
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" aria-label="deletar" color="error">
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        {alunosFiltrados.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography color="textSecondary">
              Nenhum aluno encontrado
            </Typography>
          </Box>
        )}
      </CardContent>

      <Dialog open={fichaAberta} onClose={fecharFicha} maxWidth="lg" fullWidth>
        {fichaCompleta && (
          <>
            <DialogTitle>
              Ficha Completa - {fichaCompleta.aluno.nome}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Dados Pessoais
                  </Typography>
                  <Typography><strong>Matrícula:</strong> {fichaCompleta.aluno.matricula}</Typography>
                  <Typography><strong>Turma:</strong> {fichaCompleta.aluno.turma_nome}</Typography>
                  <Typography>
                    <strong>Data de Nascimento:</strong> {' '}
                    {fichaCompleta.aluno.data_nascimento ? 
                      format(new Date(fichaCompleta.aluno.data_nascimento), 'dd/MM/yyyy') : 
                      'Não informada'}
                  </Typography>
                  <Typography><strong>Telefone Responsável:</strong> {fichaCompleta.aluno.telefone_responsavel || 'Não informado'}</Typography>
                  <Typography><strong>Email Responsável:</strong> {fichaCompleta.aluno.email_responsavel || 'Não informado'}</Typography>
                  <Typography><strong>Endereço:</strong> {fichaCompleta.aluno.endereco || 'Não informado'}</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Resumo Disciplinar
                  </Typography>
                  <Typography><strong>Total de Ocorrências:</strong> {fichaCompleta.ocorrencias.length}</Typography>
                  <Typography><strong>Total de Faltas:</strong> {fichaCompleta.faltas.length}</Typography>
                  <Typography>
                    <strong>Faltas Não Justificadas:</strong> {' '}
                    {fichaCompleta.faltas.filter(f => !f.justificada).length}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Ocorrências
                  </Typography>
                  {fichaCompleta.ocorrencias.length > 0 ? (
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Data</TableCell>
                            <TableCell>Tipo</TableCell>
                            <TableCell>Gravidade</TableCell>
                            <TableCell>Descrição</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {fichaCompleta.ocorrencias.map((ocorrencia) => (
                            <TableRow key={ocorrencia.id}>
                              <TableCell>
                                {format(new Date(ocorrencia.data_ocorrencia), 'dd/MM/yyyy')}
                              </TableCell>
                              <TableCell>{ocorrencia.tipo_nome}</TableCell>
                              <TableCell>
                                <Chip
                                  label={ocorrencia.gravidade}
                                  size="small"
                                  color={getGravidadeColor(ocorrencia.gravidade) as any}
                                />
                              </TableCell>
                              <TableCell>{ocorrencia.descricao}</TableCell>
                              <TableCell>{ocorrencia.status}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography color="textSecondary">Nenhuma ocorrência registrada</Typography>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Faltas
                  </Typography>
                  {fichaCompleta.faltas.length > 0 ? (
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Data</TableCell>
                            <TableCell>Justificada</TableCell>
                            <TableCell>Motivo</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {fichaCompleta.faltas.map((falta) => (
                            <TableRow key={falta.id}>
                              <TableCell>
                                {format(new Date(falta.data_falta), 'dd/MM/yyyy')}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={falta.justificada ? 'Sim' : 'Não'}
                                  size="small"
                                  color={falta.justificada ? 'success' : 'error'}
                                />
                              </TableCell>
                              <TableCell>{falta.motivo || 'Não informado'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography color="textSecondary">Nenhuma falta registrada</Typography>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={fecharFicha}>Fechar</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Card>
  );
};

export default ListaAlunos;