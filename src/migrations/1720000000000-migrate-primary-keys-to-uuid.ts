import { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * The original bootstrap SQL uses numeric primary keys.  This migration is
 * deliberately data-preserving so a newly created database and an existing
 * development database both end up with the same UUID schema.
 */
export class MigratePrimaryKeysToUuid1720000000000 implements MigrationInterface {
  name = 'MigratePrimaryKeysToUuid1720000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0')

    const foreignKeys = [
      ['sys_dept', 'FK_c75280b01c49779f2323536db67'],
      ['sys_dict_item', 'FK_d68ea74fcb041c8cfd1fd659844'],
      ['sys_login_log', 'FK_3029712e0df6a28edaee46fd470'],
      ['sys_role_menus', 'FK_2b95fdc95b329d66c18f5baed6d'],
      ['sys_role_menus', 'FK_35ce749b04d57e226d059e0f633'],
      ['sys_task_log', 'FK_f4d9c36052fdb188ff5c089454b'],
      ['sys_user', 'FK_96bde34263e2ae3b46f011124ac'],
      ['sys_user_roles', 'FK_6d61c5b3f76a3419d93a4216695'],
      ['sys_user_roles', 'FK_96311d970191a044ec048011f44'],
      ['todo', 'FK_9cb7989853c4cb7fe427db4b260'],
      ['user_access_tokens', 'FK_e9d9d0c303432e4e5e48c1c3e90'],
    ]
    for (const [table, key] of foreignKeys)
      await queryRunner.query(`ALTER TABLE \`${table}\` DROP FOREIGN KEY \`${key}\``)

    const primaryTables = [
      'sys_captcha_log',
      'sys_config',
      'sys_dept',
      'sys_dict',
      'sys_dict_item',
      'sys_dict_type',
      'sys_login_log',
      'sys_menu',
      'sys_role',
      'sys_task',
      'sys_task_log',
      'sys_user',
      'todo',
      'tool_storage',
    ]
    for (const table of primaryTables) {
      await queryRunner.query(`ALTER TABLE \`${table}\` ADD \`uuid_id\` char(36) NULL`)
      await queryRunner.query(`UPDATE \`${table}\` SET \`uuid_id\` = UUID()`)
    }

    const uuidColumns = [
      ['sys_captcha_log', 'user_id', 'sys_user'],
      ['sys_login_log', 'user_id', 'sys_user'],
      ['sys_user_roles', 'user_id', 'sys_user'],
      ['sys_user_roles', 'role_id', 'sys_role'],
      ['sys_role_menus', 'role_id', 'sys_role'],
      ['sys_role_menus', 'menu_id', 'sys_menu'],
      ['sys_task_log', 'task_id', 'sys_task'],
      ['sys_user', 'dept_id', 'sys_dept'],
      ['todo', 'user_id', 'sys_user'],
      ['tool_storage', 'user_id', 'sys_user'],
      ['user_access_tokens', 'user_id', 'sys_user'],
      ['sys_menu', 'parent_id', 'sys_menu'],
      ['sys_dept', 'parentId', 'sys_dept'],
    ]
    for (const [table, column, referencedTable] of uuidColumns) {
      await queryRunner.query(`ALTER TABLE \`${table}\` MODIFY \`${column}\` char(36) NULL`)
      await queryRunner.query(`
        UPDATE \`${table}\` AS source
        INNER JOIN \`${referencedTable}\` AS target ON source.\`${column}\` = target.id
        SET source.\`${column}\` = target.uuid_id
      `)
    }

    const auditColumns = [
      ['sys_dept', 'create_by'],
      ['sys_dept', 'update_by'],
      ['sys_dict', 'create_by'],
      ['sys_dict', 'update_by'],
      ['sys_dict_item', 'create_by'],
      ['sys_dict_item', 'update_by'],
      ['sys_dict_type', 'create_by'],
      ['sys_dict_type', 'update_by'],
      ['sys_menu', 'create_by'],
      ['sys_menu', 'update_by'],
      ['sys_role', 'create_by'],
      ['sys_role', 'update_by'],
    ]
    for (const [table, column] of auditColumns) {
      await queryRunner.query(`ALTER TABLE \`${table}\` MODIFY \`${column}\` char(36) NULL`)
      await queryRunner.query(`
        UPDATE \`${table}\` AS source
        INNER JOIN \`sys_user\` AS user ON source.\`${column}\` = user.id
        SET source.\`${column}\` = user.uuid_id
      `)
    }

    for (const table of primaryTables) {
      await queryRunner.query(`
        ALTER TABLE \`${table}\`
        DROP PRIMARY KEY,
        CHANGE \`id\` \`legacy_id\` int NOT NULL,
        CHANGE \`uuid_id\` \`id\` char(36) NOT NULL,
        ADD PRIMARY KEY (\`id\`)
      `)
    }

    for (const table of primaryTables)
      await queryRunner.query(`ALTER TABLE \`${table}\` DROP COLUMN \`legacy_id\``)

    await queryRunner.query('ALTER TABLE `sys_dept` ADD CONSTRAINT `FK_c75280b01c49779f2323536db67` FOREIGN KEY (`parentId`) REFERENCES `sys_dept` (`id`) ON DELETE SET NULL')
    await queryRunner.query('ALTER TABLE `sys_dict_item` ADD CONSTRAINT `FK_d68ea74fcb041c8cfd1fd659844` FOREIGN KEY (`type_id`) REFERENCES `sys_dict_type` (`id`) ON DELETE CASCADE')
    await queryRunner.query('ALTER TABLE `sys_login_log` ADD CONSTRAINT `FK_3029712e0df6a28edaee46fd470` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE')
    await queryRunner.query('ALTER TABLE `sys_role_menus` ADD CONSTRAINT `FK_2b95fdc95b329d66c18f5baed6d` FOREIGN KEY (`menu_id`) REFERENCES `sys_menu` (`id`) ON DELETE CASCADE')
    await queryRunner.query('ALTER TABLE `sys_role_menus` ADD CONSTRAINT `FK_35ce749b04d57e226d059e0f633` FOREIGN KEY (`role_id`) REFERENCES `sys_role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE')
    await queryRunner.query('ALTER TABLE `sys_task_log` ADD CONSTRAINT `FK_f4d9c36052fdb188ff5c089454b` FOREIGN KEY (`task_id`) REFERENCES `sys_task` (`id`)')
    await queryRunner.query('ALTER TABLE `sys_user` ADD CONSTRAINT `FK_96bde34263e2ae3b46f011124ac` FOREIGN KEY (`dept_id`) REFERENCES `sys_dept` (`id`)')
    await queryRunner.query('ALTER TABLE `sys_user_roles` ADD CONSTRAINT `FK_6d61c5b3f76a3419d93a4216695` FOREIGN KEY (`role_id`) REFERENCES `sys_role` (`id`)')
    await queryRunner.query('ALTER TABLE `sys_user_roles` ADD CONSTRAINT `FK_96311d970191a044ec048011f44` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE')
    await queryRunner.query('ALTER TABLE `todo` ADD CONSTRAINT `FK_9cb7989853c4cb7fe427db4b260` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`)')
    await queryRunner.query('ALTER TABLE `user_access_tokens` ADD CONSTRAINT `FK_e9d9d0c303432e4e5e48c1c3e90` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE')

    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1')
  }

  public async down(): Promise<void> {
    throw new Error('UUID primary-key migration cannot be safely reversed.')
  }
}
