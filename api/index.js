// Vercel Serverless Function - Dashboard API
// AR Propaganda AI Team

export default function handler(req, res) {
  const data = {
    agents: [
      {
        name: 'ARIA',
        role: 'Head of Operations',
        avatar: '👤',
        status: 'online',
        tasksToday: 12,
        successRate: '98%',
        tokensUsed: '45.2k',
        lastTask: 'Relatório Avert Saúde Animal',
        lastTaskTime: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})
      },
      {
        name: 'ARIS',
        role: 'Social Media Specialist',
        avatar: '📱',
        status: 'idle',
        tasksToday: 5,
        successRate: '100%',
        tokensUsed: '12.8k',
        lastTask: 'Legenda Instagram',
        lastTaskTime: '09:45'
      },
      {
        name: 'ARCH',
        role: 'Programador',
        avatar: '💻',
        status: 'offline',
        tasksToday: 0,
        successRate: '--',
        tokensUsed: '0',
        lastTask: 'Aguardando demanda',
        lastTaskTime: '--'
      }
    ],
    history: [
      {
        icon: '📊',
        title: 'Relatório Avert Saúde Animal',
        agent: 'ARIA',
        time: '10:16',
        cost: '$0.08',
        status: 'success'
      },
      {
        icon: '📧',
        title: 'Envio de Email (Relatório)',
        agent: 'ARIA',
        time: '10:17',
        cost: '$0.02',
        status: 'success'
      },
      {
        icon: '📱',
        title: 'Legenda Instagram',
        agent: 'ARIS',
        time: '09:45',
        cost: '$0.03',
        status: 'success'
      },
      {
        icon: '💬',
        title: 'Dashboard AI Team',
        agent: 'ARIA',
        time: '11:30',
        cost: '$0.08',
        status: 'success'
      },
      {
        icon: '🔍',
        title: 'Pesquisa de Mercado',
        agent: 'ARIA',
        time: '09:30',
        cost: '$0.05',
        status: 'success'
      }
    ],
    metrics: {
      agentsOnline: 1,
      tasksToday: 17,
      successRate: '98%',
      costToday: 0.42,
      costMonth: 12.50,
      tokensToday: '58.0k'
    },
    lastUpdate: new Date().toISOString()
  };

  res.status(200).json(data);
}
