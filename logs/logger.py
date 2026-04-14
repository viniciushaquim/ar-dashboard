#!/usr/bin/env python3
"""
AR Propaganda — Logger de Agentes
Função reutilizável para todos os agentes (ARIA, ARIS, ARCH)

Uso:
  from logger import log_tarefa
  log_tarefa("ARIA", "online", "Relatório enviado")
"""

import os
from datetime import datetime

LOGS_DIR = "/data/.openclaw/workspace/logs"
LOG_FILE = os.path.join(LOGS_DIR, "agentes.log")

def log_tarefa(agente: str, status: str, tarefa: str):
    """
    Loga tarefa executada por agente.
    
    Args:
        agente: Nome do agente (ARIA, ARIS, ARCH)
        status: Status (online, idle, offline)
        tarefa: Descrição da tarefa executada
    """
    
    # Garantir que pasta existe
    os.makedirs(LOGS_DIR, exist_ok=True)
    
    # Formatar timestamp
    timestamp = datetime.now().isoformat()
    
    # Escrever log
    log_line = f"{timestamp} | {agente.upper():6} | {status:8} | {tarefa}\n"
    
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(log_line)
    
    print(f"✅ Log: {log_line.strip()}")
    
    # Git commit automático (se estiver em repo git)
    try:
        if os.path.exists("/tmp/ar-dashboard/.git"):
            os.chdir("/tmp/ar-dashboard")
            os.system(f"git add logs/agentes.log")
            os.system(f'git commit -m "log: {agente} - {tarefa[:50]}"')
            os.system("git push origin main")
            print("✅ Git push realizado!")
    except Exception as e:
        print(f"⚠️  Git falhou (normal se não estiver em repo): {e}")

def get_ultimo_status(agente: str) -> dict:
    """
    Retorna último status do agente.
    """
    if not os.path.exists(LOG_FILE):
        return {"status": "offline", "tarefa": "Sem dados", "time": "--:--"}
    
    with open(LOG_FILE, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    # Buscar últimas entradas do agente
    for line in reversed(lines[-100:]):  # Últimas 100 linhas
        if agente.upper() in line.upper():
            parts = line.strip().split(" | ")
            if len(parts) >= 4:
                return {
                    "status": parts[2].strip(),
                    "tarefa": parts[3].strip(),
                    "time": parts[0].split("T")[1].split(".")[0][:5]
                }
    
    return {"status": "offline", "tarefa": "Sem dados", "time": "--:--"}

# Exemplo de uso
if __name__ == "__main__":
    print("Testando logger...")
    log_tarefa("ARIA", "online", "Teste de log")
    log_tarefa("ARIS", "idle", "Aguardando demanda")
    log_tarefa("ARCH", "online", "Script Python criado")
    
    print("\nÚltimo status ARIA:", get_ultimo_status("ARIA"))
    print("Último status ARIS:", get_ultimo_status("ARIS"))
    print("Último status ARCH:", get_ultimo_status("ARCH"))
