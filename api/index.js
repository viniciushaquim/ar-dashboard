// Vercel Serverless Function - Dashboard API v2
// AR Propaganda AI Team - Com Cron Jobs e Data no Histórico

import fetch from 'node-fetch';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Buscar logs do GitHub
    const logsUrl = 'https://raw.githubusercontent.com/viniciushaquim/ar-dashboard/main/logs/agentes.log';
    const logsRes = await fetch(logsUrl, {
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN || ''}`,
        'Cache-Control': 'no-cache'
      }
    });
    
    let logs = '';
    if (logsRes.ok) {
      logs = await logsRes.text();
    }
    
    // Buscar cron jobs (se existir)
    const cronUrl = 'https://raw.githubusercontent.com/viniciushaquim/ar-dashboard/main/logs/cron-jobs.log';
    const cronRes = await fetch(cronUrl, {
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN || ''}`,
        'Cache-Control': 'no-cache'
      }
    });
    
    let cronLogs = '';
    if (cronRes.ok) {
      cronLogs = await cronRes.text();
    }
    
    // Parse dos logs
    const agentes = parseLogs(logs);
    const cronJobs = parseCronLogs(cronLogs);
    
    // Dados do dashboard
    const data = {
      agentes: [
        {
          name: 'ARIA',
          role: 'Head of Operations',
          avatar: '👤',
          status: agentes.aria.status,
          tasksToday: agentes.aria.count,
          successRate: '98%',
          lastTask: agentes.aria.lastTask,
          lastTaskTime: agentes.aria.time,
          lastTaskDate: agentes.aria.date
        },
        {
          name: 'ARIS',
          role: 'Social Media Specialist',
          avatar: '📱',
          status: agentes.aris.status,
          tasksToday: agentes.aris.count,
          successRate: '100%',
          lastTask: agentes.aris.lastTask,
          lastTaskTime: agentes.aris.time,
          lastTaskDate: agentes.aris.date
        },
        {
          name: 'ARCH',
          role: 'Programador',
          avatar: '💻',
          status: agentes.arch.status,
          tasksToday: agentes.arch.count,
          successRate: '--',
          lastTask: agentes.arch.lastTask,
          lastTaskTime: agentes.arch.time,
          lastTaskDate: agentes.arch.date
        }
      ],
      cronJobs: cronJobs,
      history: agentes.history,
      metrics: {
        agentsOnline: [agentes.aria, agentes.aris, agentes.arch].filter(a => a.status === 'online').length,
        tasksToday: agentes.aria.count + agentes.aris.count + agentes.arch.count,
        successRate: '98%',
        activityToday: formatActivity(agente.aria.count + agentes.aris.count + agentes.arch.count)
      },
      lastUpdate: new Date().toISOString()
    };
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Erro na API:', error);
    res.status(200).json(getMockData());
  }
}

