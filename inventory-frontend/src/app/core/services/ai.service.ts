import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ChatMessageDto {
  role: string;
  content: string;
}

export interface AiResponseDto {
  reply: string;
  model: string;
  tokens: number;
}

@Injectable({
  providedIn: 'root',
})
export class AiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Ai`;

  chat(message: string, mode: number, history: ChatMessageDto[] = []): Observable<AiResponseDto> {
    return this.http.post<AiResponseDto>(`${this.apiUrl}/chat`, {
      message,
      mode,
      history,
    });
  }
}
