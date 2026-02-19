import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabaseClient: SupabaseClient;
  private supabaseAdmin: SupabaseClient;

  constructor(private configService: ConfigService) {
    const key = this.configService.get<string>('SUPABASE_ANON_KEY')!;
    const url = this.configService.get<string>('SUPABASE_URL')!;
    const serviceRoleKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    )!;

    this.supabaseClient = createClient(url, key);
    this.supabaseAdmin = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  get client(): SupabaseClient {
    return this.supabaseClient;
  }

  get admin(): SupabaseClient {
    return this.supabaseAdmin;
  }

  async uploadFile(file: Express.Multer.File, bucket: string, path: string) {
    const { data, error } = await this.supabaseAdmin.storage
      .from(bucket)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      throw new InternalServerErrorException(
        `Supabase Storage Error: ${error.message}`,
      );
    }

    const {
      data: { publicUrl },
    } = this.client.storage.from(bucket).getPublicUrl(path);

    return publicUrl;
  }
}
