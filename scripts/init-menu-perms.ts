/* 自动化：为系统管理菜单树补全权限/接口数据，并绑定超级管理员角色 */
import dotenv from 'dotenv'
import { createConnection } from 'mysql2/promise'

dotenv.config({ path: '.env.development' })

const MENU_COLS = 'id, parent_id, path, name, permission, type, icon, order_no, component, keep_alive, `show`, status, is_ext, ext_open_mode, active_menu'
const PERM_COLS = 'parent_id, path, name, permission, type, icon, order_no, component, keep_alive, `show`, status, is_ext, ext_open_mode, active_menu'

async function main() {
  const conn = await createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'nest_admin',
    multipleStatements: true,
  })

  await conn.beginTransaction()
  try {
    // 1. 菜单树：目录 100 + 菜单 101-104（type=0 目录，type=1 菜单）
    const menus = [
      [100, null, '/system', '系统管理', 'system:menu:list', 0, 'SettingOutlined', 3, '', 0, 1, 1, 0, 1, null],
      [101, 100, '/system/user', '用户管理', 'system:user:list', 1, 'UserOutlined', 1, 'system/user/index', 0, 1, 1, 0, 1, null],
      [102, 100, '/system/role', '角色管理', 'system:role:list', 1, 'TeamOutlined', 2, 'system/role/index', 0, 1, 1, 0, 1, null],
      [103, 100, '/system/menu', '菜单管理', 'system:menu:list', 1, 'MenuOutlined', 3, 'system/menu/index', 0, 1, 1, 0, 1, null],
      [104, 100, '/system/dept', '部门管理', 'system:dept:list', 1, 'ApartmentOutlined', 4, 'system/dept/index', 0, 1, 1, 0, 1, null],
    ]
    await conn.query(`INSERT INTO sys_menu (${MENU_COLS}) VALUES ?`, [menus])

    // 2. 按钮权限（type=2），挂到对应菜单下
    const perms = [
      // 用户管理 101
      [101, null, '新增', 'system:user:create', 2, '', 1, null, 0, 1, 1, 0, 1, null],
      [101, null, '查询', 'system:user:read', 2, '', 2, null, 0, 1, 1, 0, 1, null],
      [101, null, '更新', 'system:user:update', 2, '', 3, null, 0, 1, 1, 0, 1, null],
      [101, null, '删除', 'system:user:delete', 2, '', 4, null, 0, 1, 1, 0, 1, null],
      [101, null, '修改密码', 'system:user:password:update', 2, '', 5, null, 0, 1, 1, 0, 1, null],
      // 角色管理 102
      [102, null, '新增', 'system:role:create', 2, '', 1, null, 0, 1, 1, 0, 1, null],
      [102, null, '查询', 'system:role:read', 2, '', 2, null, 0, 1, 1, 0, 1, null],
      [102, null, '更新', 'system:role:update', 2, '', 3, null, 0, 1, 1, 0, 1, null],
      [102, null, '删除', 'system:role:delete', 2, '', 4, null, 0, 1, 1, 0, 1, null],
      // 菜单管理 103
      [103, null, '新增', 'system:menu:create', 2, '', 1, null, 0, 1, 1, 0, 1, null],
      [103, null, '查询', 'system:menu:read', 2, '', 2, null, 0, 1, 1, 0, 1, null],
      [103, null, '更新', 'system:menu:update', 2, '', 3, null, 0, 1, 1, 0, 1, null],
      [103, null, '删除', 'system:menu:delete', 2, '', 4, null, 0, 1, 1, 0, 1, null],
      // 部门管理 104
      [104, null, '新增', 'system:dept:create', 2, '', 1, null, 0, 1, 1, 0, 1, null],
      [104, null, '查询', 'system:dept:read', 2, '', 2, null, 0, 1, 1, 0, 1, null],
      [104, null, '更新', 'system:dept:update', 2, '', 3, null, 0, 1, 1, 0, 1, null],
      [104, null, '删除', 'system:dept:delete', 2, '', 4, null, 0, 1, 1, 0, 1, null],
    ]
    await conn.query(`INSERT INTO sys_menu (${PERM_COLS}) VALUES ?`, [perms])

    // 3. 超级管理员角色（ROOT_ROLE_ID=1）
    await conn.query(
      `INSERT INTO sys_role (id, value, name, remark, status) VALUES (1, 'admin', '管理员', '超级管理员', 1)
       ON DUPLICATE KEY UPDATE value = VALUES(value), name = VALUES(name)`,
    )

    // 4. admin 用户绑定角色 1
    await conn.query(`INSERT IGNORE INTO sys_user_roles (user_id, role_id) VALUES (1, 1)`)

    // 5. 角色 1 关联全部菜单（含权限按钮）
    await conn.query(`DELETE FROM sys_role_menus WHERE role_id = 1`)
    await conn.query(
      `INSERT INTO sys_role_menus (role_id, menu_id)
       SELECT 1, id FROM sys_menu WHERE id BETWEEN 100 AND 104 OR parent_id BETWEEN 101 AND 104`,
    )

    await conn.commit()

    // 6. 回读验证
    const [count] = await conn.query(`SELECT type, COUNT(*) AS n FROM sys_menu WHERE id >= 100 GROUP BY type ORDER BY type`)
    const [roleMenu] = await conn.query(`SELECT COUNT(*) AS n FROM sys_role_menus WHERE role_id = 1`)
    const [userRole] = await conn.query(`SELECT COUNT(*) AS n FROM sys_user_roles WHERE user_id = 1 AND role_id = 1`)
    console.log('MENU_BY_TYPE:', JSON.stringify(count))
    console.log('ROLE_MENUS:', roleMenu[0].n)
    console.log('USER_ROLE:', userRole[0].n)
  }
  catch (e) {
    await conn.rollback()
    throw e
  }
  finally {
    await conn.end()
  }
}

main().catch(e => { console.error(e); process.exit(1) })
