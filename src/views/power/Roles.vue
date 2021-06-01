<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot='scope'>
            <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'tagcenter']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
              <el-col :span="6">
                <el-tag closable @close='removeRight(scope.row, item1.id)'>
                  {{item1.authName}}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="18">
                <el-row :class="[i2 === 0 ? '' : 'bdtop', 'tagcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                  <el-col :span="8">
                    <el-tag type="success" closable  @close='removeRight(scope.row, item2.id)'>
                      {{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="16">
                    <el-tag type="warning" v-for="(item3) in item2.children" :key="item3.id" closable @close='removeRight(scope.row, item3.id)'>
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="350px">
          <template v-slot='scope'>
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRole(scope.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showRightsDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog
      title="提示"
      :visible.sync="addRoleDialogVisible"
      width="50%"
      @closed='addRoleDialogClosed'>
      <el-form label-width="100px" :model="addRoleForm" ref="addRoleRef" :rules="addRoleRules">
        <el-form-item label="角色名称" prop='roleName'>
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog
      title="提示"
      :visible.sync="editRoleDialogVisible"
      width="50%">
      <el-form label-width="100px" :model="editRoleForm" ref="editRoleRef" :rules="editRoleRules">
        <el-form-item label="角色名称" prop='roleName'>
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="rightsDialogVisible"
      width="50%"
      @close='setRightsDialogClosed'>
      <el-tree :data="rightsList" :props="rightsProps" ref="treeRef" node-key='id' show-checkbox default-expand-all :default-checked-keys='defaultRights'></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      // 添加用户
      addRoleDialogVisible: false,
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      addRoleRules: {
        roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
      },
      // 编辑用户
      editRoleDialogVisible: false,
      editRoleForm: {},
      editRoleRules: {
        roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
      },
      // 分配权限
      rightsDialogVisible: false,
      // 树形控件的权限数据
      rightsList: {},
      rightsProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认勾选的权限
      defaultRights: [],
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const {data: res} = await this.$http.get('/roles')
      // console.log(res);
      if(res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.rolesList = res.data
    },
    // 添加角色对话框关闭事件
    addRoleDialogClosed() {
      this.$refs.addRoleRef.resetFields()
    },
    // 添加角色
    addRole() {
      this.$refs.addRoleRef.validate(async valid => {
        const {data: res} = await this.$http.post('/roles', this.addRoleForm)
        if(res.meta.status !== 201) {
          return this.$message.error('添加角色失败！')
        }
        this.addRoleDialogVisible = false
        this.$message.success('添加角色成功！')
        this.getRolesList()
      })
    },
    // 展示编辑对话框
    async showEditDialog(id) {
      const {data: res} = await this.$http.get(`roles/${id}`)
      if(res.meta.status !== 200) {
        return this.$message.error('获取失败！')
      }
      this.editRoleForm = res.data
      this.editRoleDialogVisible = true
    },
    // 修改角色
    async editRole() {
      const {data: res} = await this.$http.put(`roles/${this.editRoleForm.roleId}`,this.editRoleForm)
      if(res.meta.status !== 200) {
        return this.$message.error('修改失败！')
      }
      this.editRoleDialogVisible = false
      this.$message.success('修改角色成功！')
      this.getRolesList()
    },
    // 删除角色
    async removeRole(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if(confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }

      const {data: res} = await this.$http.delete(`roles/${id}`)
      if(res.meta.status !== 200) {
         return this.$message.error('删除角色失败！')
      }
      this.$message.success('删除角色成功！')
      this.getRolesList()
    },
    // 删除权限
    async removeRight(role, rightid) {
        const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)

        if(confirmResult !== 'confirm') {
          return this.$message.error('你取消了删除操作！')
        }

        const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rightid}`)
        if(res.meta.status !== 200) {
          return this.$message.error('获取权限数据失败！')
        }
        role.children = res.data
    },
    // 打开分配权限对话框
    async showRightsDialog(role) {
      this.roleId = role.id
      const {data: res} = await this.$http.get('rights/tree')
      if(res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败！')
      }
      // console.log(res);
      this.rightsList = res.data
      this.getLeafKeys(role, this.defaultRights)

      this.rightsDialogVisible = true
    },
    // 通过递归的形式，获取角色下所有三级权限的id
    getLeafKeys(node, arr) {
      // 如果当前节点不包含children属性，就是三级权限
      if(!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 关闭对话框时清空已选
    setRightsDialogClosed() {
      this.defaultRights = []
    },
    // 提交分配权限
    async allotRights() {
      const keys =[
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const allKeys = keys.join(',')

      const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids: allKeys})
      if(res.meta.status !== 200) {
        return this.$message.error('更新权限失败！')
      }
      this.$message.success('更新权限成功！')
      this.getRolesList()

      this.rightsDialogVisible = false
    }
    
  },
  
}
</script>

<style lang="less" scoped>
  .el-tag {
    margin: 10px;
  }

  .bdtop {
    border-top: 1px solid #eee;
  }

  .bdbottom {
    border-bottom: 1px solid #eee;
  }

  .tagcenter {
    display: flex;
    align-items: center;
  }
</style>