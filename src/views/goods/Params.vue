<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-alert
        title="注意：只允许第三级分类设置相关参数"
        type="warning"
        show-icon
        :closable="false"
      ></el-alert>
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader
            :options="goodsList"
            :props="cascaderPorps"
            v-model="selectedKeys"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- 标签页区域 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <!-- 动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加参数</el-button
          >
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, id) in scope.row.attr_vals"
                  :key="id"
                  closable
                  @close="removeTag(id, scope.row)"
                  >{{ item }}</el-tag
                >
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  ype="primary"
                  size="mini"
                  icon="el-icon-delete"
                  @click="removeParam(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加属性</el-button
          >
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, id) in scope.row.attr_vals"
                  :key="id"
                  closable
                  @close="removeTag(id, scope.row)"
                  >{{ item }}</el-tag
                >
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-delete"
                  @click="removeParam(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加对话框 -->
    <el-dialog
      :title="'添加' + addTitle"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item :label="addTitle" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑修改属性对话框 -->
    <el-dialog
      :title="'添加' + addTitle"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item :label="addTitle" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 联级选择器的数据
      goodsList: [],
      cascaderPorps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      selectedKeys: [],

      // 标签页的数据
      activeName: 'many',

      // 动态参数数据
      manyTableData: [],
      // 静态属性数据
      onlyTableData: [],

      // 控制添加对话框的显示
      addDialogVisible: false,
      // 对话框数据
      addForm: {
        attr_name: ''
      },
      addFormRules: {
        attr_name: [{ required: true, message: '不能为空', trigger: 'blur' }]
      },
      // 修改属性对话框的显示与隐藏
      editDialogVisible: false,
      // 修改对话框表单数据
      editForm: {},
      editFormRules: {
        attr_name: [{ required: true, message: '不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    // 获取商品数据
    async getGoodsList() {
      const { data: res } = await this.$http.get('/categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品数据失败！')
      }
      this.goodsList = res.data
    },
    // 联级选择器选择时触发
    async handleChange() {
      this.getParamsDate()
    },
    // 标签页点击事件
    handleClick() {
      this.getParamsDate()
    },
    // 获取参数列表数据
    async getParamsDate() {
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      console.log(this.selectedKeys)

      const { data: res } = await this.$http.get(
        `categories/${this.selectedId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败！')
      }
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制输入框和添加按钮的显示
        item.inputVisible = false
        // 绑定输入框的数据
        item.inputValue = ''
      })
      // 判断需要渲染的是动态参数还是静态属性
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 对话框关闭触发,重置表单数据
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 提交添加属性对话框
    async addParams() {
      const { data: res } = await this.$http.post(
        `categories/${this.selectedId}/attributes`,
        {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        }
      )
      if (res.meta.status !== 201) {
        return this.$message.error('添加属性失败！')
      }
      this.$message.success('添加属性成功！')
      this.getParamsDate()
      this.addDialogVisible = false
    },
    // 点击打开修改对话框
    async showEditDialog(attr_id) {
      // 根据ID查询参数
      const {
        data: res
      } = await this.$http.get(
        `categories/${this.selectedId}/attributes/${attr_id}`,
        { params: { attr_sel: this.activeName } }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数失败！')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 提交修改对话框数据
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        const {
          data: res
        } = await this.$http.put(
          `categories/${this.selectedId}/attributes/${this.editForm.attr_id}`,
          { attr_name: this.editForm.attr_name, attr_sel: this.activeName }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('更新参数失败！')
        }
        this.$message.success('更新参数成功！')
        this.getParamsDate()
        this.editDialogVisible = false
      })
    },
    // 关闭修改对话框触发
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 删除参数
    async removeParam(attr_id) {
      const confirmResult = await this.$confirm(
        '将删除该属性, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.error('你取消了删除')
      }

      const { data: res } = await this.$http.delete(
        `categories/${this.selectedId}/attributes/${attr_id}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败！')
      }

      this.$message.success('删除参数成功！')
      this.getParamsDate()
    },
    // 键盘按下回车或失去焦点时触发
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 如果没有被return，则证明输入了内容
      row.attr_vals.push(row.inputValue)
      row.inputValue = ''
      // 发起请求，更新数据
      this.saveTag(row)
    },
    // 将对 tag 标签的操作保存
    async saveTag(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.selectedId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('更新失败！')
      }
      this.$message.success('更新成功！')
    },
    // 显示输入框
    showInput(row) {
      row.inputVisible = true
      // 点击后输入框自动获取焦点
      // $nextTick 作用：在页面元素重新渲染后，才会执行回调函数
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 移除tag标签
    removeTag(id, row) {
      row.attr_vals.splice(id, 1)
      this.saveTag(row)
    }
  },
  computed: {
    // 控制按钮是否可点击
    isBtnDisabled() {
      if (this.selectedKeys.length !== 3) {
        return true
      }
      return false
    },
    // 选中商品的id
    selectedId() {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      }
      return null
    },
    // 添加对话框的计算属性
    addTitle() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 20px 0;
}

.el-tag {
  margin: 0 5px;
}

.input-new-tag {
  width: 120px;
  margin: 0 5px;
}
</style>
