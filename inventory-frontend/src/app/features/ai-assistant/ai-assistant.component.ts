import {
  Component,
  OnInit,
  inject,
  ViewChild,
  ElementRef,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService, AiResponseDto } from '../../core/services/ai.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import Swal from 'sweetalert2';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tokens?: number;
  loading?: boolean;
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-assistant.component.html',
  styleUrls: ['./ai-assistant.component.css'],
})
export class AiAssistantComponent implements OnInit, OnDestroy {
  private aiService = inject(AiService);
  private authService = inject(AuthService);

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  messages: ChatMessage[] = [];
  userInput: string = '';
  isLoading: boolean = false;
  aiMode: number = 0; // 0 = Normal, 1 = Deep Think
  isOpen: boolean = false;
  private chatSub?: Subscription;

  ngOnInit(): void {
    this.loadChat();
    if (this.messages.length === 0) {
      this.messages.push({
        role: 'assistant',
        content: "**Hello! I'm Inventory-AI**. How can I help you manage your stock today?",
        timestamp: new Date(),
      });
      this.saveChat();
    }
  }

  private getChatStorageKey(): string {
    const user = this.authService.getCurrentUser();
    const keyId = user?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || user?.email || user?.unique_name || 'guest';
    return `inv_ai_chat_${keyId}`;
  }

  private saveChat(): void {
    localStorage.setItem(this.getChatStorageKey(), JSON.stringify(this.messages));
  }

  private loadChat(): void {
    const saved = localStorage.getItem(this.getChatStorageKey());
    if (saved) {
      try {
        this.messages = JSON.parse(saved);
      } catch (e) {
        this.messages = [];
      }
    }
  }

  ngOnDestroy(): void {
    if (this.chatSub) {
      this.chatSub.unsubscribe();
    }
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  scrollToBottom(): void {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch { }
  }

  get canSend(): boolean {
    return this.userInput.trim().length > 0 && !this.isLoading;
  }

  sendMessage(): void {
    if (!this.canSend) return;
    const text = this.userInput.trim();
    this.userInput = '';
    this.addUserMessage(text);
    this.callChat(text);
  }

  private callChat(text: string): void {
    this.addLoadingMessage();

    const historyMessages = this.messages
      .filter(m => !m.loading)
      .slice(0, -1)
      .slice(-4)
      .map(m => ({ role: m.role, content: m.content }));

    this.chatSub = this.aiService.chat(text, this.aiMode, historyMessages).subscribe({
      next: (res) => this.handleResponse(res),
      error: (err) => this.handleError(err),
    });
  }

  private addUserMessage(text: string): void {
    this.messages.push({ role: 'user', content: text, timestamp: new Date() });
    this.isLoading = true;
    this.saveChat();
    setTimeout(() => this.scrollToBottom(), 50);
  }

  private addLoadingMessage(): void {
    this.messages.push({
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      loading: true,
    });
    setTimeout(() => this.scrollToBottom(), 50);
  }

  private handleResponse(res: AiResponseDto): void {
    const idx = this.findLastLoadingIndex();
    if (idx !== -1) {
      this.messages[idx] = {
        role: 'assistant',
        content: res.reply,
        timestamp: new Date(),
        tokens: res.tokens,
        loading: false,
      };
    }
    this.isLoading = false;
    this.saveChat();
    setTimeout(() => this.scrollToBottom(), 50);
  }

  private handleError(err: any): void {
    const idx = this.findLastLoadingIndex();
    let errMsg = 'Something went wrong. Please try again.';

    if (err?.error?.message) {
      const rawMessage = err.error.message as string;
      errMsg = rawMessage;
    } else if (err?.error?.title) {
      errMsg = err.error.title;
    }

    if (idx !== -1) {
      this.messages[idx] = {
        role: 'assistant',
        content: `**Error:** ${errMsg}`,
        timestamp: new Date(),
        loading: false,
      };
    }

    this.isLoading = false;
    this.saveChat();
    setTimeout(() => this.scrollToBottom(), 50);
  }

  private findLastLoadingIndex(): number {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      if (this.messages[i].loading) return i;
    }
    return -1;
  }

  formatContent(content: string): string {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  clearChat(): void {
    if (this.messages.length <= 1) return;

    Swal.fire({
      title: 'Clear Chat History?',
      text: 'Are you sure you want to delete all messages?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Clear',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.messages = [];
        localStorage.removeItem(this.getChatStorageKey());
        this.ngOnInit();
      }
    });
  }

  setAiMode(mode: number): void {
    this.aiMode = mode;
  }
}
