<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row>
        <el-col :span="6">
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 商品分类列表区域 -->
      <tree-table
      :data="catelist"
      :columns="columns"
      :selection-type="false"
      :expand-type="false"
      show-index
      index-text='#'
      border
      :show-row-hover="false"
      class="tree-table">
        <template slot="valid" slot-scope='scope'>
            <i class="el-icon-success" style="color: lightgreen" v-if="scope.row.cat_deleted === false"></i>
            <i class="el-icon-error" style="color: red" v-else></i>
        </template>
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <template slot="operate">
          <el-button type="primary" size="mini"><i class="el-icon-edit"></i> 编辑</el-button>
          <el-button type="danger" size="mini"><i class="el-icon-delete"></i> 删除</el-button>
        </template>
      </tree-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 7, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed">
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- options用来指定数据源 -->
          <!-- props用来指定配置对象 -->
          <el-cascader
          :options="parentCateList"
          :props="cascadeProps"
          v-model="selectedKeys"
          @change="parentCateChange"
          clearable
          >
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类数据列表
      catelist: [],
      // 查找数据信息
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 总数据条数
      total: 0,
      // 表格每列配置
      columns: [{
        label:'分类名称',
        prop: 'cat_name'
      },
      {
        label: '是否有效',
        prop: 'cat_deleted',
        type: 'template',
        template: 'valid'
      },
      {
        label: '排序',
        prop: 'cat_level',
        type: 'template',
        template: 'order'
      },
      {
        label: '操作',
        type: 'template',
        template: 'operate'
      }],
      addCateDialogVisible: false,
      // 添加分类的表单数据
      addCateForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      // 添加分类的表单验证规则
      addCateFormRules: {
        cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      },
      // 添加分类的父级列表
      parentCateList: [],
      cascadeProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: "children",
        checkStrictly: true,
        expandTrigger:"hover"
      },
      selectedKeys: []
    }
  },
  created() {
    this.getCatelist()
  },
  methods: {
    async getCatelist() {
      const {data: res} = await this.$http.get('/categories', {params: this.queryInfo})
      // console.log(res);
      if(res.meta.status !== 200) {
        this.$message.error('获取商品分类数据失败！')
      }
      this.catelist = res.data.result
      this.total = res.data.total
    },
    // 监听页面显示个数
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCatelist()
    },
    // 监听页码的改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCatelist()
    },
    // 弹出添加商品分类对话框
    showAddCateDialog() {
      this.getAddCatelist()
      this.addCateDialogVisible = true
    },
    // 获取添加商品分类数据列表
    async getAddCatelist() {
      const {data: res} = await this.$http.get('/categories',{ params:{type: 2} })
      if(res.meta.status !== 200) {
        this.$message.error('获取商品分类数据失败！')
      }
      // console.log(res.data);
      this.parentCateList = res.data
    },
    // 选择项发生变化触发这个函数
    parentCateChange() {
      // console.log(this.selectedKeys);
      if(this.selectedKeys.length > 0) {
        // 父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      }else {
        // 父级分类的id
        this.addCateForm.cat_pid = 0
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0
      }
    },
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if(!valid) return
        const {data: res} = await this.$http.post('categories',this.addCateForm)
        if(res.meta.status !== 200) {
          this.$message.error('添加分类失败！')
        }
        this.addCateDialogVisible = false
        this.getCatelist()
        this.$message.success('添加分类成功！')
      })
    },
    // 关闭对话框，清空数据
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    }
  }
}
</script>

<style lang="less" scoped>
  .tree-table{
    margin: 15px 0;
  }

  .el-cascader {
    width: 100%
  }

</style>