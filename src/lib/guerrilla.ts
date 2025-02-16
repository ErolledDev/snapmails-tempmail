// API Constants
const API_BASE = import.meta.env.PROD 
  ? 'https://api.guerrillamail.com/ajax.php'
  : `${window.location.origin}/api/guerrillamail`;

// Core configuration
const CONFIG = {
  REQUEST_TIMEOUT: 10000,
  RETRY_ATTEMPTS: 2,
  RETRY_DELAY: 1000,
  FILTERED_EMAILS: {
    subjects: ['Welcome to Guerrilla Mail'],
    senders: ['no-reply@guerrillamail.com']
  }
} as const;

// Available email domains
export const EMAIL_DOMAINS = {
  sharklasers: '@sharklasers.com',
  guerrillamailblock: '@guerrillamailblock.com',
  guerrillamail: '@guerrillamail.com',
  spam: '@spam.me'
} as const;

// Types
interface EmailResponse {
  email_addr: string;
  email_timestamp: number;
  sid_token: string;
  alias: string;
}

export interface Email {
  mail_id: string;
  mail_from: string;
  mail_subject: string;
  mail_excerpt: string;
  mail_timestamp: string;
  mail_read: string;
  mail_date: string;
  mail_body?: string;
}

interface EmailList {
  list: Email[];
  count: string;
  email: string;
  ts: number;
  sid_token: string;
}

export class GuerrillaClient {
  private sidToken: string | null = null;
  private currentDomain: string = 'sharklasers';

  constructor() {
    this.restoreSession();
  }

  private restoreSession(): void {
    try {
      this.sidToken = localStorage.getItem('guerrilla_sid_token') || null;
      this.currentDomain = localStorage.getItem('guerrilla_domain') || 'sharklasers';
    } catch (error) {
      console.error('Session restore failed:', error);
    }
  }

  private saveSession(token: string): void {
    try {
      localStorage.setItem('guerrilla_sid_token', token);
      localStorage.setItem('guerrilla_domain', this.currentDomain);
      this.sidToken = token;
    } catch (error) {
      console.error('Session save failed:', error);
    }
  }

  private clearSession(): void {
    try {
      localStorage.removeItem('guerrilla_sid_token');
      localStorage.removeItem('guerrilla_domain');
      this.sidToken = null;
    } catch (error) {
      console.error('Session clear failed:', error);
    }
  }

  private shouldFilterEmail(email: Email): boolean {
    return CONFIG.FILTERED_EMAILS.subjects.includes(email.mail_subject) ||
           CONFIG.FILTERED_EMAILS.senders.includes(email.mail_from);
  }

  private async makeRequest<T>(
    endpoint: string,
    params: Record<string, string> = {},
    retries = 0
  ): Promise<T> {
    try {
      const searchParams = new URLSearchParams({
        f: endpoint,
        ...params,
        ...(this.sidToken ? { sid_token: this.sidToken } : {})
      });

      const url = `${API_BASE}${API_BASE.includes('?') ? '&' : '?'}${searchParams.toString()}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if ('sid_token' in data && typeof data.sid_token === 'string') {
        this.saveSession(data.sid_token);
      }

      // Filter emails if the response contains an email list
      if (endpoint === 'check_email' && 'list' in data) {
        const emailList = data as EmailList;
        emailList.list = emailList.list.filter(email => !this.shouldFilterEmail(email));
      }

      return data as T;
    } catch (error) {
      if (error instanceof Error) {
        // Handle session expiration
        if (error.message.includes('session') || error.message.includes('token')) {
          this.clearSession();
          if (endpoint !== 'get_email_address' && retries < CONFIG.RETRY_ATTEMPTS) {
            await this.getEmailAddress();
            return this.makeRequest(endpoint, params, retries + 1);
          }
        }

        // Handle timeouts and retries
        if (retries < CONFIG.RETRY_ATTEMPTS) {
          await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
          return this.makeRequest(endpoint, params, retries + 1);
        }
      }
      throw new Error('Request failed');
    }
  }

  async getEmailAddress(lang = 'en'): Promise<EmailResponse> {
    try {
      return await this.makeRequest<EmailResponse>('get_email_address', { lang });
    } catch (error) {
      this.clearSession();
      throw error;
    }
  }

  async setEmailUser(emailUser: string, lang = 'en'): Promise<EmailResponse> {
    return this.makeRequest<EmailResponse>('set_email_user', { 
      email_user: emailUser, 
      lang 
    });
  }

  async setDomain(domain: string): Promise<EmailResponse> {
    this.currentDomain = domain;
    const currentEmail = await this.getEmailAddress();
    const username = currentEmail.email_addr.split('@')[0];
    return this.setEmailUser(username);
  }

  async checkEmail(seq = '0'): Promise<EmailList> {
    return this.makeRequest<EmailList>('check_email', { seq });
  }

  async fetchEmail(emailId: string): Promise<Email> {
    return this.makeRequest<Email>('fetch_email', { email_id: emailId });
  }

  async forgetMe(): Promise<boolean> {
    try {
      this.clearSession();
      return true;
    } catch (error) {
      console.error('Forget me failed:', error);
      return false;
    }
  }

  generateEmailUser(): string {
    const adjectives = ['happy', 'clever', 'brave', 'bright', 'calm', 'eager', 'fair', 'kind'];
    const nouns = ['tiger', 'eagle', 'wolf', 'bear', 'lion', 'hawk', 'deer', 'fox'];
    
    const getRandomElement = (arr: string[]) => {
      const randomValues = new Uint32Array(1);
      window.crypto.getRandomValues(randomValues);
      return arr[randomValues[0] % arr.length];
    };

    const randomNumber = () => {
      const randomValues = new Uint32Array(1);
      window.crypto.getRandomValues(randomValues);
      return String(randomValues[0] % 1000).padStart(3, '0');
    };

    return `${getRandomElement(adjectives)}${getRandomElement(nouns)}${randomNumber()}`;
  }
}