#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import requests
import json
from datetime import datetime
import threading

class PixWebhookTester:
    def __init__(self, root):
        self.root = root
        self.root.title("🔔 PIX Webhook Tester - ThunderBet")
        self.root.geometry("800x700")
        self.root.configure(bg='#1a1a1a')
        
        # Configurar estilo
        self.setup_styles()
        
        # URL base da API
        self.api_url = "https://money2025-thunder05.krkzfx.easypanel.host/"
        
        # Criar interface
        self.create_widgets()
        
        # Centralizar janela
        self.center_window()
    
    def setup_styles(self):
        """Configurar estilos customizados"""
        style = ttk.Style()
        style.theme_use('clam')
        
        # Configurar cores personalizadas
        style.configure('Title.TLabel', 
                       background='#1a1a1a', 
                       foreground='#ffffff', 
                       font=('Arial', 16, 'bold'))
        
        style.configure('Subtitle.TLabel', 
                       background='#1a1a1a', 
                       foreground='#cccccc', 
                       font=('Arial', 10))
        
        style.configure('Custom.TFrame', 
                       background='#2d2d2d', 
                       relief='raised')
        
        style.configure('Success.TButton',
                       background='#28a745',
                       foreground='white',
                       font=('Arial', 10, 'bold'))
        
        style.configure('Test.TButton',
                       background='#007bff',
                       foreground='white',
                       font=('Arial', 10, 'bold'))
    
    def create_widgets(self):
        """Criar todos os widgets da interface"""
        
        # Frame principal
        main_frame = ttk.Frame(self.root, style='Custom.TFrame', padding="20")
        main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Título
        title_label = ttk.Label(main_frame, 
                               text="🔔 PIX Webhook Tester", 
                               style='Title.TLabel')
        title_label.pack(pady=(0, 5))
        
        subtitle_label = ttk.Label(main_frame, 
                                  text="Teste a lógica especial do PIX em desenvolvimento", 
                                  style='Subtitle.TLabel')
        subtitle_label.pack(pady=(0, 20))
        
        # Frame para configurações
        config_frame = ttk.LabelFrame(main_frame, text="📋 Configurações", padding="15")
        config_frame.pack(fill=tk.X, pady=(0, 15))
        
        # URL da API
        ttk.Label(config_frame, text="🌐 URL da API:").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.api_url_var = tk.StringVar(value=self.api_url)
        api_entry = ttk.Entry(config_frame, textvariable=self.api_url_var, width=50)
        api_entry.grid(row=0, column=1, padx=(10, 0), pady=5, sticky=tk.W+tk.E)
        
        # ID da Transação
        ttk.Label(config_frame, text="🔑 Transaction ID:").grid(row=1, column=0, sticky=tk.W, pady=5)
        self.transaction_id_var = tk.StringVar(value="68408742b3b670ec101b757e")
        trans_entry = ttk.Entry(config_frame, textvariable=self.transaction_id_var, width=50)
        trans_entry.grid(row=1, column=1, padx=(10, 0), pady=5, sticky=tk.W+tk.E)
        
        # Valor do pagamento simulado
        ttk.Label(config_frame, text="💰 Valor Pago (R$):").grid(row=2, column=0, sticky=tk.W, pady=5)
        self.amount_var = tk.StringVar(value="35.00")
        amount_entry = ttk.Entry(config_frame, textvariable=self.amount_var, width=20)
        amount_entry.grid(row=2, column=1, padx=(10, 0), pady=5, sticky=tk.W)
        
        # Configurar grid para expandir
        config_frame.columnconfigure(1, weight=1)
        
        # Frame para ações
        action_frame = ttk.Frame(main_frame)
        action_frame.pack(fill=tk.X, pady=(0, 15))
        
        # Botão para testar webhook
        test_button = ttk.Button(action_frame, 
                                text="🚀 Enviar Webhook PIX", 
                                command=self.send_webhook,
                                style='Test.TButton')
        test_button.pack(side=tk.LEFT, padx=(0, 10))
        
        # Botão para testar conexão
        connection_button = ttk.Button(action_frame, 
                                      text="🔗 Testar Conexão", 
                                      command=self.test_connection)
        connection_button.pack(side=tk.LEFT, padx=(0, 10))
        
        # Botão para verificar transações pendentes
        check_button = ttk.Button(action_frame, 
                                 text="📊 Verificar Transações Pendentes", 
                                 command=self.check_pending_transactions)
        check_button.pack(side=tk.LEFT, padx=(0, 10))
        
        # Botão para limpar logs
        clear_button = ttk.Button(action_frame, 
                                 text="🧹 Limpar Logs", 
                                 command=self.clear_logs)
        clear_button.pack(side=tk.LEFT)
        
        # Frame para logs
        log_frame = ttk.LabelFrame(main_frame, text="📝 Logs e Respostas", padding="10")
        log_frame.pack(fill=tk.BOTH, expand=True)
        
        # Text widget para logs com scroll
        self.log_text = scrolledtext.ScrolledText(log_frame, 
                                                 height=20, 
                                                 bg='#000000', 
                                                 fg='#00ff00',
                                                 font=('Consolas', 10),
                                                 wrap=tk.WORD)
        self.log_text.pack(fill=tk.BOTH, expand=True)
        
        # Status bar
        self.status_var = tk.StringVar(value="✅ Pronto para testar")
        status_bar = ttk.Label(main_frame, textvariable=self.status_var, relief=tk.SUNKEN)
        status_bar.pack(fill=tk.X, pady=(10, 0))
        
        # Log inicial
        self.log_message("🎯 PIX Webhook Tester iniciado!")
        self.log_message("💡 PRIMEIRO: Clique em 'Testar Conexão' para verificar se o backend está rodando")
        self.log_message("💡 Dica: Gere um PIX de R$ 500 sem pagar, depois teste com R$ 35 para ver a lógica especial!")
        self.log_message("=" * 80)
    
    def center_window(self):
        """Centralizar a janela na tela"""
        self.root.update_idletasks()
        x = (self.root.winfo_screenwidth() // 2) - (self.root.winfo_width() // 2)
        y = (self.root.winfo_screenheight() // 2) - (self.root.winfo_height() // 2)
        self.root.geometry(f"+{x}+{y}")
    
    def log_message(self, message):
        """Adicionar mensagem aos logs"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        formatted_message = f"[{timestamp}] {message}\n"
        
        self.log_text.insert(tk.END, formatted_message)
        self.log_text.see(tk.END)
        self.root.update_idletasks()
    
    def clear_logs(self):
        """Limpar logs"""
        self.log_text.delete(1.0, tk.END)
        self.log_message("🧹 Logs limpos!")
    
    def test_connection(self):
        """Testar conexão com o servidor"""
        def test_request():
            try:
                self.status_var.set("🔄 Testando conexão...")
                self.log_message("🔗 Testando conexão com o servidor...")
                
                # Testar endpoint raiz
                url = f"{self.api_url_var.get()}/"
                response = requests.get(url, timeout=5)
                
                if response.status_code == 200:
                    data = response.json()
                    self.log_message("✅ SERVIDOR ONLINE!")
                    self.log_message(f"📡 Resposta: {data.get('message', 'OK')}")
                    
                    # Testar endpoint específico PIX
                    pix_url = f"{self.api_url_var.get()}/api/pix/special-logic-stats"
                    try:
                        pix_response = requests.get(pix_url, timeout=5)
                        if pix_response.status_code in [200, 401]:  # 401 é OK, significa que precisa auth
                            self.log_message("✅ Rotas PIX carregadas corretamente!")
                        else:
                            self.log_message("⚠️ Rotas PIX podem não estar carregadas")
                    except:
                        self.log_message("⚠️ Erro ao testar rotas PIX específicas")
                    
                    self.status_var.set("✅ Servidor online - Pronto para testes!")
                else:
                    self.log_message(f"⚠️ Servidor respondeu com status {response.status_code}")
                    self.status_var.set(f"⚠️ Status: {response.status_code}")
                
            except requests.exceptions.ConnectionError:
                self.log_message("❌ SERVIDOR OFFLINE!")
                self.log_message("💡 Execute: cd backend && npm start")
                self.status_var.set("❌ Servidor offline")
            except requests.exceptions.Timeout:
                self.log_message("⏰ TIMEOUT - Servidor demorou para responder")
                self.status_var.set("⏰ Timeout")
            except Exception as e:
                self.log_message(f"❌ ERRO: {str(e)}")
                self.status_var.set("❌ Erro na conexão")
            
            self.log_message("=" * 80)
        
        # Executar em thread separada
        thread = threading.Thread(target=test_request)
        thread.daemon = True
        thread.start()
    
    def send_webhook(self):
        """Enviar webhook PIX para testar"""
        def send_request():
            try:
                self.status_var.set("🔄 Enviando webhook...")
                self.log_message("🚀 Enviando webhook PIX...")
                
                # Preparar payload
                payload = {
                    "requestBody": {
                        "status": "PAID",
                        "transactionId": self.transaction_id_var.get(),
                        "dateApproval": datetime.now().isoformat(),
                        "creditParty": {
                            "name": "João da Silva (Teste)",
                            "cpf": "12345678900",
                            "bank": "260 - Nubank",
                            "agency": "0001",
                            "account": "123456-7"
                        },
                        "amount": float(self.amount_var.get()),
                        "description": "Depósito de teste - Lógica Especial PIX"
                    }
                }
                
                self.log_message(f"📤 Payload enviado:")
                self.log_message(json.dumps(payload, indent=2, ensure_ascii=False))
                
                # Fazer requisição
                url = f"{self.api_url_var.get()}/api/pix/webhook"
                response = requests.post(url, json=payload, timeout=10)
                
                # Log da resposta
                self.log_message(f"📥 Resposta HTTP {response.status_code}:")
                
                if response.status_code == 200:
                    response_data = response.json()
                    self.log_message("✅ SUCESSO!")
                    self.log_message(json.dumps(response_data, indent=2, ensure_ascii=False))
                    
                    if response_data.get('data', {}).get('specialLogicApplied'):
                        self.log_message("🔥 LÓGICA ESPECIAL FOI APLICADA!")
                        self.log_message(f"💰 Valor creditado: R$ {response_data['data']['originalAmount']},00")
                        self.log_message(f"💳 Valor pago: R$ {response_data['data']['actualPaymentAmount']}")
                        if response_data['data'].get('cancelledTransactions', 0) > 0:
                            self.log_message(f"🗑️ Transações canceladas: {response_data['data']['cancelledTransactions']}")
                        self.log_message(f"✅ Total creditado final: R$ {response_data['data']['totalCredited']},00")
                        self.log_message(f"📝 {response_data['data'].get('note', '')}")
                    
                    self.status_var.set("✅ Webhook enviado com sucesso!")
                else:
                    error_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
                    self.log_message("❌ ERRO!")
                    self.log_message(str(error_data))
                    self.status_var.set(f"❌ Erro: {response.status_code}")
                
            except requests.exceptions.RequestException as e:
                self.log_message(f"❌ ERRO DE CONEXÃO: {str(e)}")
                self.status_var.set("❌ Erro de conexão")
            except Exception as e:
                self.log_message(f"❌ ERRO INESPERADO: {str(e)}")
                self.status_var.set("❌ Erro inesperado")
            
            self.log_message("=" * 80)
        
        # Executar em thread separada para não travar a UI
        thread = threading.Thread(target=send_request)
        thread.daemon = True
        thread.start()
    
    def check_pending_transactions(self):
        """Verificar transações PIX pendentes"""
        def check_request():
            try:
                self.status_var.set("🔄 Verificando transações...")
                self.log_message("📊 Verificando transações PIX pendentes...")
                
                # Fazer requisição para estatísticas
                url = f"{self.api_url_var.get()}/api/pix/special-logic-stats"
                response = requests.get(url, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    self.log_message("✅ Estatísticas obtidas:")
                    
                    # Estatísticas da lógica especial
                    stats = data['data']['specialLogicStats']
                    self.log_message(f"🔥 Total de aplicações da lógica especial: {stats['total']}")
                    self.log_message(f"📈 Hoje: {stats['today']} | Esta semana: {stats['thisWeek']} | Este mês: {stats['thisMonth']}")
                    self.log_message(f"💰 Total creditado: R$ {stats['totalAmountCredited']},00")
                    
                    # Transações pendentes
                    pending = data['data']['pendingTransactions']
                    self.log_message(f"\n📋 Transações PIX pendentes: {len(pending)}")
                    
                    if pending:
                        for i, trans in enumerate(pending[:5], 1):  # Mostrar apenas as 5 primeiras
                            self.log_message(f"  {i}. ID: {trans['id'][:8]}... | Valor: R$ {trans['amount']},00 | Data: {trans['createdAt'][:19]}")
                        
                        if len(pending) > 5:
                            self.log_message(f"  ... e mais {len(pending) - 5} transações")
                    else:
                        self.log_message("  Nenhuma transação PIX pendente encontrada")
                    
                    self.status_var.set("✅ Verificação concluída")
                else:
                    self.log_message(f"❌ Erro ao verificar: {response.status_code}")
                    self.status_var.set("❌ Erro na verificação")
                
            except Exception as e:
                self.log_message(f"❌ ERRO: {str(e)}")
                self.status_var.set("❌ Erro na verificação")
            
            self.log_message("=" * 80)
        
        # Executar em thread separada
        thread = threading.Thread(target=check_request)
        thread.daemon = True
        thread.start()

def main():
    """Função principal"""
    root = tk.Tk()
    app = PixWebhookTester(root)
    
    try:
        root.mainloop()
    except KeyboardInterrupt:
        print("\n👋 Aplicação encerrada pelo usuário")

if __name__ == "__main__":
    main() 