import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(private readonly dataSource: DataSource) {}

  async getUserByUsername(email: string): Promise<UserEntity> {
    try {
      const result = await this.dataSource
        .createQueryBuilder()
        .from(UserEntity, 'user')
        .select('user.*')
        .orWhere('email = :email', { email })
        .getRawOne();

      return result;
    } catch (err) {
      throw new Error(err);
    }
  }

  async deleteToken(email: string): Promise<void> {
    try {
      const em = this.dataSource.manager;

      await em
        .createQueryBuilder()
        .update(UserEntity)
        .set({
          token: '',
        })
        .where('email = :email', { email: email }).execute;
    } catch (err) {
      throw new Error(err);
    }
  }

  async setToken(token: string, email: string): Promise<void> {
    try {
      const em = this.dataSource.manager;

      await em
        .createQueryBuilder()
        .update(UserEntity)
        .set({
          token: token,
        })
        .where('email = :email', { email: email }).execute;
    } catch (err) {
      throw new Error(err);
    }
  }

  async getAllMenus(roleId: number) {
    try {
      const em = this.dataSource.manager;
    } catch (err) {
      Logger.error(err);
      throw new Error(err);
    }
  }

  async _getPermission(roleId: number[]) {
    try {
      const result = await this.dataSource.manager.query(
        `
          SELECT 
            id, menu_id
          FROM 
            role_permissions 
          WHERE 
            role_id = ?
            AND is_view = 1
        `,
        [roleId],
      );

      return result;
    } catch (err) {
      Logger.error(err);
      throw new Error(err);
    }
  }

  async _getPermissionAction() {
    try {
      const result = await this.dataSource.manager.query(`
          SELECT 
            id, menu_id, name
          FROM 
            menu_actions
        `);

      return result;
    } catch (err) {
      Logger.error(err);
      throw new Error(err);
    }
  }

  async _getPermissionPrivilege(roleId: number) {
    try {
      const result = await this.dataSource.manager.query(
        `
          SELECT 
            id, menu_action_id, status
          FROM 
            role_privileges
          WHERE 
            role_id = ?
        `,
        [roleId],
      );

      return result;
    } catch (err) {
      Logger.error(err);
      throw new Error(err);
    }
  }

  async checkOauthAccessToken(userId: number, authName: string) {
    try {
      const result = await this.dataSource.manager
        .createQueryBuilder()
        .select(['oat.id'])
        .from('oauth_access_tokens', 'oat')
        .where('oat.user_id = :userId', { userId })
        .andWhere('oat.name = :authName', { authName })
        .getRawOne();

      return result;
    } catch (err) {
      Logger.error(err);
      throw new Error(err);
    }
  }

  async createOauthAccessToken(data) {
    try {
      return await this.dataSource
        .createQueryBuilder()
        .insert()
        .into('oauth_access_tokens')
        .values(data)
        .execute();
    } catch (err) {
      Logger.error(err);
      throw new Error(err);
    }
  }

  async updateUser(data, userId: number) {
    try {
      return await this.dataSource
        .createQueryBuilder()
        .update('users')
        .set(data)
        .where('id = :userId', { userId })
        .execute();
    } catch (err) {
      Logger.error(err);
      throw new Error(err);
    }
  }
}
