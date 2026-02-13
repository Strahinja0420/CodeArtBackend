import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabaseClient: SupabaseClient;

  constructor(private configService: ConfigService) {
    const key = this.configService.get<string>('SUPABASE_ANON_KEY')!;
    const url = this.configService.get<string>('SUPABASE_URL')!;

    this.supabaseClient = createClient(url, key);
  }

  get client(): SupabaseClient {
    return this.supabaseClient;
  }
}