function parseLogs(logs) {
  const defaultStatus = { status: 'offline', lastTask: 'Aguardando demanda', time: '--:--', date: '--/--', count: 0 };
  
  const result = {
    aria: { ...defaultStatus },
    aris: { ...defaultStatus },
    arch: { ...defaultStatus },
    history: []
  };
  
  if (!logs.trim()) return result;
  
  const lines = logs.trim().split('\n').slice(-50);
  // Usar timezone UTC para bater com logs ISO
  const today = new Date().toISOString().split('T')[0];
  
  console.log('Logs recebidos:', logs.substring(0, 200));
  console.log('Today (UTC):', today);
  
  lines.forEach(line => {
    const parts = line.split(' | ').map(p => p.trim());
    if (parts.length < 4) return;
    
    const [timestamp, agente, status, tarefa] = parts;
    const agenteUpper = agente.toUpperCase();
    const dateObj = new Date(timestamp);
    const time = timestamp.split('T')[1]?.split('.')[0]?.slice(0, 5) || '--:--';
    const date = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const logDate = timestamp.split('T')[0];
    // Comparar datas no formato ISO (YYYY-MM-DD)
    const isToday = logDate === today;
    
    console.log(`Log: ${agenteUpper}, timestamp: ${timestamp}, logDate: ${logDate}, today: ${today}, isToday: ${isToday}`);
    
    console.log(`Log: ${agenteUpper}, ${timestamp}, isToday: ${isToday}`);
    
    if (result[agenteUpper.toLowerCase()]) {
      result[agenteUpper.toLowerCase()].status = status;
      result[agenteUpper.toLowerCase()].lastTask = tarefa;
      result[agenteUpper.toLowerCase()].time = time;
      result[agenteUpper.toLowerCase()].date = date;
      if (isToday) {
        result[agenteUpper.toLowerCase()].count += 1;
      }
    }
    
    // Adicionar ao histórico (últimas 5 tarefas de hoje)
    if (result.history.length < 5 && isToday) {
      const icon = getIcon(agenteUpper, tarefa);
      result.history.push({
        icon,
        title: tarefa,
        agent: agenteUpper,
        date,
        time,
        status: 'success'
      });
    }
  });
  
  console.log('History result:', result.history);
  return result;
}

function parseCronLogs(logs) {
  if (!logs.trim()) return [];
  
  const lines = logs.trim().split('\n').slice(-10);
  const today = new Date().toISOString().split('T')[0];
  
  return lines.map(line => {
    const parts = line.split(' | ').map(p => p.trim());
    const [timestamp, job, status, result] = parts;
    const dateObj = new Date(timestamp);
    const time = timestamp.split('T')[1]?.split('.')[0]?.slice(0, 5) || '--:--';
    const date = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    
    return {
      job: job || 'Job desconhecido',
      status: status || 'unknown',
      result: result || 'Sem resultado',
      time,
      date
    };
  }).reverse();
}

function getIcon(agente, tarefa) {
  if (agente === 'ARIA') return '📊';
  if (agente === 'ARIS') return '📱';
  if (agente === 'ARCH') return '💻';
  return '📄';
}

function formatActivity(tasks) {
  if (tasks === 0) return 'Sem atividade';
  if (tasks === 1) return '1 tarefa hoje';
  return `${tasks} tarefas hoje`;
}

function getMockData() {
  // Fallback com dados mockados INCLUINDO histórico
  const today = new Date();
  const dateStr = today.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const timeStr = today.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  
  return {
    agentes: [
      { name: 'ARIA', role: 'Head of Operations', avatar: '👤', status: 'online', tasksToday: 3, successRate: '98%', lastTask: 'Relatório enviado', lastTaskTime: '17:56', lastTaskDate: dateStr },
      { name: 'ARIS', role: 'Social Media Specialist', avatar: '📱', status: 'idle', tasksToday: 1, successRate: '100%', lastTask: 'Post criado', lastTaskTime: '14:30', lastTaskDate: dateStr },
      { name: 'ARCH', role: 'Programador', avatar: '💻', status: 'online', tasksToday: 1, successRate: '--', lastTask: 'Script criado', lastTaskTime: '17:57', lastTaskDate: dateStr }
    ],
    cronJobs: [
      { job: 'Mini Análise Diária Acnase', status: 'success', result: 'Relatório gerado', time: '12:00', date: dateStr }
    ],
    history: [
      { icon: '📊', title: 'Apresentação IA criada', agent: 'ARIA', time: '17:56', date: dateStr, status: 'success' },
      { icon: '📊', title: 'Dashboard corrigido', agent: 'ARIA', time: '17:56', date: dateStr, status: 'success' },
      { icon: '💻', title: 'Script criado', agent: 'ARCH', time: '17:57', date: dateStr, status: 'success' }
    ],
    metrics: { agentsOnline: 2, tasksToday: 5, successRate: '98%', activityToday: '5 tarefas hoje' },
    lastUpdate: new Date().toISOString()
  };
}
